import { useState, useEffect } from 'react'
import { useOrganization } from '@/contexts/OrganizationContext'
import { useAuth } from '@/contexts/AuthContext'
import { useSidebar } from '@/contexts/SidebarContext'
import { Sidebar } from '@/components/Sidebar'
import { TopBar } from '@/components/TopBar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { updateOrganization, getOrganizationUsers, updateUserRole, associateUserToOrganization, disassociateUserFromOrganization } from '@/lib/firebase/organizations'
import { Loader2, Save, AlertCircle, Shield, User, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

type PageMode = 'geral' | 'usuarios'

export function OrganizationSettingsPage() {
  const { organization, isAdmin, refreshOrganization } = useOrganization()
  const { user } = useAuth()
  const { isCollapsed } = useSidebar()
  const [mode, setMode] = useState<PageMode>('geral')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [users, setUsers] = useState<Array<{
    id: string
    name: string
    email: string
    role: 'admin' | 'member'
    isAssociated: boolean
    createdAt: Date
    emailVerified: boolean
  }>>([])
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)

  // Estados do formulário
  const [name, setName] = useState('')
  const [tradeName, setTradeName] = useState('')
  const [description, setDescription] = useState('')
  const [defaultSender, setDefaultSender] = useState('')
  const [defaultSignature, setDefaultSignature] = useState('')
  const [campaignCodePrefix, setCampaignCodePrefix] = useState('')
  const [primaryColor, setPrimaryColor] = useState('')
  const [logoUrl, setLogoUrl] = useState('')

  // Carregar dados da organização
  useEffect(() => {
    if (organization) {
      setName(organization.name || '')
      setTradeName(organization.tradeName || '')
      setDescription(organization.description || '')
      setDefaultSender(organization.settings.defaultSender || '')
      setDefaultSignature(organization.settings.defaultSignature || '')
      setCampaignCodePrefix(organization.settings.campaignCodePrefix || '')
      setPrimaryColor(organization.theme.primaryColor || '#D97B35')
      setLogoUrl(organization.theme.logoUrl || '')
    }
  }, [organization])

  // Carregar usuários da organização
  useEffect(() => {
    const loadUsers = async () => {
      if (!organization) return

      try {
        setIsLoadingUsers(true)
        const orgUsers = await getOrganizationUsers(organization.id)
        setUsers(orgUsers)
      } catch (error) {
        console.error('Erro ao carregar usuários:', error)
        toast.error('Erro ao carregar usuários')
      } finally {
        setIsLoadingUsers(false)
      }
    }

    loadUsers()
  }, [organization])

  const handleUpdateUserRole = async (userId: string, newRole: 'admin' | 'member') => {
    if (!organization || !user) return

    try {
      setUpdatingUserId(userId)

      await updateUserRole(organization.id, userId, newRole, user.id)
      
      // Atualizar lista local
      setUsers(users.map(u => 
        u.id === userId ? { ...u, role: newRole } : u
      ))

      // Refresh da organização para atualizar adminUsers
      await refreshOrganization()

      toast.success('Permissão atualizada!', {
        description: `Usuário agora é ${newRole === 'admin' ? 'administrador' : 'membro'}.`,
      })
    } catch (error: any) {
      console.error('Erro ao atualizar permissão:', error)
      toast.error('Erro ao atualizar', {
        description: error.message || 'Não foi possível atualizar a permissão.',
      })
    } finally {
      setUpdatingUserId(null)
    }
  }

  const handleAssociateUser = async (userId: string, userEmail: string) => {
    if (!organization || !user) return

    try {
      setUpdatingUserId(userId)

      await associateUserToOrganization(organization.id, userId, userEmail, user.id)
      
      // Atualizar lista local
      setUsers(users.map(u => 
        u.id === userId ? { ...u, isAssociated: true } : u
      ))

      toast.success('Usuário associado!', {
        description: 'O usuário agora pode acessar os dados da organização.',
      })
    } catch (error: any) {
      console.error('Erro ao associar usuário:', error)
      toast.error('Erro ao associar', {
        description: error.message || 'Não foi possível associar o usuário.',
      })
    } finally {
      setUpdatingUserId(null)
    }
  }

  const handleDisassociateUser = async (userId: string) => {
    if (!organization || !user) return

    try {
      setUpdatingUserId(userId)

      await disassociateUserFromOrganization(organization.id, userId, user.id)
      
      // Atualizar lista local
      setUsers(users.map(u => 
        u.id === userId ? { ...u, isAssociated: false } : u
      ))

      toast.success('Usuário desassociado!', {
        description: 'O usuário não pode mais acessar os dados da organização.',
      })
    } catch (error: any) {
      console.error('Erro ao desassociar usuário:', error)
      toast.error('Erro ao desassociar', {
        description: error.message || 'Não foi possível desassociar o usuário.',
      })
    } finally {
      setUpdatingUserId(null)
    }
  }

  // Verificar se é admin
  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <span title="Ícone de círculo de alerta">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500" aria-label="Ícone de círculo de alerta" />
          </span>
          <h2 className="mt-4 text-xl font-bold text-neutral-800">
            Acesso Negado
          </h2>
          <p className="mt-2 text-neutral-600">
            Apenas administradores podem acessar esta página.
          </p>
        </div>
      </div>
    )
  }

  const handleSave = async () => {
    if (!organization || !user) return

    try {
      setIsLoading(true)

      await updateOrganization(
        organization.id,
        {
          name,
          tradeName,
          description,
          theme: {
            ...organization.theme,
            primaryColor,
            logoUrl,
          },
          settings: {
            ...organization.settings,
            defaultSender,
            defaultSignature,
            campaignCodePrefix,
          },
        },
        user.id
      )

      await refreshOrganization()

      toast.success('Configurações salvas!', {
        description: 'As alterações foram aplicadas com sucesso.',
      })
    } catch (error) {
      console.error('Erro ao salvar:', error)
      toast.error('Erro ao salvar', {
        description: 'Não foi possível salvar as configurações.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!organization) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span title="Ícone de carregamento girando">
          <Loader2 className="h-8 w-8 animate-spin text-neutral-400" aria-label="Ícone de carregamento girando" />
        </span>
      </div>
    )
  }

  const handleGeralMode = () => setMode('geral')
  const handleUsuariosMode = () => setMode('usuarios')

  return (
    <div className="min-h-screen">
      <Sidebar />

      <main
        className={cn(
          'transition-all duration-300',
          isCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        )}
      >
        <div className="mx-auto max-w-7xl space-y-6 p-6 pb-32">
          <TopBar
            title="Painel de Administração"
            mode={mode}
            type="admin"
            onNovoCliente={handleGeralMode}
            onBuscarCliente={handleUsuariosMode}
          />

          {mode === 'geral' && (
            <div className="space-y-6">
              {/* Informações Básicas */}
              <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="mb-4 text-lg font-semibold text-neutral-800">
              Informações Básicas
            </h3>
            
            <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-700">
                      Nome da Organização
                    </label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: IASA Brasil"
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-700">
                      Nome Comercial
                    </label>
                    <Input
                      value={tradeName}
                      onChange={(e) => setTradeName(e.target.value)}
                      placeholder="Ex: IASA"
                      disabled={isLoading}
                    />
                  </div>
                </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                  Descrição
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descrição da organização..."
                  disabled={isLoading}
                  rows={3}
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="mb-4 text-lg font-semibold text-neutral-800">
              Configurações
            </h3>
            
            <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-neutral-700">
                    Remetente Padrão
                  </label>
                  <Input
                    value={defaultSender}
                    onChange={(e) => setDefaultSender(e.target.value)}
                    placeholder="Ex: IASA Brasil"
                    disabled={isLoading}
                  />
                  <p className="mt-1 text-xs text-neutral-500">
                    Usado automaticamente ao criar novas campanhas
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-neutral-700">
                    Assinatura Padrão
                  </label>
                  <Textarea
                    value={defaultSignature}
                    onChange={(e) => setDefaultSignature(e.target.value)}
                    placeholder="Ex: Atenciosamente,&#10;Equipe IASA"
                    disabled={isLoading}
                    rows={3}
                  />
                  <p className="mt-1 text-xs text-neutral-500">
                    Assinatura usada em emails e comunicações
                  </p>
                </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                  Prefixo de Código de Campanha
                </label>
                <Input
                  value={campaignCodePrefix}
                  onChange={(e) => setCampaignCodePrefix(e.target.value.toUpperCase())}
                  placeholder="Ex: IASA"
                  disabled={isLoading}
                  maxLength={10}
                />
                <p className="mt-1 text-xs text-neutral-500">
                  Usado para gerar códigos únicos (Ex: IASA-2025-001)
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="mb-4 text-lg font-semibold text-neutral-800">
              Personalização Visual
            </h3>
            
            <div className="space-y-4">
              {/* URL da Logo */}
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                  URL da Logo
                </label>
                <Input
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://exemplo.com/logo.png"
                  disabled={isLoading}
                />
                <p className="mt-1 text-xs text-neutral-500">
                  Cole a URL da imagem da logo. Use serviços como Imgur, Cloudinary ou hospede em seu servidor.
                </p>
                
                {/* Preview da Logo */}
                {logoUrl && (
                  <div className="mt-3">
                    <p className="mb-2 text-xs font-medium text-neutral-600">Preview:</p>
                    <div className="flex h-20 w-20 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 p-2">
                      <img
                        src={logoUrl}
                        alt={`Preview da logo da organização ${organization.name}`}
                        className="h-full w-full object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Cor da Marca */}
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                  Cor da Marca
                </label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    disabled={isLoading}
                    className="h-10 w-16 cursor-pointer"
                  />
                  <Input
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    placeholder="#D97B35"
                    disabled={isLoading}
                    className="flex-1"
                  />
                </div>
                <p className="mt-1 text-xs text-neutral-500">
                  As variações de cor serão calculadas automaticamente
                </p>
              </div>

              {/* Preview */}
              <div className="rounded-lg bg-neutral-50 p-4">
                <p className="mb-3 text-sm font-medium text-neutral-700">
                  Prévia
                </p>
                <button
                  className="rounded-lg px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:shadow"
                  style={{ backgroundColor: primaryColor }}
                >
                  Botão Exemplo
                </button>
              </div>
            </div>
          </div>

              {/* Botão Salvar */}
              <div className="flex justify-end">
                <Button
                  onClick={handleSave}
                  disabled={isLoading}
                  size="lg"
                  className="gap-2"
                  style={{ backgroundColor: primaryColor }}
                >
                  {isLoading ? (
                    <>
                      <span title="Ícone de carregamento girando">
                        <Loader2 className="h-5 w-5 animate-spin" aria-label="Ícone de carregamento girando" />
                      </span>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <span title="Ícone de disco de salvar">
                        <Save className="h-5 w-5" aria-label="Ícone de disco de salvar" />
                      </span>
                      Salvar Alterações
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {mode === 'usuarios' && (
            <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="mb-4 text-lg font-semibold text-neutral-800">
              Usuários da Organização
            </h3>

            {isLoadingUsers ? (
              <div className="flex items-center justify-center py-8">
                <span title="Ícone de carregamento girando">
                  <Loader2 className="h-6 w-6 animate-spin text-neutral-400" aria-label="Ícone de carregamento girando" />
                </span>
              </div>
            ) : users.length === 0 ? (
              <div className="py-8 text-center text-neutral-500">
                Nenhum usuário encontrado
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-200">
                      <th className="pb-3 text-left text-sm font-medium text-neutral-600">
                        Nome
                      </th>
                      <th className="pb-3 text-left text-sm font-medium text-neutral-600">
                        Email
                      </th>
                      <th className="pb-3 text-center text-sm font-medium text-neutral-600">
                        Status
                      </th>
                      <th className="pb-3 text-center text-sm font-medium text-neutral-600">
                        Permissão
                      </th>
                      <th className="pb-3 text-right text-sm font-medium text-neutral-600">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((orgUser) => (
                      <tr
                        key={orgUser.id}
                        className="border-b border-neutral-100 last:border-0"
                      >
                        <td className="py-3 text-sm text-neutral-800">
                          {orgUser.name}
                          {orgUser.id === user?.id && (
                            <span className="ml-2 text-xs text-neutral-500">(você)</span>
                          )}
                        </td>
                        <td className="py-3 text-sm text-neutral-600">
                          {orgUser.email}
                        </td>
                        <td className="py-3">
                          <div className="flex flex-col items-center gap-1">
                            {orgUser.emailVerified && (
                              <div title="Email verificado">
                                <span title="Ícone de círculo com marca de seleção">
                                  <CheckCircle className="h-4 w-4 text-green-600" aria-label="Ícone de círculo com marca de seleção" />
                                </span>
                              </div>
                            )}
                            {orgUser.isAssociated ? (
                              <span className="text-xs text-green-600">Associado</span>
                            ) : (
                              <span className="text-xs text-neutral-400">Não associado</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 text-center">
                          {orgUser.role === 'admin' ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                              <span title="Ícone de escudo">
                                <Shield className="h-3 w-3" aria-label="Ícone de escudo" />
                              </span>
                              Admin
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-700">
                              <span title="Ícone de usuário">
                                <User className="h-3 w-3" aria-label="Ícone de usuário" />
                              </span>
                              Membro
                            </span>
                          )}
                        </td>
                        <td className="py-3 text-right">
                          {orgUser.id === user?.id ? (
                            <span className="text-xs text-neutral-400">—</span>
                          ) : (
                            <div className="flex justify-end gap-2">
                              {/* Botão de Associação */}
                              {orgUser.isAssociated ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDisassociateUser(orgUser.id)}
                                  disabled={
                                    updatingUserId === orgUser.id || 
                                    isLoading || 
                                    orgUser.role === 'admin'
                                  }
                                  className="w-[110px] text-xs"
                                  title={orgUser.role === 'admin' ? 'Remova o admin primeiro' : 'Desassociar usuário'}
                                >
                                  {updatingUserId === orgUser.id ? (
                                    <span title="Ícone de carregamento girando">
                                      <Loader2 className="h-3 w-3 animate-spin" aria-label="Ícone de carregamento girando" />
                                    </span>
                                  ) : (
                                    'Desassociar'
                                  )}
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleAssociateUser(orgUser.id, orgUser.email)}
                                  disabled={updatingUserId === orgUser.id || isLoading}
                                  className="w-[110px] text-xs"
                                >
                                  {updatingUserId === orgUser.id ? (
                                    <span title="Ícone de carregamento girando">
                                      <Loader2 className="h-3 w-3 animate-spin" aria-label="Ícone de carregamento girando" />
                                    </span>
                                  ) : (
                                    'Associar'
                                  )}
                                </Button>
                              )}

                              {/* Botão de Admin (só para usuários associados) */}
                              {orgUser.isAssociated && (
                                orgUser.role === 'admin' ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleUpdateUserRole(orgUser.id, 'member')}
                                    disabled={updatingUserId === orgUser.id || isLoading}
                                    className="w-[120px] text-xs"
                                  >
                                    {updatingUserId === orgUser.id ? (
                                      <span title="Ícone de carregamento girando">
                                      <Loader2 className="h-3 w-3 animate-spin" aria-label="Ícone de carregamento girando" />
                                    </span>
                                    ) : (
                                      'Remover Admin'
                                    )}
                                  </Button>
                                ) : (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleUpdateUserRole(orgUser.id, 'admin')}
                                    disabled={updatingUserId === orgUser.id || isLoading}
                                    className="w-[120px] text-xs"
                                  >
                                    {updatingUserId === orgUser.id ? (
                                      <span title="Ícone de carregamento girando">
                                      <Loader2 className="h-3 w-3 animate-spin" aria-label="Ícone de carregamento girando" />
                                    </span>
                                    ) : (
                                      'Tornar Admin'
                                    )}
                                  </Button>
                                )
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <p className="mt-4 text-xs text-neutral-500">
              Mostrando todos os usuários registrados com emails dos domínios: {organization?.emailDomains.map(d => d.domain).join(', ')}
            </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}


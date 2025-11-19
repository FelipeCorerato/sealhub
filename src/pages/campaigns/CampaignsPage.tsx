import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { TopBar } from '@/components/TopBar'
import { CampaignForm } from '@/components/CampaignForm'
import { ClientSearchBar } from '@/components/ClientSearchBar'
import { ClientSelectionTable } from '@/components/ClientSelectionTable'
import { CampaignSearchBar } from '@/components/CampaignSearchBar'
import { CampaignResultsTable } from '@/components/CampaignResultsTable'
import { Button } from '@/components/ui/button'
import { FileText, Search } from 'lucide-react'
import type { Company, CampaignInstructions } from '@/types'
import {
  searchCompaniesByName,
  searchCompaniesByCNPJ,
  getAllCompanies,
} from '@/lib/firebase/companies'
import {
  createCampaign,
  searchCampaignsWithCompaniesByName,
  searchCampaignsByCompanyName,
  getAllCampaignsWithCompanies,
  updateCampaign,
  type CampaignWithCompanies,
} from '@/lib/firebase/campaigns'
import { getUserProfiles, type UserProfile } from '@/lib/firebase/users'
import { useAuth } from '@/contexts/AuthContext'
import { useOrganization } from '@/contexts/OrganizationContext'
import { useSidebar } from '@/contexts/SidebarContext'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { printSeals } from '@/lib/seal-generator'

export function CampaignsPage() {
  const { user } = useAuth()
  const { organization } = useOrganization()
  const { isCollapsed } = useSidebar()
  const [mode, setMode] = useState<'add' | 'search' | 'edit'>('add')
  
  // Estados para criação de campanha
  const [campaignName, setCampaignName] = useState('')
  const [sender, setSender] = useState('M7 Comercial Importadora e Exportadora LTDA\nRua Machado de Assis - 581 B\nVila Lutfalla - São Carlos, SP\nCEP: 13.570-673')
  const [observation, setObservation] = useState('')
  const [instructions, setInstructions] = useState<CampaignInstructions>({
    fragile: true,
    attention: true,
    handleWithCare: true,
    thisWayUp: true,
  })

  // Estado para campanha sendo editada (ao adicionar mais clientes)
  const [editingCampaign, setEditingCampaign] = useState<CampaignWithCompanies | null>(null)

  const [companies, setCompanies] = useState<Company[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Estados para busca de campanhas
  const [searchResults, setSearchResults] = useState<CampaignWithCompanies[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [userProfiles, setUserProfiles] = useState<Map<string, UserProfile>>(new Map())

  const handleSearchByCNPJ = async (cnpj: string) => {
    if (!organization) return
    
    setIsLoading(true)
    try {
      const results = await searchCompaniesByCNPJ(cnpj, organization.id)
      setCompanies(results)
      
      if (results.length === 0) {
        toast.info('Nenhum resultado encontrado', {
          description: 'Não há clientes cadastrados com este CNPJ.',
        })
      } else {
        toast.success(`${results.length} cliente(s) encontrado(s)`)
      }
    } catch (error) {
      console.error('Erro ao buscar empresas:', error)
      toast.error('Erro na busca', {
        description: 'Não foi possível buscar os clientes.',
      })
      setCompanies([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearchByName = async (name: string) => {
    if (!organization) return
    
    setIsLoading(true)
    try {
      const results = await searchCompaniesByName(name, organization.id)
      setCompanies(results)
      
      if (results.length === 0) {
        toast.info('Nenhum resultado encontrado', {
          description: 'Não há clientes cadastrados com este nome.',
        })
      } else {
        toast.success(`${results.length} cliente(s) encontrado(s)`)
      }
    } catch (error) {
      console.error('Erro ao buscar empresas:', error)
      toast.error('Erro na busca', {
        description: 'Não foi possível buscar os clientes.',
      })
      setCompanies([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleListAll = async () => {
    if (!organization) return
    
    setIsLoading(true)
    try {
      const results = await getAllCompanies(organization.id)
      setCompanies(results)
      
      if (results.length === 0) {
        toast.info('Nenhum cliente cadastrado', {
          description: 'Adicione clientes para visualizá-los aqui.',
        })
      } else {
        toast.success(`${results.length} cliente(s) disponíveis`)
      }
    } catch (error) {
      console.error('Erro ao listar empresas:', error)
      toast.error('Erro ao listar', {
        description: 'Não foi possível listar os clientes.',
      })
      setCompanies([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleClient = (id: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const handleInstructionChange = (
    key: keyof CampaignInstructions,
    value: boolean,
  ) => {
    setInstructions((prev) => ({ ...prev, [key]: value }))
  }

  // Buscar perfis dos usuários quando searchResults mudar
  useEffect(() => {
    const loadUserProfiles = async () => {
      if (searchResults.length === 0) return

      // Coletar todos os IDs únicos de usuários (createdBy e updatedBy)
      const userIds = new Set<string>()
      searchResults.forEach((campaign) => {
        userIds.add(campaign.createdBy)
        userIds.add(campaign.updatedBy)
      })

      // Buscar perfis
      try {
        const profiles = await getUserProfiles([...userIds])
        setUserProfiles(profiles)
      } catch (error) {
        console.error('Erro ao buscar perfis de usuários:', error)
      }
    }

    loadUserProfiles()
  }, [searchResults])

  const handleGenerateSeals = async () => {
    if (!user) {
      toast.error('Usuário não autenticado')
      return
    }

    // Validação básica
    if (!campaignName.trim()) {
      toast.error('Nome da campanha é obrigatório')
      return
    }
    if (!sender.trim()) {
      toast.error('Remetente é obrigatório')
      return
    }
    if (!observation.trim()) {
      toast.error('Observação é obrigatória')
      return
    }
    if (selectedIds.size === 0) {
      toast.error('Selecione pelo menos um cliente')
      return
    }

    setIsSaving(true)
    try {
      // Filtra apenas as empresas selecionadas
      const selectedCompanies = companies.filter((company) =>
        selectedIds.has(company.id)
      )

      if (selectedCompanies.length === 0) {
        toast.error('Erro ao obter dados dos clientes selecionados')
        return
      }

      // Verifica se está editando uma campanha existente ou criando uma nova
      if (mode === 'edit' && editingCampaign) {
        // Atualiza a campanha existente com novos clientes
        await updateCampaign(
          editingCampaign.id,
          {
            companyIds: Array.from(selectedIds),
          },
          user.id
        )

        toast.success('Clientes atualizados com sucesso!', {
          description: `${selectedIds.size} cliente(s) vinculado(s) à campanha "${campaignName}".`,
        })

        // Gera os selos de todos os clientes selecionados
        toast.info('Gerando selos...', {
          description: 'A janela de impressão será aberta em instantes.',
        })

        // Pequeno delay para permitir que o toast apareça
        setTimeout(() => {
          printSeals({
            campaignName,
            sender,
            observation,
            instructions,
            companies: selectedCompanies,
            organizationLogoUrl: organization?.theme.logoUrl,
            organizationName: organization?.tradeName || organization?.name,
          })
        }, 500)

        // Volta para o modo de busca
        setMode('search')
        setEditingCampaign(null)
        
        // Atualiza os resultados da busca para refletir as mudanças
        handleListAllCampaigns()
      } else {
        // Cria uma nova campanha
        if (!organization) {
          toast.error('Erro ao criar campanha', {
            description: 'Organização não encontrada.',
          })
          return
        }
        
        const campaign = await createCampaign({
          name: campaignName,
          sender,
          observation,
          instructions,
          organizationId: organization.id,
          companyIds: Array.from(selectedIds),
          status: 'active',
          createdBy: user.id,
        })

        toast.success('Campanha criada com sucesso!', {
          description: `"${campaign.name}" foi criada com ${selectedIds.size} cliente(s).`,
        })

        // Gera os selos em PDF e abre a janela de impressão
        toast.info('Gerando selos...', {
          description: 'A janela de impressão será aberta em instantes.',
        })

        // Pequeno delay para permitir que o toast apareça
        setTimeout(() => {
          printSeals({
            campaignName,
            sender,
            observation,
            instructions,
            companies: selectedCompanies,
            organizationLogoUrl: organization?.theme.logoUrl,
            organizationName: organization?.tradeName || organization?.name,
          })
        }, 500)
      }

      // Limpa o formulário
      setCampaignName('')
      setSender('M7 Comercial Importadora e Exportadora LTDA\nRua Machado de Assis - 581 B\nVila Lutfalla - São Carlos, SP\nCEP: 13.570-673')
      setObservation('')
      setInstructions({
        fragile: true,
        attention: true,
        handleWithCare: true,
        thisWayUp: true,
      })
      setSelectedIds(new Set())
      setCompanies([])
    } catch (error) {
      console.error('Erro ao processar campanha:', error)
      const errorMessage =
        error instanceof Error ? error.message : 'Erro ao processar campanha'
      
      toast.error(mode === 'edit' ? 'Erro ao atualizar campanha' : 'Erro ao criar campanha', {
        description: errorMessage,
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleNewCampaign = () => {
    setMode('add')
    setEditingCampaign(null)
    // Reset form
    setCampaignName('')
    setSender('M7 Comercial Importadora e Exportadora LTDA\nRua Machado de Assis - 581 B\nVila Lutfalla - São Carlos, SP\nCEP: 13.570-673')
    setObservation('')
    setInstructions({
      fragile: true,
      attention: true,
      handleWithCare: true,
      thisWayUp: true,
    })
    setSelectedIds(new Set())
    setCompanies([])
    setSearchResults([])
  }

  const handleSearchCampaign = () => {
    setMode('search')
    setSearchResults([])
  }

  // Handlers para busca de campanhas
  const handleSearchByCampaignName = async (name: string) => {
    if (!organization) return
    
    setIsSearching(true)
    try {
      const results = await searchCampaignsWithCompaniesByName(name, organization.id)
      setSearchResults(results)

      if (results.length === 0) {
        toast.info('Nenhum resultado encontrado', {
          description: 'Não há campanhas com este nome.',
        })
      } else {
        toast.success(`${results.length} campanha(s) encontrada(s)`)
      }
    } catch (error) {
      console.error('Erro ao buscar campanhas:', error)
      toast.error('Erro na busca', {
        description: 'Não foi possível buscar as campanhas.',
      })
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleSearchByClientName = async (name: string) => {
    if (!organization) return
    
    setIsSearching(true)
    try {
      const results = await searchCampaignsByCompanyName(name, organization.id)
      setSearchResults(results)

      if (results.length === 0) {
        toast.info('Nenhum resultado encontrado', {
          description: 'Não há campanhas vinculadas a clientes com este nome.',
        })
      } else {
        toast.success(`${results.length} campanha(s) encontrada(s)`)
      }
    } catch (error) {
      console.error('Erro ao buscar campanhas:', error)
      toast.error('Erro na busca', {
        description: 'Não foi possível buscar as campanhas.',
      })
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleListAllCampaigns = async () => {
    if (!organization) return
    
    setIsSearching(true)
    try {
      const results = await getAllCampaignsWithCompanies(organization.id)
      setSearchResults(results)

      if (results.length === 0) {
        toast.info('Nenhuma campanha cadastrada', {
          description: 'Crie campanhas para visualizá-las aqui.',
        })
      } else {
        toast.success(`${results.length} campanha(s) disponíveis`)
      }
    } catch (error) {
      console.error('Erro ao listar campanhas:', error)
      toast.error('Erro ao listar', {
        description: 'Não foi possível listar as campanhas.',
      })
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleViewDetails = (campaign: CampaignWithCompanies) => {
    console.log('Ver detalhes:', campaign)
    toast.info('Visualização de detalhes em desenvolvimento')
  }

  const handleEdit = (campaign: CampaignWithCompanies) => {
    // Muda para o modo de edição unificado
    setMode('edit')
    setEditingCampaign(campaign)
    
    // Carrega os dados da campanha no formulário
    setCampaignName(campaign.name)
    setSender(campaign.sender)
    setObservation(campaign.observation)
    setInstructions(campaign.instructions)
    
    // Carrega os clientes já vinculados à campanha
    const existingCompanyIds = new Set(campaign.companies.map(c => c.id))
    setSelectedIds(existingCompanyIds)
    setCompanies(campaign.companies)
    
    toast.info(`Editando campanha "${campaign.name}"`, {
      description: 'Altere os dados da campanha e gerencie os clientes vinculados.',
    })
  }

  const handleSaveEdit = async () => {
    if (!user || !editingCampaign) {
      toast.error('Erro ao salvar', {
        description: 'Dados insuficientes para salvar a edição.',
      })
      return
    }

    // Validação básica
    if (!campaignName.trim()) {
      toast.error('Nome da campanha é obrigatório')
      return
    }
    if (!sender.trim()) {
      toast.error('Remetente é obrigatório')
      return
    }
    if (!observation.trim()) {
      toast.error('Observação é obrigatória')
      return
    }

    setIsSaving(true)
    try {
      // Atualiza os dados da campanha e os clientes vinculados
      await updateCampaign(
        editingCampaign.id,
        {
          name: campaignName,
          sender,
          observation,
          instructions,
          companyIds: Array.from(selectedIds),
        },
        user.id
      )

      toast.success('Campanha atualizada com sucesso!', {
        description: `"${campaignName}" foi atualizada com ${selectedIds.size} cliente(s) vinculado(s).`,
      })

      // Volta para o modo de busca e atualiza os resultados
      setMode('search')
      setEditingCampaign(null)
      handleListAllCampaigns()
    } catch (error) {
      console.error('Erro ao atualizar campanha:', error)
      const errorMessage =
        error instanceof Error ? error.message : 'Erro ao atualizar campanha'
      
      toast.error('Erro ao atualizar campanha', {
        description: errorMessage,
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleGenerateLabels = async (campaign: CampaignWithCompanies) => {
    try {
      if (!campaign.companies || campaign.companies.length === 0) {
        toast.error('Esta campanha não possui clientes vinculados')
        return
      }

      toast.info('Gerando selos...', {
        description: 'A janela de impressão será aberta em instantes.',
      })

      // Pequeno delay para permitir que o toast apareça
      setTimeout(() => {
        printSeals({
          campaignName: campaign.name,
          sender: campaign.sender,
          observation: campaign.observation,
          instructions: campaign.instructions,
          companies: campaign.companies,
          organizationLogoUrl: organization?.theme.logoUrl,
          organizationName: organization?.tradeName || organization?.name,
        })
      }, 500)
    } catch (error) {
      console.error('Erro ao gerar selos:', error)
      toast.error('Erro ao gerar selos', {
        description: 'Não foi possível gerar os selos desta campanha.',
      })
    }
  }

  const selectedCount = selectedIds.size

  return (
    <div className="min-h-screen">
      <Sidebar />
      <main className={cn(
        "transition-all duration-300",
        isCollapsed ? "lg:pl-20" : "lg:pl-64"
      )}>
        <div className="mx-auto max-w-7xl space-y-6 p-6 pb-32">
          <TopBar
            title="Painel de Campanhas"
            type="campaigns"
            mode={mode}
            onNovoCliente={handleNewCampaign}
            onBuscarCliente={handleSearchCampaign}
          />

          {mode === 'add' || mode === 'edit' ? (
            <>
              {/* Banner informativo quando está editando uma campanha */}
              {mode === 'edit' && editingCampaign && (
                <div 
                  className="rounded-2xl border p-4 shadow-sm"
                  style={{
                    backgroundColor: 'var(--color-primary-light)',
                    borderColor: 'var(--color-primary)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="flex h-10 w-10 items-center justify-center rounded-full"
                      style={{ backgroundColor: 'var(--color-primary)' }}
                    >
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 
                        className="font-semibold"
                        style={{ color: 'var(--color-primary)' }}
                      >
                        Editando campanha
                      </h3>
                      <p 
                        className="text-sm"
                        style={{ color: 'var(--color-text)' }}
                      >
                        Campanha: <span className="font-medium">{editingCampaign.name}</span> ({editingCampaign.companies.length} cliente(s) vinculado(s)). Você pode editar os dados e gerenciar os clientes.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setMode('search')
                        setEditingCampaign(null)
                        setCampaignName('')
                        setSender('M7 Comercial Importadora e Exportadora LTDA\nRua Machado de Assis - 581 B\nVila Lutfalla - São Carlos, SP\nCEP: 13.570-673')
                        setObservation('')
                        setInstructions({
                          fragile: true,
                          attention: true,
                          handleWithCare: true,
                          thisWayUp: true,
                        })
                        setSelectedIds(new Set())
                        setCompanies([])
                      }}
                      className="border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}

              {/* Formulário Completo da Campanha */}
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <CampaignForm
                  name={campaignName}
                  sender={sender}
                  observation={observation}
                  instructions={instructions}
                  onNameChange={setCampaignName}
                  onSenderChange={setSender}
                  onObservationChange={setObservation}
                  onInstructionChange={handleInstructionChange}
                />

                {/* Divisor */}
                <div className="my-8 border-t border-neutral-200" />

                {/* Procurar Cliente */}
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-neutral-800">
                      {mode === 'edit' ? 'Gerenciar Clientes da Campanha' : 'Selecionar Clientes'}
                    </h3>
                    <Button
                      onClick={handleListAll}
                      disabled={isLoading}
                      variant="outline"
                      className="gap-2"
                    >
                      <Search className="h-4 w-4" />
                      Listar Todos os Clientes
                    </Button>
                  </div>
                  <ClientSearchBar
                    onSearchByName={handleSearchByName}
                    onSearchByCNPJ={handleSearchByCNPJ}
                    isLoading={isLoading}
                  />
                </div>

                {/* Tabela de Seleção de Clientes */}
                <div className="mt-6">
                  <ClientSelectionTable
                    companies={companies}
                    selectedIds={selectedIds}
                    onToggleClient={handleToggleClient}
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Procurar Campanha */}
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-neutral-800">
                    Procurar Campanha
                  </h3>
                  <Button
                    onClick={handleListAllCampaigns}
                    disabled={isSearching}
                    variant="outline"
                    className="gap-2"
                  >
                    <Search className="h-4 w-4" />
                    Listar Todas as Campanhas
                  </Button>
                </div>
                <CampaignSearchBar
                  onSearchByCampaignName={handleSearchByCampaignName}
                  onSearchByClientName={handleSearchByClientName}
                  isLoading={isSearching}
                />
              </div>

              {/* Resultados da Busca */}
              {searchResults.length > 0 && (
                <CampaignResultsTable
                  campaigns={searchResults}
                  userProfiles={userProfiles}
                  onViewDetails={handleViewDetails}
                  onEdit={handleEdit}
                  onGenerateLabels={handleGenerateLabels}
                />
              )}

              {!isSearching && searchResults.length === 0 && (
                <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
                  <p className="text-neutral-500">
                    Use os campos acima para buscar campanhas.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Unificado */}
        {(mode === 'add' || mode === 'edit') && (
          <div className={cn(
            "fixed bottom-0 left-0 right-0 animate-in slide-in-from-bottom-5 border-t border-neutral-200 bg-white p-4 shadow-lg duration-300 transition-all",
            isCollapsed ? "lg:left-20" : "lg:left-64"
          )}>
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm text-neutral-600">
                  {mode === 'edit' 
                    ? `Editando campanha • ${selectedCount} cliente(s) vinculado(s)`
                    : `${selectedCount} cliente(s) selecionado(s)`
                  }
                </p>
                <p className="text-lg font-semibold text-neutral-800">
                  Campanha: {campaignName || '(sem nome)'}
                </p>
              </div>
              <div className="flex gap-2">
                {mode === 'edit' && (
                  <Button
                    onClick={handleSaveEdit}
                    disabled={isSaving}
                    className="gap-2 text-white transition-all hover:scale-105 disabled:bg-neutral-300 disabled:hover:scale-100"
                    style={{
                      backgroundColor: isSaving ? 'var(--color-primary)' : 'var(--color-primary)',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSaving) {
                        e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSaving) {
                        e.currentTarget.style.backgroundColor = 'var(--color-primary)'
                      }
                    }}
                  >
                    <FileText className="h-4 w-4" />
                    {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                  </Button>
                )}
                {selectedCount > 0 && (
                  <Button
                    onClick={handleGenerateSeals}
                    disabled={isSaving}
                    variant={mode === 'edit' ? 'outline' : 'default'}
                    className="gap-2 transition-all hover:scale-105 disabled:bg-neutral-300 disabled:hover:scale-100"
                    style={
                      mode === 'edit'
                        ? {
                            borderColor: 'var(--color-primary)',
                            color: 'var(--color-primary)',
                          }
                        : {
                            backgroundColor: 'var(--color-primary)',
                            color: 'white',
                          }
                    }
                    onMouseEnter={(e) => {
                      if (!isSaving && mode === 'edit') {
                        e.currentTarget.style.backgroundColor = 'var(--color-primary-light)'
                      } else if (!isSaving) {
                        e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSaving && mode === 'edit') {
                        e.currentTarget.style.backgroundColor = 'transparent'
                      } else if (!isSaving) {
                        e.currentTarget.style.backgroundColor = 'var(--color-primary)'
                      }
                    }}
                  >
                    <FileText className="h-4 w-4" />
                    {isSaving ? 'Gerando...' : 'Gerar Selos'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}


import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { TopBar } from '@/components/TopBar'
import { CampaignForm } from '@/components/CampaignForm'
import { ClientSearchBar } from '@/components/ClientSearchBar'
import { ClientSelectionTable } from '@/components/ClientSelectionTable'
import { CampaignSearchBar } from '@/components/CampaignSearchBar'
import { CampaignResultsTable } from '@/components/CampaignResultsTable'
import { Button } from '@/components/ui/button'
import { FileText, Plus } from 'lucide-react'
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
  addCompaniesToCampaign,
  type CampaignWithCompanies,
} from '@/lib/firebase/campaigns'
import { getUserProfiles, type UserProfile } from '@/lib/firebase/users'
import { useAuth } from '@/contexts/AuthContext'
import { useSidebar } from '@/contexts/SidebarContext'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { printSeals } from '@/lib/seal-generator'

export function CampaignsPage() {
  const { user } = useAuth()
  const { isCollapsed } = useSidebar()
  const [mode, setMode] = useState<'add' | 'search' | 'add-to-existing'>('add')
  
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
    setIsLoading(true)
    try {
      const results = await searchCompaniesByCNPJ(cnpj)
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
    setIsLoading(true)
    try {
      const results = await searchCompaniesByName(name)
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
    setIsLoading(true)
    try {
      const results = await getAllCompanies()
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

      // Verifica se está adicionando a uma campanha existente ou criando uma nova
      if (mode === 'add-to-existing' && editingCampaign) {
        // Adiciona clientes a uma campanha existente
        const updatedCampaign = await addCompaniesToCampaign(
          editingCampaign.id,
          Array.from(selectedIds),
          user.id
        )

        toast.success('Clientes adicionados com sucesso!', {
          description: `${selectedIds.size} novo(s) cliente(s) adicionado(s) à campanha "${updatedCampaign.name}".`,
        })

        // Gera os selos apenas dos novos clientes adicionados
        toast.info('Gerando selos dos novos clientes...', {
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
          })
        }, 500)

        // Volta para o modo de busca
        setMode('search')
        setEditingCampaign(null)
        
        // Atualiza os resultados da busca para refletir as mudanças
        handleListAllCampaigns()
      } else {
        // Cria uma nova campanha
        const campaign = await createCampaign({
          name: campaignName,
          sender,
          observation,
          instructions,
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
      
      toast.error(mode === 'add-to-existing' ? 'Erro ao adicionar clientes' : 'Erro ao criar campanha', {
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
    setIsSearching(true)
    try {
      const results = await searchCampaignsWithCompaniesByName(name)
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
    setIsSearching(true)
    try {
      const results = await searchCampaignsByCompanyName(name)
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
    setIsSearching(true)
    try {
      const results = await getAllCampaignsWithCompanies()
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

  const handleAddMore = (campaign: CampaignWithCompanies) => {
    // Muda para o modo de adicionar clientes a uma campanha existente
    setMode('add-to-existing')
    setEditingCampaign(campaign)
    
    // Carrega os dados da campanha no formulário
    setCampaignName(campaign.name)
    setSender(campaign.sender)
    setObservation(campaign.observation)
    setInstructions(campaign.instructions)
    
    // Limpa a seleção de clientes
    setSelectedIds(new Set())
    setCompanies([])
    
    toast.info(`Adicionando clientes à campanha "${campaign.name}"`, {
      description: 'Selecione os novos clientes que deseja adicionar.',
    })
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

          {mode === 'add' || mode === 'add-to-existing' ? (
            <>
              {/* Banner informativo quando está adicionando a uma campanha existente */}
              {mode === 'add-to-existing' && editingCampaign && (
                <div className="rounded-2xl bg-blue-50 border border-blue-200 p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500">
                      <Plus className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-blue-900">
                        Adicionando clientes à campanha existente
                      </h3>
                      <p className="text-sm text-blue-700">
                        Campanha: <span className="font-medium">{editingCampaign.name}</span> ({editingCampaign.companies.length} cliente(s) já vinculado(s))
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
                      className="border-blue-300 text-blue-700 hover:bg-blue-100"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}

              {/* Formulário da Campanha */}
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                {mode === 'add-to-existing' ? (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-neutral-800">
                      Informações da Campanha (Somente Leitura)
                    </h3>
                    <div className="grid gap-4 rounded-lg bg-neutral-50 p-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-600">Nome da Campanha</label>
                        <p className="mt-1 text-base text-neutral-800">{campaignName}</p>
                      </div>
                      <div className="grid gap-4 lg:grid-cols-2">
                        <div>
                          <label className="block text-sm font-medium text-neutral-600">Remetente</label>
                          <p className="mt-1 whitespace-pre-line text-sm text-neutral-800">{sender}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-neutral-600">Observação</label>
                          <p className="mt-1 text-base text-neutral-800">{observation}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
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
                )}
              </div>

              {/* Procurar Cliente */}
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold text-neutral-800">
                  {mode === 'add-to-existing' ? 'Selecionar Novos Clientes' : 'Selecionar Clientes'}
                </h3>
                <ClientSearchBar
                  onSearchByName={handleSearchByName}
                  onSearchByCNPJ={handleSearchByCNPJ}
                  onListAll={handleListAll}
                  isLoading={isLoading}
                />
              </div>

              {/* Tabela de Seleção de Clientes */}
              <ClientSelectionTable
                companies={companies}
                selectedIds={selectedIds}
                onToggleClient={handleToggleClient}
              />
            </>
          ) : (
            <>
              {/* Procurar Campanha */}
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold text-neutral-800">
                  Procurar Campanha
                </h3>
                <CampaignSearchBar
                  onSearchByCampaignName={handleSearchByCampaignName}
                  onSearchByClientName={handleSearchByClientName}
                  onListAll={handleListAllCampaigns}
                  isLoading={isSearching}
                />
              </div>

              {/* Resultados da Busca */}
              {searchResults.length > 0 && (
                <CampaignResultsTable
                  campaigns={searchResults}
                  userProfiles={userProfiles}
                  onViewDetails={handleViewDetails}
                  onAddMore={handleAddMore}
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

        {/* Footer - Gerar Selos (somente no modo adicionar) */}
        {(mode === 'add' || mode === 'add-to-existing') && selectedCount > 0 && (
          <div className={cn(
            "fixed bottom-0 left-0 right-0 animate-in slide-in-from-bottom-5 border-t border-neutral-200 bg-white p-4 shadow-lg duration-300 transition-all",
            isCollapsed ? "lg:left-20" : "lg:left-64"
          )}>
            <div className="mx-auto flex max-w-7xl items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">
                  {selectedCount} {mode === 'add-to-existing' ? 'novo(s)' : ''} cliente(s) selecionado(s)
                </p>
                <p className="text-lg font-semibold text-neutral-800">
                  {mode === 'add-to-existing' ? 'Adicionando à campanha: ' : 'Campanha: '}{campaignName || '(sem nome)'}
                </p>
              </div>
              <Button
                onClick={handleGenerateSeals}
                disabled={isSaving}
                className="gap-2 bg-[#D97B35] text-white transition-all hover:bg-[#bd6126] hover:scale-105 disabled:bg-neutral-300 disabled:hover:scale-100"
              >
                <FileText className="h-4 w-4" />
                {isSaving ? (mode === 'add-to-existing' ? 'Adicionando...' : 'Gerando...') : (mode === 'add-to-existing' ? 'Adicionar Clientes' : 'Gerar Selos')}
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}


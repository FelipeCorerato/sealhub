import { useState } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { TopBar } from '@/components/TopBar'
import { CampaignForm } from '@/components/CampaignForm'
import { ClientSearchBar } from '@/components/ClientSearchBar'
import { ClientSelectionTable } from '@/components/ClientSelectionTable'
import { Button } from '@/components/ui/button'
import { FileText } from 'lucide-react'
import type { Company, CampaignInstructions } from '@/types'
import {
  searchCompaniesByName,
  searchCompaniesByCNPJ,
  getAllCompanies,
} from '@/lib/firebase/companies'
import { createCampaign } from '@/lib/firebase/campaigns'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

export function CampaignsPage() {
  const { user } = useAuth()
  const [campaignName, setCampaignName] = useState('')
  const [sender, setSender] = useState('')
  const [observation, setObservation] = useState('')
  const [instructions, setInstructions] = useState<CampaignInstructions>({
    fragile: false,
    attention: false,
    handleWithCare: false,
    thisWayUp: false,
  })

  const [companies, setCompanies] = useState<Company[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

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

      // Limpa o formulário
      setCampaignName('')
      setSender('')
      setObservation('')
      setInstructions({
        fragile: false,
        attention: false,
        handleWithCare: false,
        thisWayUp: false,
      })
      setSelectedIds(new Set())
      setCompanies([])
    } catch (error) {
      console.error('Erro ao criar campanha:', error)
      const errorMessage =
        error instanceof Error ? error.message : 'Erro ao criar campanha'
      
      toast.error('Erro ao criar campanha', {
        description: errorMessage,
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleNewCampaign = () => {
    // Reset form
    setCampaignName('')
    setSender('')
    setObservation('')
    setInstructions({
      fragile: false,
      attention: false,
      handleWithCare: false,
      thisWayUp: false,
    })
    setSelectedIds(new Set())
    setCompanies([])
  }

  const handleSearchCampaign = () => {
    console.log('Buscar campanha')
    // Implementar futuramente
    toast.info('Funcionalidade em desenvolvimento')
  }

  const selectedCount = selectedIds.size

  return (
    <div className="min-h-screen">
      <Sidebar />
      <main className="lg:pl-64">
        <div className="mx-auto max-w-7xl space-y-6 p-6 pb-32">
          <TopBar
            title="Painel de Campanhas"
            type="campaigns"
            mode="add"
            onNovoCliente={handleNewCampaign}
            onBuscarCliente={handleSearchCampaign}
          />

          {/* Formulário da Campanha */}
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
          </div>

          {/* Procurar Cliente */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-neutral-800">
              Selecionar Clientes
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
        </div>

        {/* Footer - Gerar Selos */}
        {selectedCount > 0 && (
          <div className="fixed bottom-0 left-0 right-0 animate-in slide-in-from-bottom-5 border-t border-neutral-200 bg-white p-4 shadow-lg duration-300 lg:left-64">
            <div className="mx-auto flex max-w-7xl items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">
                  {selectedCount} cliente(s) selecionado(s)
                </p>
                <p className="text-lg font-semibold text-neutral-800">
                  Campanha: {campaignName || '(sem nome)'}
                </p>
              </div>
              <Button
                onClick={handleGenerateSeals}
                disabled={isSaving}
                className="gap-2 bg-[#D97B35] text-white transition-all hover:bg-[#bd6126] hover:scale-105 disabled:bg-neutral-300 disabled:hover:scale-100"
              >
                <FileText className="h-4 w-4" />
                {isSaving ? 'Gerando...' : 'Gerar Selos'}
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}


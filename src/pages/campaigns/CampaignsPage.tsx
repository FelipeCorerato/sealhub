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
  fetchCompaniesByCNPJ,
  fetchCompaniesByName,
  saveCampaign,
} from '@/lib/api.mock'
import { toast } from 'sonner'

export function CampaignsPage() {
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
  const [selectedCNPJs, setSelectedCNPJs] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleSearchByCNPJ = async (cnpj: string) => {
    setIsLoading(true)
    try {
      const results = await fetchCompaniesByCNPJ(cnpj)
      setCompanies(results)
    } catch (error) {
      console.error('Erro ao buscar empresas:', error)
      setCompanies([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearchByName = async (name: string) => {
    setIsLoading(true)
    try {
      const results = await fetchCompaniesByName(name)
      setCompanies(results)
    } catch (error) {
      console.error('Erro ao buscar empresas:', error)
      setCompanies([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleClient = (cnpj: string) => {
    setSelectedCNPJs((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(cnpj)) {
        newSet.delete(cnpj)
      } else {
        newSet.add(cnpj)
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
    if (selectedCNPJs.size === 0) {
      toast.error('Selecione pelo menos um cliente')
      return
    }

    setIsSaving(true)
    try {
      const campaign = await saveCampaign({
        name: campaignName,
        sender,
        observation,
        instructions,
        clientCNPJs: Array.from(selectedCNPJs),
      })

      toast.success('Selos gerados com sucesso!', {
        description: `Campanha "${campaign.name}" criada com ${selectedCNPJs.size} cliente(s).`,
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
      setSelectedCNPJs(new Set())
      setCompanies([])
    } catch (error) {
      console.error('Erro ao gerar selos:', error)
      toast.error('Erro ao gerar selos')
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
    setSelectedCNPJs(new Set())
    setCompanies([])
  }

  const handleSearchCampaign = () => {
    console.log('Buscar campanha')
    // Implementar futuramente
    toast.info('Funcionalidade em desenvolvimento')
  }

  const selectedCount = selectedCNPJs.size

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
          <ClientSearchBar
            onSearchByName={handleSearchByName}
            onSearchByCNPJ={handleSearchByCNPJ}
            isLoading={isLoading}
          />

          {/* Tabela de Seleção de Clientes */}
          <ClientSelectionTable
            companies={companies}
            selectedCNPJs={selectedCNPJs}
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


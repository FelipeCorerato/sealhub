import { useState } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { TopBar } from '@/components/TopBar'
import { SearchCNPJ } from '@/components/SearchCNPJ'
import { ClientSearchBar } from '@/components/ClientSearchBar'
import { ResultsTable } from '@/components/ResultsTable'
import { FooterBar } from '@/components/FooterBar'
import type { Company } from '@/types'
import {
  fetchCompaniesByCNPJ,
  fetchCompaniesByName,
} from '@/lib/api.mock'
import { fetchCNPJFromReceita, validateCNPJDigits } from '@/lib/cnpj-api'
import { toast } from 'sonner'

type PageMode = 'add' | 'search'

export function ClientsPage() {
  const [mode, setMode] = useState<PageMode>('add')
  const [companies, setCompanies] = useState<Company[]>([])
  const [selectedCompany, setSelectedCompany] = useState<Company>()
  const [isLoading, setIsLoading] = useState(false)

  const handleSearchByCNPJ = async (cnpj: string) => {
    setIsLoading(true)
    setSelectedCompany(undefined)
    setCompanies([])

    try {
      // Se estiver no modo "add", busca na API da Receita Federal
      if (mode === 'add') {
        // Valida dígitos verificadores
        if (!validateCNPJDigits(cnpj)) {
          toast.error('CNPJ inválido', {
            description: 'Os dígitos verificadores do CNPJ estão incorretos.',
          })
          return
        }

        // Busca na API da Receita Federal
        const company = await fetchCNPJFromReceita(cnpj)
        setCompanies([company])
        
        toast.success('CNPJ encontrado!', {
          description: company.name,
        })
      } else {
        // Modo "search" usa o mock local
        const results = await fetchCompaniesByCNPJ(cnpj)
        setCompanies(results)
      }
    } catch (error) {
      console.error('Erro ao buscar empresas:', error)
      const errorMessage =
        error instanceof Error ? error.message : 'Erro ao buscar CNPJ'
      
      toast.error('Erro na busca', {
        description: errorMessage,
      })
      setCompanies([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearchByName = async (name: string) => {
    setIsLoading(true)
    setSelectedCompany(undefined)
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

  const handleSelectCompany = (company: Company) => {
    setSelectedCompany(company)
  }

  const handleSave = () => {
    console.log('Salvando cliente:', selectedCompany)
    // Aqui você pode adicionar a lógica de salvamento real
    // Por enquanto, apenas limpa a seleção após salvar
    setTimeout(() => {
      setSelectedCompany(undefined)
      setCompanies([])
    }, 1000)
  }

  const handleNewClient = () => {
    setMode('add')
    setCompanies([])
    setSelectedCompany(undefined)
  }

  const handleSearchClient = () => {
    setMode('search')
    setCompanies([])
    setSelectedCompany(undefined)
  }

  const pageTitle = mode === 'add' ? 'Adicionar Cliente' : 'Procurar Cliente'
  const tableMode = mode === 'search' ? 'edit' : mode
  const footerMode = mode === 'search' ? 'edit' : mode

  return (
    <div className="min-h-screen">
      <Sidebar />
      <main className="lg:pl-64">
        <div className="mx-auto max-w-7xl space-y-6 p-6 pb-32">
          <TopBar
            title="Painel de Clientes"
            type="clients"
            mode={mode}
            onNovoCliente={handleNewClient}
            onBuscarCliente={handleSearchClient}
          />

          <div className="rounded-2xl bg-white p-6 shadow-sm transition-all duration-300">
            <h3 className="mb-4 text-lg font-semibold text-neutral-800">
              {pageTitle}
            </h3>
            <div className="transition-opacity duration-300">
              {mode === 'add' ? (
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <label className="mb-2 block text-sm font-medium text-neutral-700">
                      Buscar CNPJ *
                    </label>
                    <SearchCNPJ
                      onSearch={handleSearchByCNPJ}
                      isLoading={isLoading}
                    />
                  </div>
                </div>
              ) : (
                <ClientSearchBar
                  onSearchByName={handleSearchByName}
                  onSearchByCNPJ={handleSearchByCNPJ}
                  isLoading={isLoading}
                />
              )}
            </div>
          </div>

          <ResultsTable
            companies={companies}
            selectedCompany={selectedCompany}
            onSelectCompany={handleSelectCompany}
            mode={tableMode}
          />
        </div>
        <FooterBar
          selectedCompany={selectedCompany}
          mode={footerMode}
          onSave={handleSave}
        />
      </main>
    </div>
  )
}


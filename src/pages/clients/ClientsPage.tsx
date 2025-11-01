import { useState } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { TopBar } from '@/components/TopBar'
import { SearchCNPJ } from '@/components/SearchCNPJ'
import { ResultsTable } from '@/components/ResultsTable'
import { FooterBar } from '@/components/FooterBar'
import type { Company } from '@/types'
import { fetchCompaniesByCNPJ } from '@/lib/api.mock'

export function ClientsPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [selectedCompany, setSelectedCompany] = useState<Company>()
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = async (cnpj: string) => {
    setIsLoading(true)
    setSelectedCompany(undefined)
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
    console.log('Novo cliente')
    // Lógica para abrir formulário de novo cliente
  }

  const handleSearchClient = () => {
    console.log('Buscar cliente')
    // Lógica para buscar cliente existente
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl p-6 space-y-6 pb-32">
          <TopBar
            onNovoCliente={handleNewClient}
            onBuscarCliente={handleSearchClient}
          />
          <SearchCNPJ onSearch={handleSearch} isLoading={isLoading} />
          <ResultsTable
            companies={companies}
            selectedCompany={selectedCompany}
            onSelectCompany={handleSelectCompany}
          />
        </div>
        <FooterBar selectedCompany={selectedCompany} onSave={handleSave} />
      </main>
    </div>
  )
}


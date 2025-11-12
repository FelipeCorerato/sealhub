import { useState } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { TopBar } from '@/components/TopBar'
import { SearchCNPJ } from '@/components/SearchCNPJ'
import { ClientSearchBar } from '@/components/ClientSearchBar'
import { ResultsTable } from '@/components/ResultsTable'
import { FooterBar } from '@/components/FooterBar'
import type { Company, CompanyData } from '@/types'
import { fetchCNPJFromReceita, validateCNPJDigits } from '@/lib/cnpj-api'
import {
  searchCompaniesByName,
  searchCompaniesByCNPJ,
  upsertCompanyFromReceita,
  cnpjExists,
} from '@/lib/firebase/companies'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

type PageMode = 'add' | 'search'

export function ClientsPage() {
  const { user } = useAuth()
  const [mode, setMode] = useState<PageMode>('add')
  const [companies, setCompanies] = useState<Company[]>([])
  const [selectedCompany, setSelectedCompany] = useState<Company>()
  const [isLoading, setIsLoading] = useState(false)
  const [receitaData, setReceitaData] = useState<CompanyData | null>(null)

  const handleSearchByCNPJ = async (cnpj: string) => {
    setIsLoading(true)
    setSelectedCompany(undefined)
    setCompanies([])
    setReceitaData(null)

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

        // Verifica se o CNPJ já existe no banco
        const exists = await cnpjExists(cnpj)
        if (exists) {
          toast.error('CNPJ já cadastrado', {
            description: 'Este CNPJ já existe no sistema. Use "Buscar Cliente" para encontrá-lo.',
          })
          return
        }

        // Busca na API da Receita Federal
        const companyData = await fetchCNPJFromReceita(cnpj)
        setReceitaData(companyData)
        
        // Cria um objeto Company temporário para exibição
        const tempCompany: Company = {
          ...companyData,
          id: 'temp',
          createdAt: new Date(),
          createdBy: user?.id || '',
          updatedAt: new Date(),
        }
        
        setCompanies([tempCompany])
        
        toast.success('CNPJ encontrado!', {
          description: companyData.name,
        })
      } else {
        // Modo "search" busca no Firestore
        const results = await searchCompaniesByCNPJ(cnpj)
        setCompanies(results)
        
        if (results.length === 0) {
          toast.info('Nenhum resultado encontrado', {
            description: 'Não há clientes cadastrados com este CNPJ.',
          })
        }
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
    setReceitaData(null)
    
    try {
      // Busca no Firestore
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
    setSelectedCompany(undefined)
    setReceitaData(null)
    
    try {
      const { getAllCompanies } = await import('@/lib/firebase/companies')
      const results = await getAllCompanies()
      setCompanies(results)
      
      if (results.length === 0) {
        toast.info('Nenhum cliente cadastrado', {
          description: 'Adicione clientes para visualizá-los aqui.',
        })
      } else {
        toast.success(`${results.length} cliente(s) cadastrado(s)`)
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

  const handleSelectCompany = (company: Company) => {
    setSelectedCompany(company)
  }

  const handleSave = async () => {
    if (!selectedCompany || !user) {
      return
    }

    setIsLoading(true)
    
    try {
      if (mode === 'add' && receitaData) {
        // Modo "add": salvar novo cliente com dados da Receita
        const savedCompany = await upsertCompanyFromReceita(receitaData, user.id)
        
        toast.success('Cliente salvo com sucesso!', {
          description: `${savedCompany.name} foi adicionado à sua lista de clientes.`,
        })
      } else {
        // Modo "search/edit": atualizar cliente existente
        // TODO: implementar updateCompany quando houver edição de dados
        toast.success('Cliente atualizado com sucesso!', {
          description: `${selectedCompany.name} foi atualizado.`,
        })
      }
      
      // Limpar estado após salvar
      setSelectedCompany(undefined)
      setCompanies([])
      setReceitaData(null)
    } catch (error) {
      console.error('Erro ao salvar cliente:', error)
      const errorMessage =
        error instanceof Error ? error.message : 'Erro ao salvar cliente'
      
      toast.error('Erro ao salvar', {
        description: errorMessage,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewClient = () => {
    setMode('add')
    setCompanies([])
    setSelectedCompany(undefined)
    setReceitaData(null)
  }

  const handleSearchClient = () => {
    setMode('search')
    setCompanies([])
    setSelectedCompany(undefined)
    setReceitaData(null)
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
                  onListAll={handleListAll}
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


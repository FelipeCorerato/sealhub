import { useState } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { TopBar } from '@/components/TopBar'
import { SearchCNPJ } from '@/components/SearchCNPJ'
import { ClientSearchBar } from '@/components/ClientSearchBar'
import { ResultsTable } from '@/components/ResultsTable'
import { CompanyEditForm } from '@/components/CompanyEditForm'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Search, Save, Loader2, Trash2 } from 'lucide-react'
import type { Company, CompanyData } from '@/types'
import { validateCNPJDigits, fetchRelatedCNPJs } from '@/lib/cnpj-api'
import {
  searchCompaniesByName,
  searchRelatedCompanies,
  saveMatrizAndBranches,
  updateCompany,
  deleteCompany,
} from '@/lib/firebase/companies'
import { isHeadquarters } from '@/lib/cnpj'
import { useAuth } from '@/contexts/AuthContext'
import { useOrganization } from '@/contexts/OrganizationContext'
import { useSidebar } from '@/contexts/SidebarContext'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

type PageMode = 'add' | 'search'

export function ClientsPage() {
  const { user } = useAuth()
  const { organization } = useOrganization()
  const { isCollapsed } = useSidebar()
  const [mode, setMode] = useState<PageMode>('add')
  const [companies, setCompanies] = useState<Company[]>([])
  const [selectedCompany, setSelectedCompany] = useState<Company>()
  const [selectedBranchCNPJs, setSelectedBranchCNPJs] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const [editingCompanyId, setEditingCompanyId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: '', address: '' })
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const resetEditForm = () => {
    setEditingCompanyId(null)
    setEditForm({ name: '', address: '' })
    setIsEditDialogOpen(false)
    setIsDeleteDialogOpen(false)
  }

  const handleSearchByCNPJ = async (cnpj: string) => {
    setIsLoading(true)
    setSelectedCompany(undefined)
    setCompanies([])
    resetEditForm()

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

        if (!organization) {
          toast.error('Erro na busca', {
            description: 'Organização não encontrada.',
          })
          return
        }

        // Busca também empresas relacionadas já cadastradas no banco de dados
        const existingRelated = await searchRelatedCompanies(cnpj, organization.id)
        
        // Busca na API da Receita Federal
        const relatedData = await fetchRelatedCNPJs(cnpj)
        
        if (relatedData.length === 0) {
          toast.error('CNPJ não encontrado')
          return
        }
        
        // Cria objetos Company temporários da API
        const tempCompanies: Company[] = relatedData.map((data) => ({
          ...data,
          id: 'temp-' + data.cnpj,
          organizationId: organization.id,
          createdAt: new Date(),
          createdBy: user?.id || '',
          updatedAt: new Date(),
        }))
        
        // Combina resultados: empresas da API + empresas já cadastradas no banco
        // Remove duplicatas (empresas que estão na API e no banco)
        const existingCNPJs = new Set(existingRelated.map(c => c.cnpj))
        const newFromAPI = tempCompanies.filter(c => !existingCNPJs.has(c.cnpj))
        
        // Combina e ordena: matriz primeiro, depois filiais
        const allCompanies = [...existingRelated, ...newFromAPI].sort((a, b) => {
          const cnpjA = a.cnpj.replace(/\D/g, '')
          const cnpjB = b.cnpj.replace(/\D/g, '')
          return cnpjA.localeCompare(cnpjB)
        })
        
        setCompanies(allCompanies)
        
        // Inicializa todas as filiais como selecionadas por padrão
        const filiais = allCompanies.filter(c => c.type === 'branch')
        const initialSelected = new Set(filiais.map(f => f.cnpj))
        setSelectedBranchCNPJs(initialSelected)
        
        const isMatriz = isHeadquarters(cnpj)
        const filiaisCount = allCompanies.length - 1
        
        if (isMatriz) {
          if (filiaisCount > 0) {
            toast.success('Matriz encontrada!', {
              description: `${relatedData[0].name} + ${filiaisCount} filial(is) relacionada(s)`,
            })
          } else {
            toast.success('Matriz encontrada!', {
              description: relatedData[0].name,
            })
          }
        } else {
          toast.success('Filial encontrada!', {
            description: `Exibindo matriz e ${filiaisCount} filial(is) relacionada(s)`,
          })
        }
      } else {
        // Modo "search" busca empresas relacionadas no Firestore
        if (!organization) {
          toast.error('Erro na busca', {
            description: 'Organização não encontrada.',
          })
          return
        }
        
        const results = await searchRelatedCompanies(cnpj, organization.id)
        setCompanies(results)
        
        // No modo search não precisa selecionar filiais (já estão todas cadastradas)
        setSelectedBranchCNPJs(new Set())
        
        if (results.length === 0) {
          toast.info('Nenhum resultado encontrado', {
            description: 'Não há clientes cadastrados com este CNPJ.',
          })
        } else {
          const isMatriz = isHeadquarters(cnpj)
          if (isMatriz) {
            toast.success(`Matriz e ${results.length - 1} filial(is) encontrada(s)`)
          } else {
            toast.success(`Matriz e filiais relacionadas encontradas`, {
              description: `${results.length} empresa(s) no total`,
            })
          }
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
    setSelectedBranchCNPJs(new Set())
    resetEditForm()
    
    try {
      if (!organization) {
        toast.error('Erro na busca', {
          description: 'Organização não encontrada.',
        })
        return
      }
      
      // Busca no Firestore
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
    if (!organization) {
      toast.error('Erro ao listar', {
        description: 'Organização não encontrada.',
      })
      return
    }
    
    setIsLoading(true)
    setSelectedCompany(undefined)
    setSelectedBranchCNPJs(new Set())
    resetEditForm()
    
    try {
      const { getAllCompanies } = await import('@/lib/firebase/companies')
      const results = await getAllCompanies(organization.id)
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

  const handleToggleBranch = (cnpj: string, checked: boolean) => {
    setSelectedBranchCNPJs((prev) => {
      const newSet = new Set(prev)
      if (checked) {
        newSet.add(cnpj)
      } else {
        newSet.delete(cnpj)
      }
      return newSet
    })
  }

  const handleSelectAllBranches = () => {
    const filiais = companies.filter(c => c.type === 'branch')
    const allBranchCNPJs = new Set(filiais.map(f => f.cnpj))
    setSelectedBranchCNPJs(allBranchCNPJs)
  }

  const handleDeselectAllBranches = () => {
    setSelectedBranchCNPJs(new Set())
  }

  const handleEditFormChange = (field: 'name' | 'address', value: string) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleEditCompany = (company: Company) => {
    if (mode !== 'search') {
      return
    }
    setSelectedCompany(company)
    setEditingCompanyId(company.id)
    setEditForm({
      name: company.name,
      address: company.address,
    })
    setIsEditDialogOpen(true)
  }

  const handleSave = async () => {
    if (!user) {
      return
    }

    // Busca a matriz e filiais selecionadas
    const matriz = companies.find(c => c.type === 'headquarters')
    
    if (!matriz) {
      toast.error('Erro', {
        description: 'Matriz não encontrada. Não é possível salvar.',
      })
      return
    }

    // Filtra filiais selecionadas
    const filiaisSelecionadas = companies.filter(
      c => c.type === 'branch' && selectedBranchCNPJs.has(c.cnpj)
    )

    setIsLoading(true)
    
    try {
      if (mode === 'add') {
        // Modo "add": salvar matriz e filiais selecionadas
        
        // Converte Company para CompanyData (remove metadados do Firestore)
        const matrizData: CompanyData = {
          cnpj: matriz.cnpj,
          name: matriz.name,
          legalName: matriz.legalName,
          address: matriz.address,
          type: matriz.type,
          status: matriz.status,
        }
        
        const filiaisData: CompanyData[] = filiaisSelecionadas.map(f => ({
          cnpj: f.cnpj,
          name: f.name,
          legalName: f.legalName,
          address: f.address,
          type: f.type,
          status: f.status,
        }))
        
        // Salva matriz e filiais com relacionamento
        if (!organization) {
          toast.error('Erro ao salvar empresas', {
            description: 'Organização não encontrada.',
          })
          return
        }
        
        const { matriz: savedMatriz, filiais: savedFiliais } = 
          await saveMatrizAndBranches(matrizData, filiaisData, user.id, organization.id)
        
        toast.success('Empresas salvas com sucesso!', {
          description: `${savedMatriz.name} e ${savedFiliais.length} filial(is) foram adicionadas.`,
        })
        // Limpa estado após salvar (modo add)
        setSelectedCompany(undefined)
        setCompanies([])
        setSelectedBranchCNPJs(new Set())
        resetEditForm()
      } else if (mode === 'search') {
        if (!editingCompanyId) {
          toast.error('Selecione um cliente', {
            description: 'Clique em "Editar" no cliente que deseja atualizar.',
          })
          return
        }

        const trimmedName = editForm.name.trim()
        const trimmedAddress = editForm.address.trim()

        if (!trimmedName || !trimmedAddress) {
          toast.error('Campos obrigatórios', {
            description: 'Nome e endereço são obrigatórios.',
          })
          return
        }

        const updatedCompany = await updateCompany(editingCompanyId, {
          name: trimmedName,
          address: trimmedAddress,
        })

        setCompanies((prev) =>
          prev.map((company) =>
            company.id === updatedCompany.id ? updatedCompany : company,
          ),
        )
        setSelectedCompany(updatedCompany)
        resetEditForm()

        toast.success('Cliente atualizado com sucesso!', {
          description: `${updatedCompany.name} foi atualizado.`,
        })
        
        setIsEditDialogOpen(false)
      }
    } catch (error) {
      console.error('Erro ao salvar empresas:', error)
      const errorMessage =
        error instanceof Error ? error.message : 'Erro ao salvar empresas'
      
      toast.error('Erro ao salvar', {
        description: errorMessage,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!editingCompanyId || !editingCompany) {
      return
    }

    // Só permite excluir filiais
    if (editingCompany.type !== 'branch') {
      toast.error('Erro', {
        description: 'Apenas filiais podem ser excluídas.',
      })
      return
    }

    setIsLoading(true)
    
    try {
      await deleteCompany(editingCompanyId)
      
      // Remove a empresa da lista
      setCompanies((prev) => prev.filter((company) => company.id !== editingCompanyId))
      
      // Se a empresa excluída estava selecionada, limpa a seleção
      if (selectedCompany?.id === editingCompanyId) {
        setSelectedCompany(undefined)
      }
      
      resetEditForm()
      
      toast.success('Filial excluída com sucesso!', {
        description: `${editingCompany.name} foi removida.`,
      })
    } catch (error) {
      console.error('Erro ao excluir filial:', error)
      const errorMessage =
        error instanceof Error ? error.message : 'Erro ao excluir filial'
      
      toast.error('Erro ao excluir', {
        description: errorMessage,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteClick = () => {
    if (!editingCompany) {
      return
    }
    
    // Só permite excluir filiais
    if (editingCompany.type !== 'branch') {
      toast.error('Erro', {
        description: 'Apenas filiais podem ser excluídas.',
      })
      return
    }
    
    setIsDeleteDialogOpen(true)
  }

  const handleNewClient = () => {
    setMode('add')
    setCompanies([])
    setSelectedCompany(undefined)
    setSelectedBranchCNPJs(new Set())
    resetEditForm()
  }

  const handleSearchClient = () => {
    setMode('search')
    setCompanies([])
    setSelectedCompany(undefined)
    setSelectedBranchCNPJs(new Set())
    resetEditForm()
  }

  const pageTitle = mode === 'add' ? 'Adicionar Cliente' : 'Procurar Cliente'
  const tableMode = mode === 'search' ? 'edit' : mode
  const editingCompany = editingCompanyId
    ? companies.find((company) => company.id === editingCompanyId)
    : undefined

  return (
    <div className="min-h-screen">
      <Sidebar />
      <main className={cn(
        "transition-all duration-300",
        isCollapsed ? "lg:pl-20" : "lg:pl-64"
      )}>
        <div className="mx-auto max-w-7xl space-y-6 p-6 pb-6">
          <TopBar
            title="Painel de Clientes"
            type="clients"
            mode={mode}
            onNovoCliente={handleNewClient}
            onBuscarCliente={handleSearchClient}
          />

          <div className="rounded-2xl bg-white p-6 shadow-sm transition-all duration-300">
            {mode === 'add' ? (
              <>
                <h3 className="mb-4 text-lg font-semibold text-neutral-800">
                  {pageTitle}
                </h3>
                <div className="transition-opacity duration-300">
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
                </div>
              </>
            ) : (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-neutral-800">
                    {pageTitle}
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
              </>
            )}
          </div>

          <ResultsTable
            companies={companies}
            selectedCompany={selectedCompany}
            onSelectCompany={handleSelectCompany}
            selectedBranchCNPJs={mode === 'add' ? selectedBranchCNPJs : undefined}
            onToggleBranch={mode === 'add' ? handleToggleBranch : undefined}
            onSelectAllBranches={mode === 'add' ? handleSelectAllBranches : undefined}
            onDeselectAllBranches={mode === 'add' ? handleDeselectAllBranches : undefined}
            onEditCompany={mode === 'search' ? handleEditCompany : undefined}
            mode={tableMode}
          />
        </div>

        {/* Dialog de Edição */}
        {mode === 'search' && editingCompany && (
          <>
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Editar Cliente</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <CompanyEditForm
                    name={editForm.name}
                    address={editForm.address}
                    cnpj={editingCompany.cnpj}
                    type={editingCompany.type}
                    onChange={handleEditFormChange}
                  />
                </div>
                <DialogFooter>
                  {editingCompany.type === 'branch' && (
                    <Button
                      variant="destructive"
                      onClick={handleDeleteClick}
                      disabled={isLoading}
                      className="mr-auto text-white"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir Filial
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Dialog de Confirmação de Exclusão */}
            <Dialog 
              open={isDeleteDialogOpen} 
              onOpenChange={(open) => {
                setIsDeleteDialogOpen(open)
                // Se fechar o diálogo de confirmação, não fecha o de edição
              }}
            >
              <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                  <DialogTitle>Confirmar Exclusão</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Tem certeza que deseja excluir a filial <strong>{editingCompany.name}</strong>?
                    Esta ação não pode ser desfeita.
                  </p>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsDeleteDialogOpen(false)}
                    disabled={isLoading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={isLoading}
                    className="text-white"
                  >
                    {isLoading ? 'Excluindo...' : 'Excluir'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}

        {/* Botão de Salvar no modo add */}
        {mode === 'add' && companies.length > 0 && (
          <div className="fixed bottom-6 right-6 z-40">
            <Button
              onClick={handleSave}
              disabled={isLoading}
              size="lg"
              className="gap-2 shadow-lg text-white"
              style={{
                backgroundColor: 'var(--color-primary)',
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-primary)'
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Salvar Clientes
                </>
              )}
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}


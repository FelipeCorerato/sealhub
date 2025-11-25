import type { Company, Status } from '@/types'
import { statusLabels, companyTypeLabels } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Building2, MapPin, CheckSquare2, Square } from 'lucide-react'
import { formatCNPJ, getCNPJBase, onlyNumbers } from '@/lib/cnpj'
import { cn } from '@/lib/utils'

interface ResultsTableProps {
  companies: Company[]
  selectedCompany?: Company
  onSelectCompany: (company: Company) => void
  selectedBranchCNPJs?: Set<string> // CNPJs das filiais selecionadas
  onToggleBranch?: (cnpj: string, checked: boolean) => void // Callback para alternar seleção
  onSelectAllBranches?: () => void // Callback para selecionar todas as filiais
  onDeselectAllBranches?: () => void // Callback para deselecionar todas as filiais
  onEditCompany?: (company: Company) => void
  mode?: 'add' | 'edit'
}

const statusColors: Record<Status, string> = {
  active:
    'bg-[var(--color-status-ativa-bg)] text-[var(--color-status-ativa)] border-[var(--color-status-ativa)]',
  closed:
    'bg-[var(--color-status-baixada-bg)] text-[var(--color-status-baixada)] border-[var(--color-status-baixada)]',
  suspended:
    'bg-[var(--color-status-suspensa-bg)] text-[var(--color-status-suspensa)] border-[var(--color-status-suspensa)]',
}

// Agrupa empresas por CNPJ base (matriz + suas filiais)
function groupCompaniesByBase(companies: Company[]): Map<string, { matriz?: Company; filiais: Company[] }> {
  const groups = new Map<string, { matriz?: Company; filiais: Company[] }>()
  
  companies.forEach((company) => {
    const base = getCNPJBase(onlyNumbers(company.cnpj))
    
    if (!groups.has(base)) {
      groups.set(base, { filiais: [] })
    }
    
    const group = groups.get(base)!
    
    if (company.type === 'headquarters') {
      group.matriz = company
    } else {
      group.filiais.push(company)
    }
  })
  
  return groups
}

// Componente para renderizar um grupo de matriz + filiais
interface CompanyGroupProps {
  matriz?: Company
  filiais: Company[]
  selectedCompany?: Company
  onSelectCompany: (company: Company) => void
  onEditCompany?: (company: Company) => void
  mode: 'add' | 'edit'
}

function CompanyGroup({
  matriz,
  filiais,
  selectedCompany,
  onSelectCompany,
  onEditCompany,
  mode,
}: CompanyGroupProps) {
  return (
    <div className="space-y-6">
      {/* Card da Matriz - Evidenciado */}
      {matriz && (
        <div
          onClick={() => {
            if (mode === 'edit' && onEditCompany) {
              onEditCompany(matriz)
            } else {
              onSelectCompany(matriz)
            }
          }}
          className={cn(
            'group relative rounded-2xl border-2 border-[var(--color-primary)] bg-white dark:bg-neutral-800 p-6 shadow-lg transition-all hover:shadow-xl cursor-pointer',
            selectedCompany?.cnpj === matriz.cnpj && 'ring-4 ring-[var(--color-primary)]/20',
          )}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-primary)] text-white shadow-md">
                  <span title="Ícone de prédio">
                    <Building2 className="h-6 w-6" aria-label="Ícone de prédio" />
                  </span>
                </div>
                <div>
                  <Badge className="bg-[var(--color-primary)] text-white border-0">
                    {companyTypeLabels[matriz.type]}
                  </Badge>
                </div>
              </div>

              <h3 className="mb-2 text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                {matriz.name}
              </h3>

              <div className="mb-4 space-y-2 text-sm text-neutral-600 dark:text-neutral-300">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-neutral-800 dark:text-neutral-200">
                    {formatCNPJ(matriz.cnpj)}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span title="Ícone de marcador de localização">
                    <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-neutral-400 dark:text-neutral-500" aria-label="Ícone de marcador de localização" />
                  </span>
                  <span className="dark:text-neutral-300">{matriz.address}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Badge
                  variant="outline"
                  className={cn('font-medium', statusColors[matriz.status])}
                >
                  {statusLabels[matriz.status]}
                </Badge>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Lista de Filiais */}
      {filiais.length > 0 && (
        <div className="rounded-2xl bg-white dark:bg-neutral-800 p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">
              Filiais ({filiais.length})
            </h4>
          </div>

          <div className="space-y-3">
            {filiais.map((filial, index) => (
              <div
                key={`${filial.cnpj}-${index}`}
                onClick={() => {
                  if (mode === 'edit' && onEditCompany) {
                    onEditCompany(filial)
                  } else {
                    onSelectCompany(filial)
                  }
                }}
                className={cn(
                  'group relative flex items-start gap-4 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4 transition-all cursor-pointer hover:border-[var(--color-primary)]/30 hover:bg-neutral-50 dark:hover:bg-neutral-700/50',
                )}
              >
                <div className="flex-1 min-w-0">
                  <div className="mb-2 flex items-center gap-3">
                    <div className="flex h-2 w-2 rounded-full bg-neutral-400 flex-shrink-0" />
                    <h5 className="font-semibold text-neutral-900 dark:text-neutral-100">
                      {filial.name}
                    </h5>
                  </div>

                  <div className="ml-5 space-y-1 text-sm text-neutral-600 dark:text-neutral-300">
                    <div className="font-mono text-xs text-neutral-500 dark:text-neutral-400">
                      {formatCNPJ(filial.cnpj)}
                    </div>
                    <div className="flex items-start gap-2">
                      <span title="Ícone de marcador de localização">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-neutral-400 dark:text-neutral-500" aria-label="Ícone de marcador de localização" />
                  </span>
                      <span className="text-xs dark:text-neutral-300">{filial.address}</span>
                    </div>
                  </div>

                  <div className="ml-5 mt-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-xs font-medium',
                        statusColors[filial.status],
                      )}
                    >
                      {statusLabels[filial.status]}
                    </Badge>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function ResultsTable({
  companies,
  selectedCompany,
  onSelectCompany,
  selectedBranchCNPJs,
  onToggleBranch,
  onSelectAllBranches,
  onDeselectAllBranches,
  onEditCompany,
  mode = 'add',
}: ResultsTableProps) {
  if (companies.length === 0) {
    return null
  }

  // Agrupa empresas por CNPJ base
  const groups = groupCompaniesByBase(companies)
  
  // Se não há callback para alternar, todas filiais estão selecionadas por padrão
  const isSingleGroup = groups.size === 1
  
  const isBranchSelected = (cnpj: string) => {
    if (!selectedBranchCNPJs) return true // Padrão: todas selecionadas
    return selectedBranchCNPJs.has(cnpj)
  }
  
  // Se houver múltiplos grupos (listagem de todos os clientes), renderiza cada grupo separadamente
  if (!isSingleGroup) {
    const groupsArray = Array.from(groups.entries()).sort((a, b) => {
      // Ordena por nome da matriz
      const nomeA = a[1].matriz?.name || a[1].filiais[0]?.name || ''
      const nomeB = b[1].matriz?.name || b[1].filiais[0]?.name || ''
      return nomeA.localeCompare(nomeB)
    })
    
    return (
      <div className="space-y-8">
        {groupsArray.map(([base, group]) => (
          <CompanyGroup
            key={base}
            matriz={group.matriz}
            filiais={group.filiais}
            selectedCompany={selectedCompany}
            onSelectCompany={onSelectCompany}
            onEditCompany={onEditCompany}
            mode={mode}
          />
        ))}
      </div>
    )
  }
  
  // Para busca específica (um único grupo), renderiza com checkbox de seleção de filiais
  const [group] = Array.from(groups.values())
  const matriz = group.matriz
  const filiais = group.filiais

  return (
    <div className="space-y-6">
      {/* Card da Matriz - Evidenciado */}
      {matriz && (
        <div
          onClick={() => {
            if (mode === 'edit' && onEditCompany) {
              onEditCompany(matriz)
            } else {
              onSelectCompany(matriz)
            }
          }}
          className={cn(
            'group relative rounded-2xl border-2 border-[var(--color-primary)] bg-white dark:bg-neutral-800 p-6 shadow-lg transition-all hover:shadow-xl cursor-pointer',
            selectedCompany?.cnpj === matriz.cnpj && 'ring-4 ring-[var(--color-primary)]/20',
          )}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-primary)] text-white shadow-md">
                  <span title="Ícone de prédio">
                    <Building2 className="h-6 w-6" aria-label="Ícone de prédio" />
                  </span>
                </div>
                <div>
                  <Badge className="bg-[var(--color-primary)] text-white border-0">
                    {companyTypeLabels[matriz.type]}
                  </Badge>
                </div>
              </div>

              <h3 className="mb-2 text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                {matriz.name}
              </h3>

              <div className="mb-4 space-y-2 text-sm text-neutral-600 dark:text-neutral-300">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-neutral-800 dark:text-neutral-200">
                    {formatCNPJ(matriz.cnpj)}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span title="Ícone de marcador de localização">
                    <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-neutral-400 dark:text-neutral-500" aria-label="Ícone de marcador de localização" />
                  </span>
                  <span className="dark:text-neutral-300">{matriz.address}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Badge
                  variant="outline"
                  className={cn('font-medium', statusColors[matriz.status])}
                >
                  {statusLabels[matriz.status]}
                </Badge>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Lista de Filiais com seleção */}
      {filiais.length > 0 && (
        <div className="rounded-2xl bg-white dark:bg-neutral-800 p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">
              Filiais ({filiais.length})
            </h4>
            {mode === 'add' && onSelectAllBranches && onDeselectAllBranches && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onDeselectAllBranches}
                  className="h-8 text-xs"
                >
                  <span title="Ícone de quadrado vazio">
                    <Square className="mr-1.5 h-3.5 w-3.5" aria-label="Ícone de quadrado vazio" />
                  </span>
                  Deselecionar todas
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onSelectAllBranches}
                  className="h-8 text-xs"
                >
                  <span title="Ícone de quadrado com marca de seleção">
                    <CheckSquare2 className="mr-1.5 h-3.5 w-3.5" aria-label="Ícone de quadrado com marca de seleção" />
                  </span>
                  Selecionar todas
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-3">
            {filiais.map((filial, index) => {
              const isBranchChecked = isBranchSelected(filial.cnpj)
              
              return (
                <div
                  key={`${filial.cnpj}-${index}`}
                  onClick={() => {
                    if (mode === 'add' && onToggleBranch) {
                      onToggleBranch(filial.cnpj, !isBranchChecked)
                    } else if (mode === 'edit' && onEditCompany) {
                      onEditCompany(filial)
                    } else {
                      onSelectCompany(filial)
                    }
                  }}
                  className={cn(
                    'group relative flex items-start gap-4 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4 transition-all cursor-pointer hover:border-[var(--color-primary)]/30 hover:bg-neutral-50 dark:hover:bg-neutral-700/50',
                    !isBranchChecked && 'opacity-60',
                  )}
                >
                  {/* Checkbox para selecionar filial */}
                  {mode === 'add' && onToggleBranch && (
                    <div 
                      className="mt-0.5 flex-shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Checkbox
                        checked={isBranchChecked}
                        onCheckedChange={(checked) => {
                          onToggleBranch(filial.cnpj, checked === true)
                        }}
                      />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="mb-2 flex items-center gap-3">
                      <div className="flex h-2 w-2 rounded-full bg-neutral-400 flex-shrink-0" />
                      <h5 className={cn(
                        'font-semibold text-neutral-900 dark:text-neutral-100',
                        !isBranchChecked && 'line-through text-neutral-500 dark:text-neutral-600'
                      )}>
                        {filial.name}
                      </h5>
                    </div>

                    <div className="ml-5 space-y-1 text-sm text-neutral-600 dark:text-neutral-300">
                      <div className={cn(
                        'font-mono text-xs',
                        isBranchChecked ? 'text-neutral-500 dark:text-neutral-400' : 'text-neutral-400 dark:text-neutral-600'
                      )}>
                        {formatCNPJ(filial.cnpj)}
                      </div>
                      <div className="flex items-start gap-2">
                        <span title="Ícone de marcador de localização">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-neutral-400 dark:text-neutral-500" aria-label="Ícone de marcador de localização" />
                  </span>
                        <span className={cn(
                          'text-xs',
                          !isBranchChecked && 'text-neutral-400 dark:text-neutral-600'
                        )}>
                          {filial.address}
                        </span>
                      </div>
                    </div>

                    <div className="ml-5 mt-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-xs font-medium',
                          statusColors[filial.status],
                        )}
                      >
                        {statusLabels[filial.status]}
                      </Badge>
                    </div>
                  </div>

                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}


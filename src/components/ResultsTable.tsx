import type { Company, Status } from '@/types'
import { statusLabels, companyTypeLabels } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { MoreVertical, Edit, Copy, Building2, MapPin, CheckSquare2, Square } from 'lucide-react'
import { formatCNPJ } from '@/lib/cnpj'
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

  // Separa matriz e filiais
  const matriz = companies.find(c => c.type === 'headquarters')
  const filiais = companies.filter(c => c.type === 'branch')
  
  // Se não há callback para alternar, todas filiais estão selecionadas por padrão
  const isBranchSelected = (cnpj: string) => {
    if (!selectedBranchCNPJs) return true // Padrão: todas selecionadas
    return selectedBranchCNPJs.has(cnpj)
  }

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
            'group relative rounded-2xl border-2 border-[var(--color-primary)] bg-gradient-to-br from-[var(--color-primary)]/5 to-white p-6 shadow-lg transition-all hover:shadow-xl cursor-pointer',
            selectedCompany?.cnpj === matriz.cnpj && 'ring-4 ring-[var(--color-primary)]/20',
          )}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-primary)] text-white shadow-md">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <Badge className="bg-[var(--color-primary)] text-white border-0">
                    {companyTypeLabels[matriz.type]}
                  </Badge>
                </div>
              </div>

              <h3 className="mb-2 text-2xl font-bold text-neutral-900">
                {matriz.name}
              </h3>

              <div className="mb-4 space-y-2 text-sm text-neutral-600">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-neutral-800">
                    {formatCNPJ(matriz.cnpj)}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-neutral-400" />
                  <span>{matriz.address}</span>
                </div>
              </div>

              {mode === 'add' && (
                <div className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className={cn('font-medium', statusColors[matriz.status])}
                  >
                    {statusLabels[matriz.status]}
                  </Badge>
                </div>
              )}
            </div>

            {mode === 'add' && (
              <div onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        console.log('Editar', matriz)
                      }}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        navigator.clipboard.writeText(matriz.cnpj)
                      }}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copiar CNPJ
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>

        </div>
      )}

      {/* Lista de Filiais */}
      {filiais.length > 0 && (
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-lg font-semibold text-neutral-800">
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
                  <Square className="mr-1.5 h-3.5 w-3.5" />
                  Deselecionar todas
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onSelectAllBranches}
                  className="h-8 text-xs"
                >
                  <CheckSquare2 className="mr-1.5 h-3.5 w-3.5" />
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
                    'group relative flex items-start gap-4 rounded-xl border border-neutral-200 p-4 transition-all cursor-pointer hover:border-[var(--color-primary)]/30 hover:bg-neutral-50',
                    !isBranchChecked && 'opacity-60',
                  )}
                >
                  {/* Checkbox para selecionar filial */}
                  {mode === 'add' && onToggleBranch && (
                    <div 
                      className="mt-0.5 flex-shrink-0"
                      onClick={(e) => e.stopPropagation()} // Evita duplicar o toggle quando clica no checkbox
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
                        'font-semibold text-neutral-900',
                        !isBranchChecked && 'line-through text-neutral-500'
                      )}>
                        {filial.name}
                      </h5>
                    </div>

                    <div className="ml-5 space-y-1 text-sm text-neutral-600">
                      <div className={cn(
                        'font-mono text-xs',
                        isBranchChecked ? 'text-neutral-500' : 'text-neutral-400'
                      )}>
                        {formatCNPJ(filial.cnpj)}
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-neutral-400" />
                        <span className={cn(
                          'text-xs',
                          !isBranchChecked && 'text-neutral-400'
                        )}>
                          {filial.address}
                        </span>
                      </div>
                    </div>

                    {mode === 'add' && (
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
                    )}
                  </div>

                  {/* Menu de ações da filial */}
                  {mode === 'add' && (
                    <div 
                      className="flex-shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              console.log('Editar', filial)
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              navigator.clipboard.writeText(filial.cnpj)
                            }}
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            Copiar CNPJ
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}

                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}


import type { Company, Status } from '@/types'
import { statusLabels, companyTypeLabels } from '@/types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { MoreVertical, Edit, Copy, Trash2 } from 'lucide-react'
import { formatCNPJ } from '@/lib/cnpj'
import { cn } from '@/lib/utils'

interface ResultsTableProps {
  companies: Company[]
  selectedCompany?: Company
  onSelectCompany: (company: Company) => void
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
}: ResultsTableProps) {
  if (companies.length === 0) {
    return null
  }

  return (
    <div className="rounded-2xl bg-white shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="sticky top-0 bg-white">CNPJ</TableHead>
              <TableHead className="sticky top-0 bg-white">Nome</TableHead>
              <TableHead className="sticky top-0 bg-white">Endereço</TableHead>
              <TableHead className="sticky top-0 bg-white">Tipo</TableHead>
              <TableHead className="sticky top-0 bg-white">Situação</TableHead>
              <TableHead className="sticky top-0 bg-white text-right">
                Ação
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companies.map((company, index) => {
              const isSelected = selectedCompany?.cnpj === company.cnpj
              return (
                <TableRow
                  key={`${company.cnpj}-${index}`}
                  onClick={() => onSelectCompany(company)}
                  className={cn(
                    'cursor-pointer transition-colors hover:bg-neutral-50',
                    isSelected && 'bg-[#D97B35]/10',
                  )}
                >
                  <TableCell className="font-mono text-sm">
                    {formatCNPJ(company.cnpj)}
                  </TableCell>
                  <TableCell className="font-medium">{company.name}</TableCell>
                  <TableCell className="text-sm text-neutral-600">
                    {company.address}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-neutral-700">
                      {companyTypeLabels[company.type]}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn('font-medium', statusColors[company.status])}
                    >
                      {statusLabels[company.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
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
                            console.log('Editar', company)
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            navigator.clipboard.writeText(company.cnpj)
                          }}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Copiar CNPJ
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            console.log('Excluir', company)
                          }}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}


import type { Company } from '@/types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { formatCNPJ } from '@/lib/cnpj'

interface ClientSelectionTableProps {
  companies: Company[]
  selectedIds: Set<string>
  onToggleClient: (id: string) => void
}

export function ClientSelectionTable({
  companies,
  selectedIds,
  onToggleClient,
}: ClientSelectionTableProps) {
  if (companies.length === 0) {
    return null
  }

  return (
    <div>
      <div className="mb-4">
        <p className="text-sm text-neutral-600">
          {companies.length} Resultado(s) encontrado(s) • {selectedIds.size} selecionado(s)
        </p>
      </div>
      <div className="overflow-x-auto rounded-lg border border-neutral-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="sticky top-0 w-16 bg-white">
                Incluir?
              </TableHead>
              <TableHead className="sticky top-0 bg-white">CNPJ</TableHead>
              <TableHead className="sticky top-0 bg-white">Nome</TableHead>
              <TableHead className="sticky top-0 bg-white">Endereço</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companies.map((company) => {
              const isSelected = selectedIds.has(company.id)
              return (
                <TableRow 
                  key={company.id} 
                  className="cursor-pointer hover:bg-neutral-50"
                  onClick={() => onToggleClient(company.id)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => onToggleClient(company.id)}
                      className="data-[state=checked]:bg-[#D97B35] data-[state=checked]:border-[#D97B35]"
                    />
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {formatCNPJ(company.cnpj)}
                  </TableCell>
                  <TableCell className="font-medium">{company.name}</TableCell>
                  <TableCell className="text-sm text-neutral-600">
                    {company.address}
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


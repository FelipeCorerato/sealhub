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
import { Button } from '@/components/ui/button'
import { Edit } from 'lucide-react'
import { formatCNPJ } from '@/lib/cnpj'

interface ClientSelectionTableProps {
  companies: Company[]
  selectedCNPJs: Set<string>
  onToggleClient: (cnpj: string) => void
}

export function ClientSelectionTable({
  companies,
  selectedCNPJs,
  onToggleClient,
}: ClientSelectionTableProps) {
  if (companies.length === 0) {
    return null
  }

  return (
    <div className="rounded-2xl bg-white shadow-sm">
      <div className="p-4">
        <p className="text-sm text-neutral-600">
          {companies.length} Resultado(s) encontrado(s)
        </p>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="sticky top-0 w-16 bg-white">
                Incluir?
              </TableHead>
              <TableHead className="sticky top-0 bg-white">CNPJ</TableHead>
              <TableHead className="sticky top-0 bg-white">Nome</TableHead>
              <TableHead className="sticky top-0 bg-white">Endereço</TableHead>
              <TableHead className="sticky top-0 bg-white text-right">
                Ação
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companies.map((company) => {
              const isSelected = selectedCNPJs.has(company.cnpj)
              return (
                <TableRow key={company.cnpj} className="hover:bg-neutral-50">
                  <TableCell>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => onToggleClient(company.cnpj)}
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
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        console.log('Editar', company)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
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


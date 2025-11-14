import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { formatCNPJ } from '@/lib/cnpj'
import { companyTypeLabels } from '@/types'
import type { CompanyType } from '@/types'

interface CompanyEditFormProps {
  name: string
  address: string
  cnpj: string
  type: CompanyType
  onChange: (field: 'name' | 'address', value: string) => void
}

export function CompanyEditForm({
  name,
  address,
  cnpj,
  type,
  onChange,
}: CompanyEditFormProps) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-neutral-800">Editar Cliente</h4>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-neutral-600">
          <span className="font-mono text-base text-neutral-800">
            {formatCNPJ(cnpj)}
          </span>
          <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-600">
            {companyTypeLabels[type]}
          </span>
        </div>
        <p className="mt-3 text-sm text-neutral-500">
          Atualize o nome e o endereço do cliente selecionado.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-700">
            Nome *
          </label>
          <Input
            value={name}
            onChange={(e) => onChange('name', e.target.value)}
            placeholder="Digite o nome"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-700">
            Endereço *
          </label>
          <Textarea
            value={address}
            onChange={(e) => onChange('address', e.target.value)}
            placeholder="Rua, número, bairro, cidade, estado"
            className="min-h-[120px]"
          />
        </div>
      </div>
    </div>
  )
}



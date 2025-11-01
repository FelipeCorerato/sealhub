import { Button } from '@/components/ui/button'
import { Save } from 'lucide-react'
import type { Company } from '@/types'
import { toast } from 'sonner'

interface FooterBarProps {
  selectedCompany?: Company
  onSave: () => void
}

export function FooterBar({ selectedCompany, onSave }: FooterBarProps) {
  const handleSave = () => {
    onSave()
    toast.success('Cliente salvo com sucesso!', {
      description: `${selectedCompany?.name} foi adicionado à sua lista de clientes.`,
    })
  }

  if (!selectedCompany) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-neutral-200 bg-white p-4 shadow-lg lg:left-64">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div>
          <p className="text-sm text-neutral-600">Adicionando Cliente:</p>
          <p className="text-lg font-semibold text-neutral-800">
            {selectedCompany.name}
          </p>
        </div>
        <Button
          onClick={handleSave}
          className="gap-2 bg-[#D97B35] text-white hover:bg-[#bd6126]"
        >
          <Save className="h-4 w-4" />
          Salvar
        </Button>
      </div>
    </div>
  )
}


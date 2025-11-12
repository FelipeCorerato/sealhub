import { Button } from '@/components/ui/button'
import { Save } from 'lucide-react'
import type { Company } from '@/types'
import { toast } from 'sonner'

interface FooterBarProps {
  selectedCompany?: Company
  mode: 'add' | 'edit'
  onSave: () => void
}

export function FooterBar({ selectedCompany, mode, onSave }: FooterBarProps) {
  const handleSave = () => {
    onSave()
    if (mode === 'add') {
      toast.success('Cliente salvo com sucesso!', {
        description: `${selectedCompany?.name} foi adicionado à sua lista de clientes.`,
      })
    } else {
      toast.success('Cliente atualizado com sucesso!', {
        description: `${selectedCompany?.name} foi atualizado.`,
      })
    }
  }

  if (!selectedCompany) {
    return null
  }

  const label = mode === 'add' ? 'Adicionando Cliente:' : 'Editando Cliente:'

  return (
    <div className="fixed bottom-0 left-0 right-0 animate-in slide-in-from-bottom-5 border-t border-neutral-200 bg-white p-4 shadow-lg duration-300 lg:left-64">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div>
          <p className="text-sm text-neutral-600">{label}</p>
          <p className="text-lg font-semibold text-neutral-800">
            {selectedCompany.name}
          </p>
        </div>
        <Button
          onClick={handleSave}
          className="gap-2 text-white transition-all hover:scale-105"
          style={{
            backgroundColor: 'var(--color-primary)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-primary)'
          }}
        >
          <Save className="h-4 w-4" />
          Salvar
        </Button>
      </div>
    </div>
  )
}


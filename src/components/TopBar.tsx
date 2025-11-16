import { Button } from '@/components/ui/button'
import { Plus, Search } from 'lucide-react'

interface TopBarProps {
  title: string
  mode?: 'add' | 'search' | 'add-to-existing'
  type?: 'clients' | 'campaigns'
  onNovoCliente?: () => void
  onBuscarCliente?: () => void
}

export function TopBar({
  title,
  mode,
  type = 'clients',
  onNovoCliente,
  onBuscarCliente,
}: TopBarProps) {
  const newLabel = type === 'campaigns' ? 'Nova Campanha' : 'Novo Cliente'
  const searchLabel =
    type === 'campaigns' ? 'Buscar Campanha' : 'Buscar Cliente'
  
  // Considera 'add-to-existing' como 'add' para o propósito de destacar botões
  const isAddMode = mode === 'add' || mode === 'add-to-existing'

  return (
    <div className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm">
      <h2 className="text-xl font-semibold text-neutral-800">{title}</h2>
      <div className="flex gap-3">
        <Button
          variant={mode === 'search' ? 'default' : 'outline'}
          onClick={onBuscarCliente}
          className="gap-2"
          style={
            mode === 'search'
              ? {
                  backgroundColor: 'var(--color-primary)',
                  color: 'white',
                }
              : undefined
          }
          onMouseEnter={(e) => {
            if (mode === 'search') {
              e.currentTarget.style.backgroundColor =
                'var(--color-primary-hover)'
            }
          }}
          onMouseLeave={(e) => {
            if (mode === 'search') {
              e.currentTarget.style.backgroundColor = 'var(--color-primary)'
            }
          }}
        >
          <Search className="h-4 w-4" />
          {searchLabel}
        </Button>
        <Button
          variant={isAddMode ? 'default' : 'outline'}
          onClick={onNovoCliente}
          className="gap-2"
          style={
            isAddMode
              ? {
                  backgroundColor: 'var(--color-primary)',
                  color: 'white',
                }
              : undefined
          }
          onMouseEnter={(e) => {
            if (isAddMode) {
              e.currentTarget.style.backgroundColor =
                'var(--color-primary-hover)'
            }
          }}
          onMouseLeave={(e) => {
            if (isAddMode) {
              e.currentTarget.style.backgroundColor = 'var(--color-primary)'
            }
          }}
        >
          <Plus className="h-4 w-4" />
          {newLabel}
        </Button>
      </div>
    </div>
  )
}


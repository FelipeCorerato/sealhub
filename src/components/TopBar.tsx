import { Button } from '@/components/ui/button'
import { Plus, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TopBarProps {
  title: string
  mode?: 'add' | 'search'
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

  return (
    <div className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm">
      <h2 className="text-xl font-semibold text-neutral-800">{title}</h2>
      <div className="flex gap-3">
        <Button
          variant={mode === 'search' ? 'default' : 'outline'}
          onClick={onBuscarCliente}
          className={cn(
            'gap-2',
            mode === 'search' &&
              'bg-[#D97B35] text-white hover:bg-[#bd6126]',
          )}
        >
          <Search className="h-4 w-4" />
          {searchLabel}
        </Button>
        <Button
          variant={mode === 'add' ? 'default' : 'outline'}
          onClick={onNovoCliente}
          className={cn(
            'gap-2',
            mode === 'add' && 'bg-[#D97B35] text-white hover:bg-[#bd6126]',
          )}
        >
          <Plus className="h-4 w-4" />
          {newLabel}
        </Button>
      </div>
    </div>
  )
}


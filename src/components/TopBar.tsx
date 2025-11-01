import { Button } from '@/components/ui/button'
import { Plus, Search } from 'lucide-react'

interface TopBarProps {
  onNovoCliente?: () => void
  onBuscarCliente?: () => void
}

export function TopBar({ onNovoCliente, onBuscarCliente }: TopBarProps) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm">
      <h2 className="text-xl font-semibold text-neutral-800">
        Gerenciar Clientes
      </h2>
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={onBuscarCliente}
          className="gap-2"
        >
          <Search className="h-4 w-4" />
          Buscar Cliente
        </Button>
        <Button
          onClick={onNovoCliente}
          className="gap-2 bg-[#D97B35] text-white hover:bg-[#bd6126]"
        >
          <Plus className="h-4 w-4" />
          Novo Cliente
        </Button>
      </div>
    </div>
  )
}


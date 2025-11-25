import { Button } from '@/components/ui/button'
import { Plus, Search } from 'lucide-react'

interface TopBarProps {
  title: string
  mode?: 'add' | 'search' | 'add-to-existing' | 'edit' | 'geral' | 'usuarios'
  type?: 'clients' | 'campaigns' | 'admin'
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
  const newLabel = type === 'admin' 
    ? 'Geral' 
    : type === 'campaigns' 
      ? (mode === 'edit' ? 'Editar Campanha' : 'Nova Campanha')
      : 'Novo Cliente'
  const searchLabel = type === 'admin' ? 'Usuários' : type === 'campaigns' ? 'Buscar Campanha' : 'Buscar Cliente'
  
  // Considera 'add-to-existing' e 'edit' como 'add' para o propósito de destacar botões
  const isAddMode = mode === 'add' || mode === 'add-to-existing' || mode === 'edit' || mode === 'geral'
  const isSearchMode = mode === 'search' || mode === 'usuarios'

  return (
    <div className="flex items-center justify-between rounded-2xl bg-white p-3 shadow-sm sm:p-4">
      <h2 className="text-lg font-semibold text-neutral-800 sm:text-xl">{title}</h2>
      <div className="flex gap-2 sm:gap-3">
        <Button
          variant={isSearchMode ? 'default' : 'outline'}
          onClick={onBuscarCliente}
          className="gap-2"
          title={searchLabel}
          aria-label={searchLabel}
          style={
            isSearchMode
              ? {
                  backgroundColor: 'var(--color-primary)',
                  color: 'white',
                }
              : undefined
          }
          onMouseEnter={(e) => {
            if (isSearchMode) {
              e.currentTarget.style.backgroundColor =
                'var(--color-primary-hover)'
            }
          }}
          onMouseLeave={(e) => {
            if (isSearchMode) {
              e.currentTarget.style.backgroundColor = 'var(--color-primary)'
            }
          }}
        >
          {type !== 'admin' && (
            <span title="Ícone de lupa de busca">
              <Search className="h-4 w-4" aria-label="Ícone de lupa de busca" />
            </span>
          )}
          <span className={type === 'admin' ? '' : 'hidden sm:inline'}>{searchLabel}</span>
        </Button>
        <Button
          variant={isAddMode ? 'default' : 'outline'}
          onClick={onNovoCliente}
          className="gap-2"
          title={newLabel}
          aria-label={newLabel}
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
          {type !== 'admin' && (
            <span title="Ícone de sinal de mais">
              <Plus className="h-4 w-4" aria-label="Ícone de sinal de mais" />
            </span>
          )}
          <span className={type === 'admin' ? '' : 'hidden sm:inline'}>{newLabel}</span>
        </Button>
      </div>
    </div>
  )
}


import { Button } from '@/components/ui/button'
import { Save, Loader2 } from 'lucide-react'
import type { Company } from '@/types'
import { formatCNPJ } from '@/lib/cnpj'
import { cn } from '@/lib/utils'

interface FooterBarProps {
  company?: Company // Empresa selecionada (matriz no modo add ou cliente em edição)
  selectedBranchesCount?: number // Quantidade de filiais selecionadas
  mode: 'add' | 'edit'
  isLoading?: boolean // Estado de carregamento
  onSave: () => void
}

export function FooterBar({ 
  company, 
  selectedBranchesCount, 
  mode, 
  isLoading = false,
  onSave 
}: FooterBarProps) {
  if (!company) {
    return null
  }

  const label = mode === 'add' ? 'Adicionar' : 'Editar'

  return (
    <div 
      className={cn(
        "fixed bottom-0 left-0 right-0 animate-in slide-in-from-bottom-5 border-t border-neutral-200 bg-white p-3 shadow-lg duration-300 transition-all sm:p-4",
"lg:left-64"
      )} 
      style={{ zIndex: 'var(--z-footer)' }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <div className="flex items-center gap-3 overflow-hidden sm:gap-6">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-neutral-600 sm:text-sm">{label}</p>
            <p className="truncate text-base font-semibold text-neutral-800 sm:text-lg">
              {company.name}
            </p>
          </div>
          <div className="hidden sm:block">
            <p className="text-xs text-neutral-500">CNPJ</p>
            <p className="text-sm font-mono font-medium text-neutral-700">
              {formatCNPJ(company.cnpj)}
            </p>
          </div>
          {mode === 'add' && selectedBranchesCount !== undefined && (
            <div className="hidden md:block">
              <p className="text-xs text-neutral-500">Filiais</p>
              <p className="text-sm font-medium text-neutral-700">
                {selectedBranchesCount === 0 
                  ? 'Nenhuma selecionada' 
                  : selectedBranchesCount === 1 
                  ? '1 filial selecionada'
                  : `${selectedBranchesCount} filiais selecionadas`}
              </p>
            </div>
          )}
        </div>
        <Button
          onClick={onSave}
          disabled={isLoading}
          className="shrink-0 gap-2 text-white transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          title={isLoading ? "Salvando..." : "Salvar"}
          aria-label={isLoading ? "Salvando..." : "Salvar"}
          style={{
            backgroundColor: isLoading ? 'var(--color-primary)' : 'var(--color-primary)',
          }}
          onMouseEnter={(e) => {
            if (!isLoading) {
              e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)'
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-primary)'
          }}
        >
          {isLoading ? (
            <>
              <span title="Ícone de carregamento girando">
                <Loader2 className="h-4 w-4 animate-spin" aria-label="Ícone de carregamento girando" />
              </span>
              <span className="hidden sm:inline">Salvando...</span>
            </>
          ) : (
            <>
              <span title="Ícone de disco de salvar">
                <Save className="h-4 w-4" aria-label="Ícone de disco de salvar" />
              </span>
              <span className="hidden sm:inline">Salvar</span>
            </>
          )}
        </Button>
      </div>
    </div>
  )
}


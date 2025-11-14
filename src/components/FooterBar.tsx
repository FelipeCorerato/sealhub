import { Button } from '@/components/ui/button'
import { Save, Loader2 } from 'lucide-react'
import type { Company } from '@/types'
import { formatCNPJ } from '@/lib/cnpj'
import { useSidebar } from '@/contexts/SidebarContext'
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
  const { isCollapsed } = useSidebar()
  
  if (!company) {
    return null
  }

  const label = mode === 'add' ? 'Adicionar' : 'Editar'

  return (
    <div 
      className={cn(
        "fixed bottom-0 left-0 right-0 animate-in slide-in-from-bottom-5 border-t border-neutral-200 bg-white p-4 shadow-lg duration-300 transition-all",
        isCollapsed ? "lg:left-20" : "lg:left-64"
      )} 
      style={{ zIndex: 'var(--z-footer)' }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex items-center gap-6">
          <div>
            <p className="text-sm text-neutral-600">{label}</p>
            <p className="text-lg font-semibold text-neutral-800">
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
          className="gap-2 text-white transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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
              <Loader2 className="h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Salvar
            </>
          )}
        </Button>
      </div>
    </div>
  )
}


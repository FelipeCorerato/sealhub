import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Loader2, Info } from 'lucide-react'
import {
  formatCNPJ,
  validateCNPJ,
  getRemainingDigits,
  onlyNumbers,
} from '@/lib/cnpj'

interface SearchCNPJProps {
  onSearch: (cnpj: string) => void
  isLoading?: boolean
}

export function SearchCNPJ({ onSearch, isLoading = false }: SearchCNPJProps) {
  const [value, setValue] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCNPJ(e.target.value)
    setValue(formatted)
  }

  const handleSearch = () => {
    if (validateCNPJ(value)) {
      onSearch(onlyNumbers(value))
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && validateCNPJ(value)) {
      handleSearch()
    }
  }

  const isValid = validateCNPJ(value)
  const remaining = getRemainingDigits(value)

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-neutral-800">
        Buscar por CNPJ
      </h3>
      
      {/* Disclaimer sobre demora na API */}
      {!isLoading && (
        <div className="mb-4 rounded-lg border border-neutral-200 bg-neutral-50 p-3.5">
          <div className="flex gap-3 items-start">
            <span title="Ícone de informação">
              <Info className="h-4 w-4 shrink-0 mt-0.5" style={{ color: 'var(--color-primary)' }} aria-label="Ícone de informação" />
            </span>
            <div className="flex-1">
              <p className="text-sm text-neutral-600 leading-relaxed">
                A consulta à API da Receita Federal pode levar alguns segundos. Aguarde o carregamento.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mensagem de loading ativa */}
      {isLoading && (
        <div 
          className="cnpj-loading-disclaimer mb-4 rounded-lg border-2 p-4" 
          style={{ 
            borderColor: 'var(--color-primary)', 
            backgroundColor: 'var(--color-primary-light)' 
          }}
        >
          <div className="flex gap-3 items-center">
            <span title="Ícone de carregamento girando">
              <Loader2 className="h-5 w-5 shrink-0 animate-spin" style={{ color: 'var(--color-primary)' }} aria-label="Ícone de carregamento girando" />
            </span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-neutral-700 mb-1">
                Consultando dados na Receita Federal...
              </p>
              <p className="text-xs text-neutral-600">
                Este processo pode levar até 30 segundos. Por favor, não feche esta tela.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex gap-3">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="00.000.000/0001-00"
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            maxLength={18}
            disabled={isLoading}
            className="font-mono text-base"
          />
          {!isValid && value.length > 0 && (
            <p className="mt-2 text-sm text-neutral-500">
              {remaining === 1
                ? `Falta ${remaining} número`
                : `Faltam ${remaining} números`}
            </p>
          )}
        </div>
        <Button
          onClick={handleSearch}
          disabled={!isValid || isLoading}
          className="gap-2 text-white disabled:bg-neutral-300"
          style={
            !isValid || isLoading
              ? undefined
              : {
                  backgroundColor: 'var(--color-primary)',
                }
          }
          onMouseEnter={(e) => {
            if (isValid && !isLoading) {
              e.currentTarget.style.backgroundColor =
                'var(--color-primary-hover)'
            }
          }}
          onMouseLeave={(e) => {
            if (isValid && !isLoading) {
              e.currentTarget.style.backgroundColor = 'var(--color-primary)'
            }
          }}
        >
          {isLoading ? (
            <>
              <span title="Ícone de carregamento girando">
                <Loader2 className="h-4 w-4 animate-spin" aria-label="Ícone de carregamento girando" />
              </span>
              Buscando...
            </>
          ) : (
            <>
              <span title="Ícone de lupa de busca">
                <Search className="h-4 w-4" aria-label="Ícone de lupa de busca" />
              </span>
              Buscar
            </>
          )}
        </Button>
      </div>
    </div>
  )
}


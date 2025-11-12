import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Loader2 } from 'lucide-react'
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
              <Loader2 className="h-4 w-4 animate-spin" />
              Buscando...
            </>
          ) : (
            <>
              <Search className="h-4 w-4" />
              Buscar
            </>
          )}
        </Button>
      </div>
    </div>
  )
}


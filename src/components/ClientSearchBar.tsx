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

interface ClientSearchBarProps {
  onSearchByName: (name: string) => void
  onSearchByCNPJ: (cnpj: string) => void
  isLoading?: boolean
}

export function ClientSearchBar({
  onSearchByName,
  onSearchByCNPJ,
  isLoading = false,
}: ClientSearchBarProps) {
  const [nameValue, setNameValue] = useState('')
  const [cnpjValue, setCnpjValue] = useState('')

  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCNPJ(e.target.value)
    setCnpjValue(formatted)
  }

  const handleSearchByName = () => {
    if (nameValue.trim().length >= 3) {
      onSearchByName(nameValue.trim())
    }
  }

  const handleSearchByCNPJ = () => {
    if (validateCNPJ(cnpjValue)) {
      onSearchByCNPJ(onlyNumbers(cnpjValue))
    }
  }

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && nameValue.trim().length >= 3) {
      handleSearchByName()
    }
  }

  const handleCnpjKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && validateCNPJ(cnpjValue)) {
      handleSearchByCNPJ()
    }
  }

  const isCnpjValid = validateCNPJ(cnpjValue)
  const remaining = getRemainingDigits(cnpjValue)
  const isNameValid = nameValue.trim().length >= 3

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        {/* Busca por Nome */}
        <div className="flex-1">
          <label className="mb-2 block text-sm font-medium text-neutral-700">
            Buscar por nome do cliente *
          </label>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Ex: Iasa Impressionante"
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              onKeyDown={handleNameKeyDown}
              disabled={isLoading}
              className="text-base"
            />
            <Button
              onClick={handleSearchByName}
              disabled={!isNameValid || isLoading}
              className="gap-2 text-white disabled:bg-neutral-300"
              style={
                !isNameValid || isLoading
                  ? undefined
                  : {
                      backgroundColor: 'var(--color-primary)',
                    }
              }
              onMouseEnter={(e) => {
                if (isNameValid && !isLoading) {
                  e.currentTarget.style.backgroundColor =
                    'var(--color-primary-hover)'
                }
              }}
              onMouseLeave={(e) => {
                if (isNameValid && !isLoading) {
                  e.currentTarget.style.backgroundColor =
                    'var(--color-primary)'
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
          {!isNameValid && nameValue.length > 0 && nameValue.length < 3 && (
            <p className="mt-2 text-sm text-neutral-500">
              Digite pelo menos 3 caracteres
            </p>
          )}
        </div>

        {/* Divisor OU */}
        <div className="flex items-center justify-center lg:pt-8">
          <span className="text-sm font-medium text-neutral-500">OU</span>
        </div>

        {/* Busca por CNPJ */}
        <div className="flex-1">
          <label className="mb-2 block text-sm font-medium text-neutral-700">
            Buscar CNPJ *
          </label>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="00.000.000/0001-00"
              value={cnpjValue}
              onChange={handleCnpjChange}
              onKeyDown={handleCnpjKeyDown}
              maxLength={18}
              disabled={isLoading}
              className="font-mono text-base"
            />
            <Button
              onClick={handleSearchByCNPJ}
              disabled={!isCnpjValid || isLoading}
              className="gap-2 text-white disabled:bg-neutral-300"
              style={
                !isCnpjValid || isLoading
                  ? undefined
                  : {
                      backgroundColor: 'var(--color-primary)',
                    }
              }
              onMouseEnter={(e) => {
                if (isCnpjValid && !isLoading) {
                  e.currentTarget.style.backgroundColor =
                    'var(--color-primary-hover)'
                }
              }}
              onMouseLeave={(e) => {
                if (isCnpjValid && !isLoading) {
                  e.currentTarget.style.backgroundColor =
                    'var(--color-primary)'
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
          {!isCnpjValid && cnpjValue.length > 0 && (
            <p className="mt-2 text-sm text-neutral-500">
              {remaining === 1
                ? `Falta ${remaining} número`
                : `Faltam ${remaining} números`}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}


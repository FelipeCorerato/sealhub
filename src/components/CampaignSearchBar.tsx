import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Loader2 } from 'lucide-react'

interface CampaignSearchBarProps {
  onSearchByCampaignName: (name: string) => void
  onSearchByClientName: (name: string) => void
  onListAll: () => void
  isLoading?: boolean
}

export function CampaignSearchBar({
  onSearchByCampaignName,
  onSearchByClientName,
  onListAll,
  isLoading = false,
}: CampaignSearchBarProps) {
  const [campaignNameSearch, setCampaignNameSearch] = useState('')
  const [clientNameSearch, setClientNameSearch] = useState('')

  const handleSearchByCampaignName = () => {
    if (campaignNameSearch.trim().length >= 3) {
      onSearchByCampaignName(campaignNameSearch.trim())
    }
  }

  const handleSearchByClientName = () => {
    if (clientNameSearch.trim().length >= 3) {
      onSearchByClientName(clientNameSearch.trim())
    }
  }

  const handleKeyDownCampaign = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && campaignNameSearch.trim().length >= 3) {
      handleSearchByCampaignName()
    }
  }

  const handleKeyDownClient = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && clientNameSearch.trim().length >= 3) {
      handleSearchByClientName()
    }
  }

  const isCampaignNameValid = campaignNameSearch.trim().length >= 3
  const isClientNameValid = clientNameSearch.trim().length >= 3

  return (
    <div className="space-y-4">
      {/* Botão Listar Todas no topo */}
      <div className="flex justify-end">
        <Button
          onClick={onListAll}
          disabled={isLoading}
          variant="outline"
          className="gap-2"
        >
          <Search className="h-4 w-4" />
          Listar Todas as Campanhas
        </Button>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        {/* Buscar por nome da campanha */}
        <div className="flex-1">
          <label className="mb-2 block text-sm font-medium text-neutral-700">
            Buscar por nome da campanha *
          </label>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Ex: Dia dos namorados"
              value={campaignNameSearch}
              onChange={(e) => setCampaignNameSearch(e.target.value)}
              onKeyDown={handleKeyDownCampaign}
              disabled={isLoading}
              className="text-base"
            />
            <Button
              onClick={handleSearchByCampaignName}
              disabled={!isCampaignNameValid || isLoading}
              className="gap-2 text-white disabled:bg-neutral-300"
              style={
                !isCampaignNameValid || isLoading
                  ? undefined
                  : {
                      backgroundColor: 'var(--color-primary)',
                    }
              }
              onMouseEnter={(e) => {
                if (isCampaignNameValid && !isLoading) {
                  e.currentTarget.style.backgroundColor =
                    'var(--color-primary-hover)'
                }
              }}
              onMouseLeave={(e) => {
                if (isCampaignNameValid && !isLoading) {
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
          {!isCampaignNameValid && campaignNameSearch.length > 0 && campaignNameSearch.length < 3 && (
            <p className="mt-2 text-sm text-neutral-500">
              Digite pelo menos 3 caracteres
            </p>
          )}
        </div>

        {/* Divisor OU */}
        <div className="flex items-center justify-center lg:pt-8">
          <span className="text-sm font-medium text-neutral-500">OU</span>
        </div>

        {/* Buscar por nome do cliente */}
        <div className="flex-1">
          <label className="mb-2 block text-sm font-medium text-neutral-700">
            Buscar por nome do cliente *
          </label>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Ex: Iasa Impressionante"
              value={clientNameSearch}
              onChange={(e) => setClientNameSearch(e.target.value)}
              onKeyDown={handleKeyDownClient}
              disabled={isLoading}
              className="text-base"
            />
            <Button
              onClick={handleSearchByClientName}
              disabled={!isClientNameValid || isLoading}
              className="gap-2 text-white disabled:bg-neutral-300"
              style={
                !isClientNameValid || isLoading
                  ? undefined
                  : {
                      backgroundColor: 'var(--color-primary)',
                    }
              }
              onMouseEnter={(e) => {
                if (isClientNameValid && !isLoading) {
                  e.currentTarget.style.backgroundColor =
                    'var(--color-primary-hover)'
                }
              }}
              onMouseLeave={(e) => {
                if (isClientNameValid && !isLoading) {
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
          {!isClientNameValid && clientNameSearch.length > 0 && clientNameSearch.length < 3 && (
            <p className="mt-2 text-sm text-neutral-500">
              Digite pelo menos 3 caracteres
            </p>
          )}
        </div>
      </div>
    </div>
  )
}


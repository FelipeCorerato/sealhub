import { Plus, FileText, Calendar, User, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Campaign, Company } from '@/types'

interface CampaignWithCompanies extends Campaign {
  companies: Company[]
}

interface CampaignResultsTableProps {
  campaigns: CampaignWithCompanies[]
  onViewDetails?: (campaign: CampaignWithCompanies) => void
  onAddMore?: (campaign: CampaignWithCompanies) => void
  onGenerateLabels?: (campaign: CampaignWithCompanies) => void
}

export function CampaignResultsTable({
  campaigns,
  onViewDetails,
  onAddMore,
  onGenerateLabels,
}: CampaignResultsTableProps) {
  if (campaigns.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
        <p className="text-neutral-500">
          Nenhuma campanha encontrada. Tente uma busca diferente.
        </p>
      </div>
    )
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  return (
    <div className="space-y-4">
      {campaigns.map((campaign) => (
        <div
          key={campaign.id}
          className="rounded-2xl bg-white p-6 shadow-sm border border-neutral-200 hover:shadow-md transition-shadow"
        >
          {/* Cabeçalho da Campanha */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-neutral-800 mb-2">
                {campaign.name}
              </h3>
              <div className="flex flex-wrap gap-3 text-sm text-neutral-600">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(campaign.createdAt)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>Remetente: {campaign.sender}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Package className="h-4 w-4" />
                  <span>{campaign.companies.length} cliente(s)</span>
                </div>
              </div>
              {campaign.observation && (
                <p className="mt-2 text-sm text-neutral-600 italic">
                  Observação: {campaign.observation}
                </p>
              )}
            </div>
            
            {/* Ações */}
            <div className="flex gap-2 ml-4">
              {onAddMore && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAddMore(campaign)}
                  className="gap-2 border-[#D97B35] text-[#D97B35] hover:bg-[#D97B35] hover:text-white"
                  title="Adicionar mais clientes"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar
                </Button>
              )}
              {onGenerateLabels && (
                <Button
                  size="sm"
                  onClick={() => onGenerateLabels(campaign)}
                  className="gap-2 bg-[#8B4513] text-white hover:bg-[#6d3410]"
                  title="Gerar selos"
                >
                  <FileText className="h-4 w-4" />
                  Gerar Selos
                </Button>
              )}
            </div>
          </div>

          {/* Instruções (se houver) */}
          {Object.values(campaign.instructions).some(Boolean) && (
            <div className="mb-4 flex flex-wrap gap-2">
              {campaign.instructions.fragile && (
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  Frágil
                </Badge>
              )}
              {campaign.instructions.attention && (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                  Atenção
                </Badge>
              )}
              {campaign.instructions.handleWithCare && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  Manusear com Cuidado
                </Badge>
              )}
              {campaign.instructions.thisWayUp && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Este Lado Para Cima
                </Badge>
              )}
            </div>
          )}

          {/* Lista de Clientes */}
          {campaign.companies.length > 0 && (
            <div className="border-t border-neutral-200 pt-4">
              <h4 className="text-sm font-medium text-neutral-700 mb-3">
                Clientes Vinculados:
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-200">
                      <th className="py-2 px-3 text-left font-medium text-neutral-600">
                        CNPJ
                      </th>
                      <th className="py-2 px-3 text-left font-medium text-neutral-600">
                        Nome
                      </th>
                      <th className="py-2 px-3 text-left font-medium text-neutral-600">
                        Endereço
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaign.companies.map((company) => (
                      <tr
                        key={company.id}
                        className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50"
                      >
                        <td className="py-2 px-3 text-neutral-700">
                          {company.cnpj}
                        </td>
                        <td className="py-2 px-3 text-neutral-700 font-medium">
                          {company.name}
                        </td>
                        <td className="py-2 px-3 text-neutral-600">
                          {company.address}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}


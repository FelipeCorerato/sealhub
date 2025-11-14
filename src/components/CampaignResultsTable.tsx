import { Eye, Plus, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
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

  return (
    <div className="rounded-2xl bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50">
              <th className="p-4 text-left text-sm font-semibold text-neutral-800">
                CNPJ
              </th>
              <th className="p-4 text-left text-sm font-semibold text-neutral-800">
                Nome do Cliente
              </th>
              <th className="p-4 text-left text-sm font-semibold text-neutral-800">
                Nome da Campanha
              </th>
              <th className="p-4 text-center text-sm font-semibold text-neutral-800">
                Ação
              </th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((campaign) =>
              campaign.companies.map((company, index) => (
                <tr
                  key={`${campaign.id}-${company.id}`}
                  className="border-b border-neutral-100 transition-colors hover:bg-neutral-50"
                >
                  <td className="p-4 text-sm text-neutral-700">
                    {company.cnpj}
                  </td>
                  <td className="p-4 text-sm text-neutral-700">
                    {company.name}
                  </td>
                  <td className="p-4 text-sm text-neutral-700">
                    {campaign.name}
                  </td>
                  <td className="p-4">
                    {/* Mostrar os botões de ação apenas na primeira linha de cada campanha */}
                    {index === 0 && (
                      <div className="flex justify-center gap-2">
                        {onAddMore && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => onAddMore(campaign)}
                            className="h-8 w-8 border-[#D97B35] text-[#D97B35] hover:bg-[#D97B35] hover:text-white"
                            title="Adicionar mais clientes"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        )}
                        {onGenerateLabels && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => onGenerateLabels(campaign)}
                            className="h-8 w-8 border-[#8B4513] text-[#8B4513] hover:bg-[#8B4513] hover:text-white"
                            title="Gerar etiquetas"
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}


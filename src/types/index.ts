export type Status = 'active' | 'closed' | 'suspended'
export type CompanyType = 'headquarters' | 'branch'

export interface Company {
  cnpj: string
  name: string
  address: string
  type: CompanyType
  status: Status
}

// Labels para exibição
export const statusLabels: Record<Status, string> = {
  active: 'Ativa',
  closed: 'Baixada',
  suspended: 'Suspensa',
}

export const companyTypeLabels: Record<CompanyType, string> = {
  headquarters: 'Matriz',
  branch: 'Filial',
}

// Campaign types
export interface CampaignInstructions {
  fragile: boolean
  attention: boolean
  handleWithCare: boolean
  thisWayUp: boolean
}

export interface Campaign {
  id: string
  name: string
  sender: string
  observation: string
  instructions: CampaignInstructions
  clientCNPJs: string[]
}

export const instructionLabels: Record<
  keyof CampaignInstructions,
  string
> = {
  fragile: 'Frágil',
  attention: 'Atenção',
  handleWithCare: 'Manusear com Cuidado',
  thisWayUp: 'Este Lado Para Cima',
}


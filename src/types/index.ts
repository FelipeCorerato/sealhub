export type Status = 'active' | 'closed' | 'suspended'
export type CompanyType = 'headquarters' | 'branch'

// ===== COMPANY TYPES =====

// Dados básicos da empresa (vindo da API da Receita)
export interface CompanyData {
  cnpj: string
  name: string
  legalName?: string
  address: string
  type: CompanyType
  status: Status
}

// Empresa completa no banco de dados (com metadados)
export interface Company extends CompanyData {
  id: string
  
  // Dados complementares
  phone?: string
  email?: string
  contactPerson?: string
  notes?: string
  
  // Metadata
  createdAt: Date
  createdBy: string  // User ID
  updatedAt: Date
  lastSyncedAt?: Date  // Última sincronização com Receita Federal
}

// Dados para criar uma nova empresa
export type CreateCompanyData = Omit<Company, 'id' | 'createdAt' | 'updatedAt'>

// Dados para atualizar uma empresa
export type UpdateCompanyData = Partial<Omit<Company, 'id' | 'cnpj' | 'createdAt' | 'createdBy'>>

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


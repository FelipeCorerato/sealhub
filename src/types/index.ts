export type Status = 'active' | 'closed' | 'suspended'
export type CompanyType = 'headquarters' | 'branch'

// ===== ORGANIZATION TYPES =====
export * from './organization'

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

// ===== CAMPAIGN TYPES =====

export interface CampaignInstructions {
  fragile: boolean
  attention: boolean
  handleWithCare: boolean
  thisWayUp: boolean
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

export type CampaignStatus = 'draft' | 'active' | 'completed' | 'cancelled'

// Campanha completa no banco de dados (com metadados)
export interface Campaign {
  id: string
  name: string
  sender: string
  observation: string
  instructions: CampaignInstructions
  
  // Clientes vinculados (IDs do Firestore)
  companyIds: string[]
  
  // Status
  status: CampaignStatus
  
  // Metadata
  createdAt: Date
  createdBy: string  // User ID que criou
  updatedAt: Date
  updatedBy: string  // User ID da última atualização
}

// Dados para criar uma nova campanha
export type CreateCampaignData = Omit<Campaign, 'id' | 'createdAt' | 'updatedAt' | 'updatedBy'>

// Dados para atualizar uma campanha
export type UpdateCampaignData = Partial<Omit<Campaign, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>>

export const campaignStatusLabels: Record<CampaignStatus, string> = {
  draft: 'Rascunho',
  active: 'Ativa',
  completed: 'Concluída',
  cancelled: 'Cancelada',
}


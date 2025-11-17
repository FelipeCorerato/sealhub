/**
 * Tipos e interfaces para o sistema de Organizações (Multi-tenant)
 */

export type OrganizationStatus = 'active' | 'inactive' | 'suspended'

export interface OrganizationTheme {
  /** Cor primária da organização */
  primaryColor: string
  /** Cor primária ao fazer hover */
  primaryHoverColor: string
  /** Cor de fundo clara */
  lightBackgroundColor: string
  /** Logo da organização (URL) */
  logoUrl?: string
  /** Favicon da organização (URL) */
  faviconUrl?: string
}

export interface OrganizationSettings {
  /** Remetente padrão para campanhas */
  defaultSender: string
  /** Assinatura padrão para emails */
  defaultSignature?: string
  /** Prefixo para códigos de campanha */
  campaignCodePrefix?: string
  /** Timezone da organização */
  timezone?: string
  /** Idioma padrão */
  language?: string
}

export interface EmailDomain {
  /** Domínio do email (ex: @empresa.com.br) */
  domain: string
  /** Se o domínio está ativo */
  active: boolean
  /** Data de adição do domínio */
  addedAt: Date
  /** Usuário que adicionou */
  addedBy: string
}

export interface Organization {
  /** ID único da organização */
  id: string
  /** Nome da organização */
  name: string
  /** Nome fantasia/comercial */
  tradeName?: string
  /** CNPJ da organização (se aplicável) */
  cnpj?: string
  /** Descrição da organização */
  description?: string
  /** Status da organização */
  status: OrganizationStatus
  
  /** Domínios de email permitidos */
  emailDomains: EmailDomain[]
  
  /** Configurações de tema/branding */
  theme: OrganizationTheme
  
  /** Configurações gerais */
  settings: OrganizationSettings
  
  /** IDs dos usuários administradores */
  adminUsers: string[]
  
  /** Plano/tier da organização */
  plan?: 'free' | 'basic' | 'premium' | 'enterprise'
  
  /** Limites e cotas */
  limits?: {
    maxUsers?: number
    maxCampaigns?: number
    maxCompanies?: number
  }
  
  /** Metadados */
  createdAt: Date
  createdBy: string
  updatedAt: Date
  updatedBy: string
}

export interface OrganizationMember {
  /** ID do membro */
  id: string
  /** ID do usuário */
  userId: string
  /** ID da organização */
  organizationId: string
  /** Email do usuário */
  email: string
  /** Nome do usuário */
  name: string
  /** Papel/função na organização */
  role: 'admin' | 'manager' | 'member' | 'viewer'
  /** Permissões específicas */
  permissions?: string[]
  /** Status do membro */
  status: 'active' | 'invited' | 'suspended'
  /** Data de entrada */
  joinedAt: Date
  /** Convidado por */
  invitedBy?: string
}

/**
 * Dados para criar uma nova organização
 */
export interface CreateOrganizationData {
  name: string
  tradeName?: string
  cnpj?: string
  description?: string
  emailDomains: string[] // Ex: ['@empresa.com.br']
  theme?: Partial<OrganizationTheme>
  settings?: Partial<OrganizationSettings>
}

/**
 * Dados para atualizar uma organização
 */
export interface UpdateOrganizationData {
  name?: string
  tradeName?: string
  description?: string
  status?: OrganizationStatus
  theme?: Partial<OrganizationTheme>
  settings?: Partial<OrganizationSettings>
}


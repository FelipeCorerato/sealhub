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


import type { Company, Campaign } from '@/types'

interface LoginResponse {
  user: {
    id: string
    name: string
    email: string
  }
  token: string
}

const mockCompanies: Company[] = [
  {
    id: 'mock-1',
    cnpj: '12345678000100',
    name: 'USK Calçados Matriz',
    address: 'Av. Central, 100 – Centro – SP – 01000-000',
    type: 'headquarters',
    status: 'active',
    createdAt: new Date(),
    createdBy: 'mock-user',
    updatedAt: new Date(),
  },
  {
    id: 'mock-2',
    cnpj: '12345678000191',
    name: 'USK Calçados Filial 1',
    address: 'Rua Secundária, 200 – Bairro – SP – 02000-000',
    type: 'branch',
    status: 'closed',
    createdAt: new Date(),
    createdBy: 'mock-user',
    updatedAt: new Date(),
  },
  {
    id: 'mock-3',
    cnpj: '12345678000282',
    name: 'USK Calçados Filial 2',
    address: 'Av. Terciária, 300 – Centro – SP – 03000-000',
    type: 'branch',
    status: 'suspended',
    createdAt: new Date(),
    createdBy: 'mock-user',
    updatedAt: new Date(),
  },
  {
    id: 'mock-4',
    cnpj: '98765432000155',
    name: 'Iasa Impressionante LTDA',
    address: 'Rua das Flores, 456 – Jardim – SP – 04000-000',
    type: 'headquarters',
    status: 'active',
    createdAt: new Date(),
    createdBy: 'mock-user',
    updatedAt: new Date(),
  },
  {
    id: 'mock-5',
    cnpj: '11122233000144',
    name: 'M7 Comercial Importadora',
    address: 'Av. Paulista, 1000 – Bela Vista – SP – 01310-000',
    type: 'headquarters',
    status: 'active',
    createdAt: new Date(),
    createdBy: 'mock-user',
    updatedAt: new Date(),
  },
]

/**
 * Busca empresas por CNPJ (mock)
 * Retorna registros após um delay de 600ms
 */
export async function fetchCompaniesByCNPJ(
  queryDigits: string,
): Promise<Company[]> {
  // Simula delay de API
  await new Promise((resolve) => setTimeout(resolve, 600))

  // Filtra empresas que contêm os dígitos buscados
  return mockCompanies.filter((company) => company.cnpj.includes(queryDigits))
}

/**
 * Busca empresas por nome (mock)
 * Retorna registros após um delay de 600ms
 */
export async function fetchCompaniesByName(
  queryName: string,
): Promise<Company[]> {
  // Simula delay de API
  await new Promise((resolve) => setTimeout(resolve, 600))

  // Filtra empresas que contêm o nome buscado (case insensitive)
  const normalizedQuery = queryName.toLowerCase()
  return mockCompanies.filter((company) =>
    company.name.toLowerCase().includes(normalizedQuery),
  )
}

/**
 * Salva uma campanha (mock)
 * Retorna a campanha criada após um delay de 600ms
 */
export async function saveCampaign(
  campaign: Omit<Campaign, 'id'>,
): Promise<Campaign> {
  // Simula delay de API
  await new Promise((resolve) => setTimeout(resolve, 600))

  // Gera ID mock
  const newCampaign: Campaign = {
    ...campaign,
    id: Math.random().toString(36).substring(7),
  }

  return newCampaign
}

/**
 * Login de usuário (mock)
 * Credenciais válidas: admin@vgsa.com.br / 123456
 */
export async function loginUser(
  email: string,
  password: string,
): Promise<LoginResponse> {
  // Simula delay de API
  await new Promise((resolve) => setTimeout(resolve, 800))

  // Validar credenciais mock
  if (email === 'admin@vgsa.com.br' && password === '123456') {
    return {
      user: {
        id: '1',
        name: 'Administrador',
        email: 'admin@vgsa.com.br',
      },
      token: 'mock-jwt-token-123456789',
    }
  }

  throw new Error('Credenciais inválidas')
}


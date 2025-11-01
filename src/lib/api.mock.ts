import type { Company } from '@/types'

/**
 * Busca empresas por CNPJ (mock)
 * Retorna 3 registros após um delay de 600ms
 */
export async function fetchCompaniesByCNPJ(
  _queryDigits: string,
): Promise<Company[]> {
  // Simula delay de API
  await new Promise((resolve) => setTimeout(resolve, 600))

  // Retorna dados mock
  return [
    {
      cnpj: '12345678000100',
      name: 'USK Calcados Matriz',
      address: 'Av. Central, 100 – Centro – SP – 01000-000',
      type: 'headquarters',
      status: 'active',
    },
    {
      cnpj: '12345678000100',
      name: 'USK Calcados Filial 1',
      address: 'Rua Secundária, 200 – Bairro – SP – 02000-000',
      type: 'branch',
      status: 'closed',
    },
    {
      cnpj: '12345678000100',
      name: 'USK Calcados Filial 2',
      address: 'Av. Terciária, 300 – Centro – SP – 03000-000',
      type: 'branch',
      status: 'suspended',
    },
  ]
}


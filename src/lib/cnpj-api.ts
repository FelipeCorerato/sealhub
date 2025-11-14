import type { CompanyData } from '@/types'
import { onlyNumbers, isHeadquarters } from './cnpj'

interface BrasilAPIResponse {
  cnpj: string
  razao_social: string
  nome_fantasia: string
  cnae_fiscal_descricao: string
  logradouro: string
  numero: string
  complemento: string
  bairro: string
  municipio: string
  uf: string
  cep: string
  situacao_cadastral: string
  descricao_situacao_cadastral: string
  data_situacao_cadastral: string
  descricao_identificador_matriz_filial: string
}

/**
 * Busca dados de CNPJ na API da Receita Federal via BrasilAPI
 * Documentação: https://brasilapi.com.br/docs#tag/CNPJ
 * @returns Dados básicos da empresa (sem metadados do Firestore)
 */
export async function fetchCNPJFromReceita(cnpj: string): Promise<CompanyData> {
  const cleanCNPJ = onlyNumbers(cnpj)

  if (cleanCNPJ.length !== 14) {
    throw new Error('CNPJ deve ter 14 dígitos')
  }

  try {
    const response = await fetch(
      `https://brasilapi.com.br/api/cnpj/v1/${cleanCNPJ}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      },
    )

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('CNPJ não encontrado')
      }
      if (response.status === 429) {
        throw new Error('Limite de requisições excedido. Tente novamente em instantes.')
      }
      throw new Error('Erro ao buscar dados do CNPJ')
    }

    const data: BrasilAPIResponse = await response.json()

    // Formatar endereço
    const addressParts = [
      data.logradouro,
      data.numero,
      data.complemento,
      data.bairro,
      data.municipio,
      data.uf,
      data.cep,
    ].filter(Boolean)

    const address = addressParts.join(' – ')

    // Mapear situação cadastral para status
    let status: 'active' | 'closed' | 'suspended' = 'active'
    const descricaoSituacao = String(data.descricao_situacao_cadastral || '').toLowerCase()
    
    if (descricaoSituacao.includes('baixada') || descricaoSituacao.includes('inativa') || descricaoSituacao.includes('nula')) {
      status = 'closed'
    } else if (descricaoSituacao.includes('suspensa') || descricaoSituacao.includes('inapta')) {
      status = 'suspended'
    } else if (data.situacao_cadastral === '02' || descricaoSituacao.includes('ativa')) {
      status = 'active'
    }

    // Mapear matriz/filial
    const descricaoTipo = String(data.descricao_identificador_matriz_filial || '').toLowerCase()
    const type: 'headquarters' | 'branch' = 
      descricaoTipo.includes('matriz')
        ? 'headquarters'
        : 'branch'

    // Usar nome fantasia se disponível, senão razão social
    const name = data.nome_fantasia || data.razao_social

    return {
      cnpj: data.cnpj,
      name,
      address,
      type,
      status,
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Erro ao buscar dados do CNPJ')
  }
}

/**
 * Valida CNPJ com dígitos verificadores
 * Algoritmo oficial da Receita Federal
 */
export function validateCNPJDigits(cnpj: string): boolean {
  const cleanCNPJ = onlyNumbers(cnpj)

  if (cleanCNPJ.length !== 14) {
    return false
  }

  // Elimina CNPJs invalidos conhecidos
  if (/^(\d)\1+$/.test(cleanCNPJ)) {
    return false
  }

  // Valida DVs
  let tamanho = cleanCNPJ.length - 2
  let numeros = cleanCNPJ.substring(0, tamanho)
  const digitos = cleanCNPJ.substring(tamanho)
  let soma = 0
  let pos = tamanho - 7

  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--
    if (pos < 2) pos = 9
  }

  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11)
  if (resultado !== parseInt(digitos.charAt(0))) {
    return false
  }

  tamanho = tamanho + 1
  numeros = cleanCNPJ.substring(0, tamanho)
  soma = 0
  pos = tamanho - 7

  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--
    if (pos < 2) pos = 9
  }

  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11)
  if (resultado !== parseInt(digitos.charAt(1))) {
    return false
  }

  return true
}

/**
 * Gera um CNPJ completo a partir do número base e número da filial
 * Calcula os dígitos verificadores corretamente
 */
function generateCNPJ(base: string, branchNumber: number): string {
  const branch = branchNumber.toString().padStart(4, '0')
  const partial = base + branch
  
  // Calcula primeiro dígito verificador
  let tamanho = 12
  let numeros = partial.substring(0, tamanho)
  let soma = 0
  let pos = tamanho - 7

  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--
    if (pos < 2) pos = 9
  }

  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11)
  const digito1 = resultado.toString()

  // Calcula segundo dígito verificador
  tamanho = 13
  numeros = partial + digito1
  soma = 0
  pos = tamanho - 7

  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--
    if (pos < 2) pos = 9
  }

  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11)
  const digito2 = resultado.toString()

  return base + branch + digito1 + digito2
}

/**
 * Busca matriz e TODAS as filiais relacionadas na API da Receita Federal
 * Gera CNPJs sequencialmente (0001, 0002, 0003...) e busca cada um
 * Para após encontrar 3 CNPJs não encontrados consecutivos
 * 
 * @param cnpj - CNPJ da matriz ou de qualquer filial
 * @param maxBranches - Número máximo de filiais a tentar buscar (padrão: 50)
 * @returns Array com dados das empresas: matriz sempre primeiro, depois filiais
 */
export async function fetchRelatedCNPJs(
  cnpj: string,
  maxBranches: number = 50
): Promise<CompanyData[]> {
  const results: CompanyData[] = []
  const cleanCNPJ = onlyNumbers(cnpj)
  const base = cleanCNPJ.substring(0, 8) // Raiz do CNPJ (8 primeiros dígitos)
  
  console.log(`🔍 Buscando matriz e filiais para raiz: ${base}`)
  
  // Busca primeiro a matriz (0001)
  const matrizCNPJ = generateCNPJ(base, 1)
  
  try {
    console.log(`📍 Buscando matriz: ${matrizCNPJ}`)
    const matrizData = await fetchCNPJFromReceita(matrizCNPJ)
    results.push(matrizData)
    console.log(`✅ Matriz encontrada: ${matrizData.name}`)
  } catch (error) {
    console.warn('❌ Matriz não encontrada:', matrizCNPJ)
    
    // Se não encontrou a matriz e o CNPJ pesquisado não é matriz,
    // busca pelo menos o CNPJ pesquisado
    if (!isHeadquarters(cleanCNPJ)) {
      try {
        const filialData = await fetchCNPJFromReceita(cleanCNPJ)
        results.push(filialData)
        console.log(`✅ Filial pesquisada encontrada: ${filialData.name}`)
      } catch (err) {
        console.error('❌ CNPJ pesquisado também não encontrado')
      }
    }
    return results
  }
  
  // Busca sequencialmente as filiais (0002, 0003, 0004...)
  let consecutiveNotFound = 0
  const maxConsecutiveNotFound = 3 // Para após 3 CNPJs não encontrados consecutivos
  
  for (let branchNum = 2; branchNum <= maxBranches; branchNum++) {
    const filialCNPJ = generateCNPJ(base, branchNum)
    
    try {
      console.log(`📍 Buscando filial ${branchNum}: ${filialCNPJ}`)
      const filialData = await fetchCNPJFromReceita(filialCNPJ)
      results.push(filialData)
      consecutiveNotFound = 0 // Resetar contador
      console.log(`✅ Filial ${branchNum} encontrada: ${filialData.name}`)
    } catch (error) {
      consecutiveNotFound++
      console.log(`❌ Filial ${branchNum} não encontrada (${consecutiveNotFound}/${maxConsecutiveNotFound})`)
      
      // Se encontrou 3 CNPJs não encontrados consecutivos, provavelmente acabaram
      if (consecutiveNotFound >= maxConsecutiveNotFound) {
        console.log(`⏹️ Parou de buscar: ${maxConsecutiveNotFound} não encontrados consecutivos`)
        break
      }
    }
    
    // Pequeno delay para não sobrecarregar a API (rate limit)
    await new Promise(resolve => setTimeout(resolve, 150))
  }
  
  console.log(`✅ Total de empresas encontradas: ${results.length}`)
  return results
}


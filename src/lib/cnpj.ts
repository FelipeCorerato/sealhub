/**
 * Remove todos os caracteres não numéricos de uma string
 */
export function onlyNumbers(value: string): string {
  return value.replace(/\D/g, '')
}

/**
 * Formata um CNPJ aplicando a máscara 00.000.000/0001-00
 */
export function formatCNPJ(value: string): string {
  const numbers = onlyNumbers(value)
  
  if (numbers.length <= 2) {
    return numbers
  }
  if (numbers.length <= 5) {
    return `${numbers.slice(0, 2)}.${numbers.slice(2)}`
  }
  if (numbers.length <= 8) {
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`
  }
  if (numbers.length <= 12) {
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8)}`
  }
  return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12, 14)}`
}

/**
 * Valida se um CNPJ tem exatamente 14 dígitos
 */
export function validateCNPJ(cnpj: string): boolean {
  const numbers = onlyNumbers(cnpj)
  return numbers.length === 14
}

/**
 * Calcula quantos dígitos faltam para completar um CNPJ válido
 */
export function getRemainingDigits(value: string): number {
  const numbers = onlyNumbers(value)
  const remaining = 14 - numbers.length
  return remaining > 0 ? remaining : 0
}

/**
 * Extrai o número base do CNPJ (8 primeiros dígitos)
 * Exemplo: 12.345.678/0001-00 -> 12345678
 */
export function getCNPJBase(cnpj: string): string {
  const numbers = onlyNumbers(cnpj)
  return numbers.substring(0, 8)
}

/**
 * Extrai o número da filial (4 dígitos após a barra)
 * Exemplo: 12.345.678/0001-00 -> 0001
 */
export function getCNPJBranch(cnpj: string): string {
  const numbers = onlyNumbers(cnpj)
  return numbers.substring(8, 12)
}

/**
 * Verifica se o CNPJ é de uma matriz (filial = 0001)
 */
export function isHeadquarters(cnpj: string): boolean {
  return getCNPJBranch(cnpj) === '0001'
}

/**
 * Gera o CNPJ da matriz a partir de qualquer CNPJ da empresa
 * Exemplo: 12.345.678/0005-00 -> 12.345.678/0001-00
 */
export function getHeadquartersCNPJ(cnpj: string): string {
  const numbers = onlyNumbers(cnpj)
  const base = getCNPJBase(cnpj)
  const digits = numbers.substring(12, 14)
  return base + '0001' + digits
}


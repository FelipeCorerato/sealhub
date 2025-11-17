/**
 * Configuração de domínios de email permitidos para registro na plataforma
 * 
 * Para adicionar novos domínios corporativos:
 * 1. Adicione o domínio completo (incluindo @) ao array ALLOWED_EMAIL_DOMAINS
 * 2. Exemplo: '@novodominio.com.br'
 */

export const ALLOWED_EMAIL_DOMAINS: readonly string[] = [
  '@iasabrasil.com.br',
  // Adicione novos domínios corporativos abaixo:
  '@gmail.com',
  '@usp.br',
]

/**
 * Valida se o email possui um domínio permitido
 * @param email - Email a ser validado
 * @returns true se o email possui um domínio permitido, false caso contrário
 */
export function isAllowedEmailDomain(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false
  }

  const emailLowerCase = email.toLowerCase().trim()
  
  return ALLOWED_EMAIL_DOMAINS.some(domain => 
    emailLowerCase.endsWith(domain.toLowerCase())
  )
}

/**
 * Retorna uma mensagem amigável com os domínios permitidos
 * @returns String formatada com os domínios permitidos
 */
export function getAllowedDomainsMessage(): string {
  if (ALLOWED_EMAIL_DOMAINS.length === 1) {
    return `Apenas emails corporativos ${ALLOWED_EMAIL_DOMAINS[0]} são permitidos.`
  }
  
  const domains = ALLOWED_EMAIL_DOMAINS.join(', ')
  return `Apenas emails corporativos (${domains}) são permitidos.`
}

/**
 * Retorna a lista de domínios permitidos formatada
 * @returns Array de domínios sem o @
 */
export function getAllowedDomainsList(): string[] {
  return ALLOWED_EMAIL_DOMAINS.map(domain => domain.replace('@', ''))
}


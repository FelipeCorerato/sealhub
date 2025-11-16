/**
 * Contexto de Organização
 * Gerencia a organização atual do usuário e suas configurações
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { getUserOrganization } from '@/lib/firebase/organizations'
import type { Organization } from '@/types/organization'

interface OrganizationContextType {
  organization: Organization | null
  isLoading: boolean
  refreshOrganization: () => Promise<void>
  isAdmin: boolean
  isAssociated: boolean
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(
  undefined
)

export function useOrganization() {
  const context = useContext(OrganizationContext)
  if (!context) {
    throw new Error(
      'useOrganization deve ser usado dentro de um OrganizationProvider'
    )
  }
  return context
}

interface OrganizationProviderProps {
  children: ReactNode
}

export function OrganizationProvider({ children }: OrganizationProviderProps) {
  const { user, isAuthenticated } = useAuth()
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadOrganization = async () => {
    if (!user?.id) {
      setOrganization(null)
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const org = await getUserOrganization(user.id)
      setOrganization(org)

      // Aplicar tema da organização
      if (org?.theme) {
        applyOrganizationTheme(org.theme)
      }
    } catch (error) {
      console.error('Erro ao carregar organização:', error)
      // Não quebrar a interface se não encontrar organização
      setOrganization(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      loadOrganization()
    } else {
      setOrganization(null)
      setIsLoading(false)
    }
  }, [user?.id, isAuthenticated])

  const refreshOrganization = async () => {
    await loadOrganization()
  }

  const isAdmin = organization
    ? organization.adminUsers.includes(user?.id || '')
    : false

  // Usuário está associado se há uma organização (getUserOrganization só retorna se estiver ativo)
  const isAssociated = organization !== null

  const value: OrganizationContextType = {
    organization,
    isLoading,
    refreshOrganization,
    isAdmin,
    isAssociated,
  }

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  )
}

/**
 * Aplica o tema da organização aos tokens CSS
 */
function applyOrganizationTheme(theme: Organization['theme']) {
  const root = document.documentElement

  if (theme.primaryColor) {
    root.style.setProperty('--color-primary', theme.primaryColor)
    
    // Calcular cor hover (15% mais escuro)
    const hoverColor = darkenColor(theme.primaryColor, 15)
    root.style.setProperty('--color-primary-hover', hoverColor)
    
    // Calcular cor light (88% mais claro)
    const lightColor = lightenColor(theme.primaryColor, 88)
    root.style.setProperty('--color-primary-light', lightColor)
  }

  // Atualizar favicon se disponível
  if (theme.faviconUrl) {
    const favicon = document.querySelector<HTMLLinkElement>(
      "link[rel='icon']"
    )
    if (favicon) {
      favicon.href = theme.faviconUrl
    }
  }

  // Atualizar título se houver logo
  if (theme.logoUrl) {
    // Logo será usado no componente Logo
  }
}

// Funções auxiliares para manipulação de cores
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((x) => {
    const hex = Math.round(x).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')
}

function darkenColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex
  const factor = (100 - percent) / 100
  return rgbToHex(rgb.r * factor, rgb.g * factor, rgb.b * factor)
}

function lightenColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex
  const factor = percent / 100
  return rgbToHex(
    rgb.r + (255 - rgb.r) * factor,
    rgb.g + (255 - rgb.g) * factor,
    rgb.b + (255 - rgb.b) * factor
  )
}


import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'

export type ThemeName = 'orange' | 'blue' | 'green' | 'purple' | 'rose'

export interface ThemePalette {
  name: string
  displayName: string
  colors: {
    primary: string
    primaryHover: string
    primaryLight: string
    background: string
    text: string
  }
}

// eslint-disable-next-line react-refresh/only-export-components
export const themes: Record<ThemeName, ThemePalette> = {
  orange: {
    name: 'orange',
    displayName: 'Laranja',
    colors: {
      primary: '#d97b35',
      primaryHover: '#bd6126',
      primaryLight: '#fff8f1',
      background: '#faf6ef',
      text: '#2b2118',
    },
  },
  blue: {
    name: 'blue',
    displayName: 'Azul',
    colors: {
      primary: '#3b82f6',
      primaryHover: '#2563eb',
      primaryLight: '#eff6ff',
      background: '#f0f9ff',
      text: '#1e293b',
    },
  },
  green: {
    name: 'green',
    displayName: 'Verde',
    colors: {
      primary: '#10b981',
      primaryHover: '#059669',
      primaryLight: '#d1fae5',
      background: '#f0fdf4',
      text: '#1e293b',
    },
  },
  purple: {
    name: 'purple',
    displayName: 'Roxo',
    colors: {
      primary: '#8b5cf6',
      primaryHover: '#7c3aed',
      primaryLight: '#f5f3ff',
      background: '#faf5ff',
      text: '#1e293b',
    },
  },
  rose: {
    name: 'rose',
    displayName: 'Rosa',
    colors: {
      primary: '#f43f5e',
      primaryHover: '#e11d48',
      primaryLight: '#ffe4e6',
      background: '#fff1f2',
      text: '#1e293b',
    },
  },
}

interface ThemeContextType {
  currentTheme: ThemeName
  setTheme: (theme: ThemeName) => void
  theme: ThemePalette
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<ThemeName>(() => {
    const saved = localStorage.getItem('theme')
    return (saved as ThemeName) || 'orange'
  })

  const theme = themes[currentTheme]

  useEffect(() => {
    // Aplicar as variáveis CSS no root
    const root = document.documentElement
    root.style.setProperty('--color-primary', theme.colors.primary)
    root.style.setProperty('--color-primary-hover', theme.colors.primaryHover)
    root.style.setProperty('--color-primary-light', theme.colors.primaryLight)
    root.style.setProperty('--color-background', theme.colors.background)
    root.style.setProperty('--color-text', theme.colors.text)

    // Salvar no localStorage
    localStorage.setItem('theme', currentTheme)
  }, [currentTheme, theme])

  const setTheme = (newTheme: ThemeName) => {
    setCurrentTheme(newTheme)
  }

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider')
  }
  return context
}

import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'

interface AccessibilityContextType {
  isDarkMode: boolean
  isHighContrast: boolean
  fontSize: number
  toggleDarkMode: () => void
  toggleHighContrast: () => void
  increaseFontSize: () => void
  decreaseFontSize: () => void
  resetAccessibility: () => void
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined)

const DEFAULT_FONT_SIZE = 16
const MIN_FONT_SIZE = 12
const MAX_FONT_SIZE = 24
const FONT_SIZE_STEP = 2

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('darkMode')
    return saved === 'true'
  })

  const [isHighContrast, setIsHighContrast] = useState<boolean>(() => {
    const saved = localStorage.getItem('highContrast')
    return saved === 'true'
  })

  const [fontSize, setFontSize] = useState<number>(() => {
    const saved = localStorage.getItem('fontSize')
    return saved ? parseInt(saved, 10) : DEFAULT_FONT_SIZE
  })

  useEffect(() => {
    const root = document.documentElement
    
    // Aplicar dark mode
    if (isDarkMode) {
      root.classList.add('dark-mode')
    } else {
      root.classList.remove('dark-mode')
    }
    localStorage.setItem('darkMode', isDarkMode.toString())
  }, [isDarkMode])

  useEffect(() => {
    const root = document.documentElement
    
    // Aplicar alto contraste
    if (isHighContrast) {
      root.classList.add('high-contrast')
    } else {
      root.classList.remove('high-contrast')
    }
    localStorage.setItem('highContrast', isHighContrast.toString())
  }, [isHighContrast])

  useEffect(() => {
    const root = document.documentElement
    
    // Aplicar tamanho da fonte
    root.style.fontSize = `${fontSize}px`
    localStorage.setItem('fontSize', fontSize.toString())
  }, [fontSize])

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev)
  }

  const toggleHighContrast = () => {
    setIsHighContrast(prev => !prev)
  }

  const increaseFontSize = () => {
    setFontSize(prev => Math.min(prev + FONT_SIZE_STEP, MAX_FONT_SIZE))
  }

  const decreaseFontSize = () => {
    setFontSize(prev => Math.max(prev - FONT_SIZE_STEP, MIN_FONT_SIZE))
  }

  const resetAccessibility = () => {
    setIsDarkMode(false)
    setIsHighContrast(false)
    setFontSize(DEFAULT_FONT_SIZE)
  }

  return (
    <AccessibilityContext.Provider
      value={{
        isDarkMode,
        isHighContrast,
        fontSize,
        toggleDarkMode,
        toggleHighContrast,
        increaseFontSize,
        decreaseFontSize,
        resetAccessibility,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAccessibility() {
  const context = useContext(AccessibilityContext)
  if (context === undefined) {
    throw new Error('useAccessibility deve ser usado dentro de um AccessibilityProvider')
  }
  return context
}


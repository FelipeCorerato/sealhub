import { useState, useEffect } from 'react'
import { Palette, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useTheme, themes, type ThemeName } from '@/contexts/ThemeContext'
import { useAccessibility } from '@/contexts/AccessibilityContext'
import { useOrganization } from '@/contexts/OrganizationContext'
import { cn } from '@/lib/utils'

export function ThemeSelector() {
  const { currentTheme, setTheme } = useTheme()
  const { isDarkMode } = useAccessibility()
  const { organization } = useOrganization()
  const [open, setOpen] = useState(false)
  const [isCompanyTheme, setIsCompanyTheme] = useState(() => {
    const saved = localStorage.getItem('isCompanyTheme')
    return saved === 'true'
  })

  // Funções auxiliares para cores
  const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    } : null
  }

  const rgbToHex = (r: number, g: number, b: number): string => {
    return '#' + [r, g, b].map((x) => {
      const hex = Math.round(x).toString(16)
      return hex.length === 1 ? '0' + hex : hex
    }).join('')
  }

  const darkenColor = (hex: string, percent: number): string => {
    const rgb = hexToRgb(hex)
    if (!rgb) return hex
    const factor = (100 - percent) / 100
    return rgbToHex(rgb.r * factor, rgb.g * factor, rgb.b * factor)
  }

  const lightenColor = (hex: string, percent: number): string => {
    const rgb = hexToRgb(hex)
    if (!rgb) return hex
    const factor = percent / 100
    return rgbToHex(
      rgb.r + (255 - rgb.r) * factor,
      rgb.g + (255 - rgb.g) * factor,
      rgb.b + (255 - rgb.b) * factor
    )
  }

  // Função auxiliar para aplicar o tema da empresa
  const applyCompanyTheme = (primaryColor: string) => {
    const root = document.documentElement
    
    root.style.setProperty('--color-primary', primaryColor)
    
    // Calcular cor hover (15% mais escuro)
    const hoverColor = darkenColor(primaryColor, 15)
    root.style.setProperty('--color-primary-hover', hoverColor)
    
    // Calcular cor light (88% mais claro)
    const lightColor = lightenColor(primaryColor, 88)
    root.style.setProperty('--color-primary-light', lightColor)
    
    // Aplicar background e text (usar valores padrão do tema laranja)
    root.style.setProperty('--color-background', organization?.theme.lightBackgroundColor || '#FAF6EF')
    root.style.setProperty('--color-text', '#2b2118')
  }

  // Aplicar tema da empresa quando o componente monta, se necessário
  useEffect(() => {
    if (isCompanyTheme && organization) {
      applyCompanyTheme(organization.theme.primaryColor || '#D97B35')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organization, isCompanyTheme]) // Reaplica quando a organização carrega

  const handleThemeSelect = (themeName: ThemeName) => {
    setIsCompanyTheme(false)
    localStorage.setItem('isCompanyTheme', 'false')
    setTheme(themeName)
    
    // Forçar a aplicação completa do tema padrão
    const selectedTheme = themes[themeName]
    const root = document.documentElement
    root.style.setProperty('--color-primary', selectedTheme.colors.primary)
    root.style.setProperty('--color-primary-hover', selectedTheme.colors.primaryHover)
    root.style.setProperty('--color-primary-light', selectedTheme.colors.primaryLight)
    root.style.setProperty('--color-background', selectedTheme.colors.background)
    root.style.setProperty('--color-text', selectedTheme.colors.text)
    
    // Não fecha imediatamente para o usuário ver a mudança
    setTimeout(() => {
      setOpen(false)
    }, 300)
  }

  const handleCompanyThemeSelect = () => {
    // Aplica as cores da empresa manualmente
    if (organization) {
      const primaryColor = organization.theme.primaryColor || '#D97B35'
      applyCompanyTheme(primaryColor)
      
      setIsCompanyTheme(true)
      localStorage.setItem('isCompanyTheme', 'true')
    }
    setTimeout(() => {
      setOpen(false)
    }, 300)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-neutral-700 hover:bg-neutral-100"
          title="Alterar tema"
        >
          <span title="Ícone de paleta de cores">
            <Palette className="h-5 w-5" aria-label="Ícone de paleta de cores" />
          </span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[400px] sm:w-[540px] flex flex-col">
        <SheetHeader className="flex-shrink-0">
          <SheetTitle>Preferências de Tema</SheetTitle>
          <SheetDescription>
            Escolha a paleta de cores que você prefere para a aplicação
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto pr-6 -mr-6">
          {/* Tema da Empresa */}
          {organization && (
            <div className="mt-8">
              <h4 
                className="mb-3 text-xs font-semibold uppercase tracking-wider"
                style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}
              >
                Tema Personalizado
              </h4>
              <button
                onClick={handleCompanyThemeSelect}
                className={cn(
                  'w-full rounded-xl border-2 p-6 text-left transition-all hover:shadow-md',
                  !isDarkMode && isCompanyTheme && 'border-(--color-primary) bg-(--color-primary-light)',
                  !isDarkMode && !isCompanyTheme && 'border-neutral-200 bg-white hover:border-neutral-300',
                )}
                style={
                  isDarkMode
                    ? {
                        backgroundColor: isCompanyTheme ? 'rgba(0, 0, 0, 0.5)' : '#1f2937',
                        borderColor: isCompanyTheme ? organization.theme.primaryColor : '#4b5563',
                        borderWidth: isCompanyTheme ? '3px' : '2px',
                      }
                    : undefined
                }
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Preview das cores */}
                    <div className="flex gap-2">
                      <div
                        className="h-12 w-12 rounded-lg shadow-sm"
                        style={{ 
                          backgroundColor: organization.theme.primaryColor || '#D97B35',
                          border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : undefined
                        }}
                      />
                      <div
                        className="h-12 w-12 rounded-lg shadow-sm"
                        style={{
                          backgroundColor: lightenColor(organization.theme.primaryColor || '#D97B35', 88),
                          border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : undefined
                        }}
                      />
                      <div
                        className="h-12 w-12 rounded-lg shadow-sm"
                        style={{
                          backgroundColor: '#FAF6EF',
                          border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : undefined
                        }}
                      />
                    </div>

                    {/* Nome da empresa */}
                    <div>
                      <h3 
                        className="text-lg font-semibold"
                        style={{ color: isDarkMode ? '#f3f4f6' : '#1f2937' }}
                      >
                        {organization.tradeName || organization.name}
                      </h3>
                      <p 
                        className="text-sm"
                        style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}
                      >
                        Tema da empresa
                      </p>
                    </div>
                  </div>

                  {/* Check se selecionado */}
                  {isCompanyTheme && (
                    <div
                      className="rounded-full p-1"
                      style={{ backgroundColor: organization.theme.primaryColor || '#D97B35' }}
                    >
                      <span title="Ícone de marca de seleção">
                        <Check className="h-5 w-5 text-white" aria-label="Ícone de marca de seleção" />
                      </span>
                    </div>
                  )}
                </div>
              </button>

              {/* Separador */}
              <div 
                className="my-6 border-t"
                style={{ borderColor: isDarkMode ? '#374151' : '#e5e7eb' }}
              />
            </div>
          )}

          {/* Temas Padrão */}
          <div className={organization ? '' : 'mt-8'}>
            <h4 
              className="mb-3 text-xs font-semibold uppercase tracking-wider"
              style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}
            >
              Temas Padrão
            </h4>
            <div className="space-y-4">
          {Object.entries(themes).map(([key, themeData]) => {
            const isSelected = !isCompanyTheme && currentTheme === key
            return (
              <button
                key={key}
                onClick={() => handleThemeSelect(key as ThemeName)}
                className={cn(
                  'w-full rounded-xl border-2 p-6 text-left transition-all hover:shadow-md',
                  !isDarkMode && isSelected && 'border-(--color-primary) bg-(--color-primary-light)',
                  !isDarkMode && !isSelected && 'border-neutral-200 bg-white hover:border-neutral-300',
                )}
                style={
                  isDarkMode
                    ? {
                        backgroundColor: isSelected ? 'rgba(0, 0, 0, 0.5)' : '#1f2937',
                        borderColor: isSelected ? themeData.colors.primary : '#4b5563',
                        borderWidth: isSelected ? '3px' : '2px',
                      }
                    : undefined
                }
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Preview das cores */}
                    <div className="flex gap-2">
                      <div
                        className="h-12 w-12 rounded-lg shadow-sm"
                        style={{ 
                          backgroundColor: themeData.colors.primary,
                          border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : undefined
                        }}
                      />
                      <div
                        className="h-12 w-12 rounded-lg shadow-sm"
                        style={{
                          backgroundColor: themeData.colors.primaryLight,
                          border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : undefined
                        }}
                      />
                      <div
                        className="h-12 w-12 rounded-lg shadow-sm"
                        style={{
                          backgroundColor: themeData.colors.background,
                          border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : undefined
                        }}
                      />
                    </div>

                    {/* Nome do tema */}
                    <div>
                      <h3 
                        className="text-lg font-semibold"
                        style={{ color: isDarkMode ? '#f3f4f6' : '#1f2937' }}
                      >
                        {themeData.displayName}
                      </h3>
                      <p 
                        className="text-sm"
                        style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}
                      >
                        Tema {themeData.displayName.toLowerCase()}
                      </p>
                    </div>
                  </div>

                  {/* Check se selecionado */}
                  {isSelected && (
                    <div
                      className="rounded-full p-1"
                      style={{ backgroundColor: themeData.colors.primary }}
                    >
                      <span title="Ícone de marca de seleção">
                        <Check className="h-5 w-5 text-white" aria-label="Ícone de marca de seleção" />
                      </span>
                    </div>
                  )}
                </div>
              </button>
            )
          })}
            </div>
          </div>

          <div 
            className="mt-8 mb-4 rounded-lg border p-4"
            style={{
              backgroundColor: isDarkMode ? '#374151' : '#f9fafb',
              borderColor: isDarkMode ? '#4b5563' : '#e5e7eb'
            }}
          >
            <p 
              className="text-sm"
              style={{ color: isDarkMode ? '#d1d5db' : '#6b7280' }}
            >
              💡 <strong style={{ color: isDarkMode ? '#f3f4f6' : '#1f2937' }}>Dica:</strong> O tema selecionado será aplicado
              imediatamente e salvo nas suas preferências.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

import { useState } from 'react'
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
import { cn } from '@/lib/utils'

export function ThemeSelector() {
  const { currentTheme, setTheme } = useTheme()
  const { isDarkMode } = useAccessibility()
  const [open, setOpen] = useState(false)

  const handleThemeSelect = (themeName: ThemeName) => {
    setTheme(themeName)
    // Não fecha imediatamente para o usuário ver a mudança
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
          <Palette className="h-5 w-5" />
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
          <div className="mt-8 space-y-4">
          {Object.entries(themes).map(([key, themeData]) => {
            const isSelected = currentTheme === key
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
                      <Check className="h-5 w-5 text-white" />
                    </div>
                  )}
                </div>
              </button>
            )
          })}
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

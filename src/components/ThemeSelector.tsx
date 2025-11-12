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
import { cn } from '@/lib/utils'

export function ThemeSelector() {
  const { currentTheme, setTheme } = useTheme()
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
      <SheetContent side="right" className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Preferências de Tema</SheetTitle>
          <SheetDescription>
            Escolha a paleta de cores que você prefere para a aplicação
          </SheetDescription>
        </SheetHeader>

        <div className="mt-8 space-y-4">
          {Object.entries(themes).map(([key, themeData]) => {
            const isSelected = currentTheme === key
            return (
              <button
                key={key}
                onClick={() => handleThemeSelect(key as ThemeName)}
                className={cn(
                  'w-full rounded-xl border-2 p-6 text-left transition-all hover:shadow-md',
                  isSelected
                    ? 'border-(--color-primary) bg-(--color-primary-light)'
                    : 'border-neutral-200 bg-white hover:border-neutral-300',
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Preview das cores */}
                    <div className="flex gap-2">
                      <div
                        className="h-12 w-12 rounded-lg shadow-sm"
                        style={{ backgroundColor: themeData.colors.primary }}
                      />
                      <div
                        className="h-12 w-12 rounded-lg shadow-sm"
                        style={{
                          backgroundColor: themeData.colors.primaryLight,
                        }}
                      />
                      <div
                        className="h-12 w-12 rounded-lg shadow-sm"
                        style={{
                          backgroundColor: themeData.colors.background,
                        }}
                      />
                    </div>

                    {/* Nome do tema */}
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-800">
                        {themeData.displayName}
                      </h3>
                      <p className="text-sm text-neutral-600">
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

        <div className="mt-8 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
          <p className="text-sm text-neutral-600">
            💡 <strong>Dica:</strong> O tema selecionado será aplicado
            imediatamente e salvo nas suas preferências.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  )
}

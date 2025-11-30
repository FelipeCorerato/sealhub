import { Link, useLocation } from 'react-router-dom'
import { Megaphone, Menu, LogOut, Settings2, User as UserIcon, Search, UserPlus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Logo } from '@/components/Logo'
import { ThemeSelector } from '@/components/ThemeSelector'
import { useAuth } from '@/contexts/AuthContext'
import { useAccessibility } from '@/contexts/AccessibilityContext'
import { useOrganization } from '@/contexts/OrganizationContext'

// Navigation items moved to sections below
const navigation: Array<{ name: string; href: string; icon: any }> = []

const clientSubItems = [
  { name: 'Adicionar Cliente', href: '/clientes/adicionar', icon: UserPlus },
  { name: 'Buscar Clientes', href: '/clientes/buscar', icon: Search },
]

const campaignSubItems = [
  { name: 'Nova Campanha', href: '/campanhas/nova', icon: Megaphone },
  { name: 'Buscar Campanhas', href: '/campanhas/buscar', icon: Search },
]

const adminSubItems = [
  { name: 'Geral', href: '/admin/geral', icon: Settings2 },
  { name: 'Usuários', href: '/admin/usuarios', icon: UserIcon },
]

function SidebarContent() {
  const location = useLocation()
  const { logout } = useAuth()
  const { isDarkMode } = useAccessibility()
  const { isAdmin } = useOrganization()

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="flex h-full flex-col">
      {/* Logo/Brand */}
      <div className="border-b border-neutral-200 p-6 transition-all duration-300">
        <div className="opacity-100 transition-opacity duration-200">
          <Logo />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive && !isDarkMode
                  ? 'text-[var(--color-primary)] before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:rounded-r-full before:bg-[var(--color-primary)]'
                  : '',
                isActive && isDarkMode
                  ? 'text-[var(--color-primary)] font-bold'
                  : '',
                !isActive
                  ? 'text-neutral-700 hover:bg-neutral-100'
                  : '',
              )}
              style={
                isActive
                  ? { 
                      backgroundColor: isDarkMode 
                        ? 'rgba(0, 0, 0, 0.3)' 
                        : 'var(--color-primary-light)',
                      borderLeft: isDarkMode ? '4px solid var(--color-primary)' : undefined,
                      paddingLeft: isDarkMode ? 'calc(0.75rem - 4px)' : undefined,
                    }
                  : undefined
              }
            >
              <span title={`Ícone de ${item.name.toLowerCase()}`}>
                <item.icon className="h-5 w-5 flex-shrink-0" aria-label={`Ícone de ${item.name.toLowerCase()}`} />
              </span>
              {item.name}
            </Link>
          )
        })}

        {/* Seção Clientes com subitens */}
        <div className="space-y-1">
          {/* Título da seção Clientes */}
          <div className="px-3 py-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Clientes
            </h3>
          </div>

          {/* Subitens Clientes */}
          {clientSubItems.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'relative flex items-center gap-3 rounded-lg px-3 py-2 pl-8 text-sm font-medium transition-colors',
                  isActive && !isDarkMode
                    ? 'text-[var(--color-primary)] before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:rounded-r-full before:bg-[var(--color-primary)]'
                    : '',
                  isActive && isDarkMode
                    ? 'text-[var(--color-primary)] font-bold'
                    : '',
                  !isActive
                    ? 'text-neutral-700 hover:bg-neutral-100'
                    : '',
                )}
                style={
                  isActive
                    ? { 
                        backgroundColor: isDarkMode 
                          ? 'rgba(0, 0, 0, 0.3)' 
                          : 'var(--color-primary-light)',
                        borderLeft: isDarkMode ? '4px solid var(--color-primary)' : undefined,
                        paddingLeft: isDarkMode ? 'calc(2rem - 4px)' : undefined,
                      }
                    : undefined
                }
              >
                <span title={`Ícone de ${item.name.toLowerCase()}`}>
                  <item.icon className="h-4 w-4 flex-shrink-0" aria-label={`Ícone de ${item.name.toLowerCase()}`} />
                </span>
                {item.name}
              </Link>
            )
          })}
        </div>

        {/* Seção Campanhas com subitens */}
        <div className="space-y-1">
          {/* Título da seção Campanhas */}
          <div className="px-3 py-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Campanhas
            </h3>
          </div>

          {/* Subitens Campanhas */}
          {campaignSubItems.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'relative flex items-center gap-3 rounded-lg px-3 py-2 pl-8 text-sm font-medium transition-colors',
                  isActive && !isDarkMode
                    ? 'text-[var(--color-primary)] before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:rounded-r-full before:bg-[var(--color-primary)]'
                    : '',
                  isActive && isDarkMode
                    ? 'text-[var(--color-primary)] font-bold'
                    : '',
                  !isActive
                    ? 'text-neutral-700 hover:bg-neutral-100'
                    : '',
                )}
                style={
                  isActive
                    ? { 
                        backgroundColor: isDarkMode 
                          ? 'rgba(0, 0, 0, 0.3)' 
                          : 'var(--color-primary-light)',
                        borderLeft: isDarkMode ? '4px solid var(--color-primary)' : undefined,
                        paddingLeft: isDarkMode ? 'calc(2rem - 4px)' : undefined,
                      }
                    : undefined
                }
              >
                <span title={`Ícone de ${item.name.toLowerCase()}`}>
                  <item.icon className="h-4 w-4 flex-shrink-0" aria-label={`Ícone de ${item.name.toLowerCase()}`} />
                </span>
                {item.name}
              </Link>
            )
          })}
        </div>

        {/* Admin Navigation - Apenas para admins */}
        {isAdmin && (
          <>
            <div className="my-4 border-t border-neutral-200" />
            
            {/* Seção Admin com subitens */}
            <div className="space-y-1">
              {/* Título da seção Admin */}
              <div className="px-3 py-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  Admin
                </h3>
              </div>

              {/* Subitens Admin */}
              {adminSubItems.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      'relative flex items-center gap-3 rounded-lg px-3 py-2 pl-8 text-sm font-medium transition-colors',
                      isActive && !isDarkMode
                        ? 'text-[var(--color-primary)] before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:rounded-r-full before:bg-[var(--color-primary)]'
                        : '',
                      isActive && isDarkMode
                        ? 'text-[var(--color-primary)] font-bold'
                        : '',
                      !isActive
                        ? 'text-neutral-700 hover:bg-neutral-100'
                        : '',
                    )}
                    style={
                      isActive
                        ? { 
                            backgroundColor: isDarkMode 
                              ? 'rgba(0, 0, 0, 0.3)' 
                              : 'var(--color-primary-light)',
                            borderLeft: isDarkMode ? '4px solid var(--color-primary)' : undefined,
                            paddingLeft: isDarkMode ? 'calc(2rem - 4px)' : undefined,
                          }
                        : undefined
                    }
                  >
                    <span title={`Ícone de ${item.name.toLowerCase()}`}>
                      <item.icon className="h-4 w-4 flex-shrink-0" aria-label={`Ícone de ${item.name.toLowerCase()}`} />
                    </span>
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </>
        )}
      </nav>

      {/* Footer - Botões de Tema e SAIR */}
      <div className="border-t border-neutral-200 p-4 space-y-2">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="flex-1 justify-start gap-2 text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900"
          >
            <span title="Ícone de saída">
              <LogOut className="h-5 w-5" aria-label="Ícone de saída" />
            </span>
            SAIR
          </Button>
          <ThemeSelector />
        </div>
      </div>
    </div>
  )
}

export function Sidebar() {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside 
        className={cn(
          "hidden lg:block fixed left-0 top-0 h-screen border-r border-neutral-200 bg-white transition-all duration-300 w-64"
        )}
        style={{ overflow: 'visible' }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="fixed left-4 top-4 z-40 lg:hidden"
            aria-label="Abrir menu"
          >
            <span title="Ícone de menu hambúrguer">
              <Menu className="h-5 w-5" aria-label="Ícone de menu hambúrguer" />
            </span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  )
}

import { Link, useLocation } from 'react-router-dom'
import { Users, Megaphone, Menu, LogOut, ChevronLeft, ChevronRight, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Logo } from '@/components/Logo'
import { ThemeSelector } from '@/components/ThemeSelector'
import { useAuth } from '@/contexts/AuthContext'
import { useAccessibility } from '@/contexts/AccessibilityContext'
import { useSidebar } from '@/contexts/SidebarContext'
import { useOrganization } from '@/contexts/OrganizationContext'

const navigation = [
  { name: 'Clientes', href: '/clientes', icon: Users },
  { name: 'Campanhas', href: '/campanhas', icon: Megaphone },
]

const adminNavigation = [
  { name: 'Admin', href: '/admin', icon: Settings },
]

interface SidebarContentProps {
  isCollapsed?: boolean
}

function SidebarContent({ isCollapsed = false }: SidebarContentProps) {
  const location = useLocation()
  const { logout } = useAuth()
  const { isDarkMode } = useAccessibility()
  const { organization, isAdmin } = useOrganization()

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="flex h-full flex-col">
      {/* Logo/Brand */}
      <div className="border-b border-neutral-200 p-6 transition-all duration-300">
        {!isCollapsed && (
          <div className="opacity-100 transition-opacity duration-200">
            <Logo />
          </div>
        )}
        {isCollapsed && (
          <div className="flex justify-center opacity-100 transition-opacity duration-200">
            {organization?.theme.logoUrl ? (
              <img 
                src={organization.theme.logoUrl} 
                alt={organization.name}
                className="h-8 w-8 object-contain"
              />
            ) : (
              <div 
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white font-bold text-sm"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                {organization?.name.charAt(0) || 'V'}
            </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.name}
              to={item.href}
              title={isCollapsed ? item.name : undefined}
              className={cn(
                'relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isCollapsed && 'justify-center',
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
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && item.name}
            </Link>
          )
        })}

        {/* Admin Navigation - Apenas para admins */}
        {isAdmin && (
          <>
            <div className="my-4 border-t border-neutral-200" />
            {adminNavigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  title={isCollapsed ? item.name : undefined}
                  className={cn(
                    'relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isCollapsed && 'justify-center',
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
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && item.name}
                </Link>
              )
            })}
          </>
        )}
      </nav>

      {/* Footer - Botões de Tema e SAIR */}
      <div className="border-t border-neutral-200 p-4 space-y-2">
        {!isCollapsed ? (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="flex-1 justify-start gap-2 text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900"
            >
              <LogOut className="h-5 w-5" />
              SAIR
            </Button>
            <ThemeSelector />
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex justify-center">
              <ThemeSelector />
            </div>
            <Button
              variant="ghost"
              onClick={handleLogout}
              title="Sair"
              className="justify-center text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 p-2"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export function Sidebar() {
  const { isCollapsed, toggleSidebar } = useSidebar()

  return (
    <>
      {/* Desktop Sidebar */}
      <aside 
        className={cn(
          "hidden lg:block fixed left-0 top-0 h-screen border-r border-neutral-200 bg-white transition-all duration-300",
          isCollapsed ? "w-20" : "w-64"
        )}
        style={{ overflow: 'visible' }}
      >
        <SidebarContent isCollapsed={isCollapsed} />
      </aside>
      
      {/* Toggle Button - Fora do aside para não ser cortado */}
      <button
        onClick={toggleSidebar}
        className="sidebar-toggle-button hidden lg:flex fixed items-center justify-center rounded-full border border-neutral-200 bg-white shadow-md hover:bg-neutral-50 transition-all duration-300 z-50 h-6 w-6"
        style={{
          left: isCollapsed ? 'calc(5rem - 0.75rem)' : 'calc(16rem - 0.75rem)',
          top: '1.5rem',
        }}
        aria-label={isCollapsed ? 'Expandir menu' : 'Minimizar menu'}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4 text-neutral-600" />
        ) : (
          <ChevronLeft className="h-4 w-4 text-neutral-600" />
        )}
      </button>

      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="fixed left-4 top-4 z-40 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  )
}


import { Link, useLocation } from 'react-router-dom'
import { Users, Megaphone, Menu, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Logo } from '@/components/Logo'
import { useAuth } from '@/contexts/AuthContext'

const navigation = [
  { name: 'Clientes', href: '/clientes', icon: Users },
  { name: 'Campanhas', href: '/campanhas', icon: Megaphone },
]

function SidebarContent() {
  const location = useLocation()
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="flex h-full flex-col">
      {/* Logo/Brand */}
      <div className="border-b border-neutral-200 p-6">
        <Logo />
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
                isActive
                  ? 'bg-orange-50 text-[#D97B35] before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:rounded-r-full before:bg-[#D97B35]'
                  : 'text-neutral-700 hover:bg-neutral-100',
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Footer - Botão SAIR */}
      <div className="border-t border-neutral-200 p-4">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start gap-2 text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900"
        >
          <LogOut className="h-5 w-5" />
          SAIR
        </Button>
      </div>
    </div>
  )
}

export function Sidebar() {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 border-r border-neutral-200 bg-white lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="lg:hidden fixed left-4 top-4 z-40"
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


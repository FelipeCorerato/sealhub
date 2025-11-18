import { BrowserRouter } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { AuthProvider } from '@/contexts/AuthContext'
import { OrganizationProvider } from '@/contexts/OrganizationContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { AccessibilityProvider } from '@/contexts/AccessibilityContext'
import { SidebarProvider } from '@/contexts/SidebarContext'

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <BrowserRouter>
      <AccessibilityProvider>
        <ThemeProvider>
          <SidebarProvider>
            <AuthProvider>
              <OrganizationProvider>
              {children}
              <Toaster position="bottom-right" closeButton style={{ zIndex: 'var(--z-toast)' }} />
              </OrganizationProvider>
            </AuthProvider>
          </SidebarProvider>
        </ThemeProvider>
      </AccessibilityProvider>
    </BrowserRouter>
  )
}


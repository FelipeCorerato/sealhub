import { BrowserRouter } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { AuthProvider } from '@/contexts/AuthContext'
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
              {children}
              <Toaster position="top-right" style={{ zIndex: 'var(--z-toast)' }} />
            </AuthProvider>
          </SidebarProvider>
        </ThemeProvider>
      </AccessibilityProvider>
    </BrowserRouter>
  )
}


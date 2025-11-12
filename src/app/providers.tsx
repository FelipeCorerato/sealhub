import { BrowserRouter } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <BrowserRouter>
      <ThemeProvider>
      <AuthProvider>
        {children}
        <Toaster />
      </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}


import { BrowserRouter } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <BrowserRouter>
      {children}
      <Toaster />
    </BrowserRouter>
  )
}


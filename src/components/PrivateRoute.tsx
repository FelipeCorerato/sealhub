import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'

interface PrivateRouteProps {
  children: React.ReactNode
}

export function PrivateRoute({ children }: PrivateRouteProps) {
  const { isAuthenticated, isLoading } = useAuth()

  // Mostra loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF6EF]">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-[#D97B35]" />
          <p className="mt-4 text-neutral-600">Carregando...</p>
        </div>
      </div>
    )
  }

  // Redireciona para login se não autenticado
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Renderiza o conteúdo protegido
  return <>{children}</>
}


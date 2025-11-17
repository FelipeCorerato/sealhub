import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useOrganization } from '@/contexts/OrganizationContext'
import { Loader2 } from 'lucide-react'

interface PrivateRouteProps {
  children: React.ReactNode
}

export function PrivateRoute({ children }: PrivateRouteProps) {
  const { isAuthenticated, isLoading: isAuthLoading, isEmailVerified } = useAuth()
  const { isAssociated, isLoading: isOrgLoading } = useOrganization()

  // Mostra loading enquanto verifica autenticação e organização
  if (isAuthLoading || isOrgLoading) {
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

  // Redireciona para verificação de email se não verificado
  if (!isEmailVerified) {
    return <Navigate to="/verificar-email" replace />
  }

  // Redireciona para aguardando associação se não estiver associado
  if (!isAssociated) {
    return <Navigate to="/aguardando-associacao" replace />
  }

  // Renderiza o conteúdo protegido
  return <>{children}</>
}


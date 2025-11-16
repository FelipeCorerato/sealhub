/**
 * Página de Aguardando Associação
 * Exibida para usuários com email válido mas não associados à organização
 */

import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Clock, LogOut, RefreshCw } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useOrganization } from '@/contexts/OrganizationContext'
import { useNavigate } from 'react-router-dom'

export function PendingAssociationPage() {
  const { user, logout } = useAuth()
  const { refreshOrganization, isLoading: isRefreshing, isAssociated } = useOrganization()
  const [isChecking, setIsChecking] = useState(false)
  const navigate = useNavigate()

  // Redirecionar automaticamente quando usuário for associado
  useEffect(() => {
    if (isAssociated && !isRefreshing) {
      navigate('/clientes', { replace: true })
    }
  }, [isAssociated, isRefreshing, navigate])

  const handleCheckAgain = async () => {
    setIsChecking(true)
    await refreshOrganization()
    setIsChecking(false)
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Card principal */}
        <div className="rounded-2xl bg-white p-8 shadow-lg">
          {/* Ícone */}
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-yellow-100 p-4">
              <Clock className="h-12 w-12 text-yellow-600" />
            </div>
          </div>

          {/* Título */}
          <div className="mb-6 text-center">
            <h1 className="mb-2 text-2xl font-bold text-neutral-900">
              Aguardando Aprovação
            </h1>
            <p className="text-sm text-neutral-600">
              Seu cadastro foi realizado com sucesso!
            </p>
          </div>

          {/* Informações do usuário */}
          <div className="mb-6 rounded-lg bg-neutral-50 p-4">
            <div className="mb-2">
              <span className="text-xs font-medium text-neutral-500">Nome:</span>
              <p className="text-sm font-medium text-neutral-900">{user?.name}</p>
            </div>
            <div>
              <span className="text-xs font-medium text-neutral-500">Email:</span>
              <p className="text-sm font-medium text-neutral-900">{user?.email}</p>
            </div>
          </div>

          {/* Mensagem */}
          <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <p className="text-sm text-yellow-800">
              <strong>Próximos passos:</strong>
            </p>
            <p className="mt-2 text-sm text-yellow-700">
              Um administrador precisa associar seu usuário à organização para que você possa 
              acessar a plataforma. Você receberá uma notificação quando isso acontecer.
            </p>
          </div>

          {/* Botões */}
          <div className="space-y-3">
            <Button
              onClick={handleCheckAgain}
              disabled={isChecking || isRefreshing}
              className="w-full"
              variant="default"
            >
              {isChecking || isRefreshing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Verificar Novamente
                </>
              )}
            </Button>

            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>

        {/* Informação adicional */}
        <div className="text-center">
          <p className="text-xs text-neutral-500">
            Em caso de dúvidas, entre em contato com o administrador do sistema.
          </p>
        </div>
      </div>
    </div>
  )
}


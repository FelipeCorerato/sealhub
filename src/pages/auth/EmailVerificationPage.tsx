import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Logo } from '@/components/Logo'
import { Button } from '@/components/ui/button'
import { Loader2, Mail, CheckCircle2, AlertCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { sendEmailVerification } from 'firebase/auth'
import { auth } from '@/lib/firebase'

export function EmailVerificationPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [canResend, setCanResend] = useState(true)
  const [countdown, setCountdown] = useState(0)
  const { user, logout, checkEmailVerification } = useAuth()
  const navigate = useNavigate()

  // Verificar se o email já foi verificado ao carregar a página
  useEffect(() => {
    const checkVerification = async () => {
      const isVerified = await checkEmailVerification()
      if (isVerified) {
        toast.success('Email verificado!', {
          description: 'Seu email foi confirmado com sucesso.',
        })
        navigate('/clientes')
      }
    }

    checkVerification()
  }, [checkEmailVerification, navigate])

  // Countdown para reenvio
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [countdown])

  const handleResendEmail = async () => {
    if (!auth.currentUser || !canResend) return

    setIsLoading(true)
    setCanResend(false)

    try {
      await sendEmailVerification(auth.currentUser)
      toast.success('Email enviado!', {
        description: 'Verifique sua caixa de entrada e spam.',
      })
      setCountdown(60) // 60 segundos até poder reenviar
    } catch (error) {
      console.error('Erro ao reenviar email:', error)
      
      let errorMessage = 'Não foi possível enviar o email'
      
      if (error && typeof error === 'object' && 'code' in error) {
        const firebaseError = error as { code: string }
        
        switch (firebaseError.code) {
          case 'auth/too-many-requests':
            errorMessage = 'Muitas tentativas. Aguarde alguns minutos.'
            break
          case 'auth/network-request-failed':
            errorMessage = 'Erro de conexão. Verifique sua internet.'
            break
        }
      }
      
      toast.error('Erro ao enviar email', {
        description: errorMessage,
      })
      setCanResend(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCheckVerification = async () => {
    setIsLoading(true)
    try {
      const isVerified = await checkEmailVerification()
      
      if (isVerified) {
        toast.success('Email verificado!', {
          description: 'Redirecionando para o sistema...',
        })
        setTimeout(() => {
          navigate('/clientes')
        }, 1500)
      } else {
        toast.info('Email ainda não verificado', {
          description: 'Verifique sua caixa de entrada e clique no link do email.',
        })
      }
    } catch (error) {
      console.error('Erro ao verificar email:', error)
      toast.error('Erro ao verificar', {
        description: 'Não foi possível verificar o status do email.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-neutral-50 to-orange-50 p-4">
      <div className="w-full max-w-md">
        {/* Card de Verificação */}
        <div className="rounded-3xl bg-white p-8 shadow-xl">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <Logo />
          </div>

          {/* Ícone de Email */}
          <div className="mb-6 flex justify-center">
            <div
              className="rounded-full p-4"
              style={{ backgroundColor: 'var(--color-primary-light)' }}
            >
              <Mail
                className="h-12 w-12"
                style={{ color: 'var(--color-primary)' }}
              />
            </div>
          </div>

          {/* Título */}
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-neutral-800">
              Verifique seu email
            </h1>
            <p className="mt-3 text-sm text-neutral-600">
              Enviamos um link de verificação para
            </p>
            <p className="mt-1 font-semibold text-neutral-800">
              {user?.email}
            </p>
          </div>

          {/* Instruções */}
          <div className="mb-8 space-y-3">
            <div className="flex items-start gap-3 rounded-lg bg-blue-50 p-3">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
              <div className="text-sm text-blue-800">
                <strong>Passos para verificar:</strong>
                <ol className="mt-2 ml-4 list-decimal space-y-1">
                  <li>Abra seu email corporativo</li>
                  <li>Procure o email de verificação</li>
                  <li>Clique no link de confirmação</li>
                  <li>Volte aqui e clique em "Verificar"</li>
                </ol>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg bg-amber-50 p-3">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
              <p className="text-sm text-amber-800">
                Não encontrou o email? Verifique sua pasta de{' '}
                <strong>spam ou lixo eletrônico</strong>.
              </p>
            </div>
          </div>

          {/* Botões */}
          <div className="space-y-3">
            {/* Botão Verificar */}
            <Button
              onClick={handleCheckVerification}
              disabled={isLoading}
              className="h-12 w-full gap-2 text-base font-semibold text-white transition-all hover:scale-[1.02] disabled:hover:scale-100"
              style={
                isLoading
                  ? undefined
                  : {
                      backgroundColor: 'var(--color-primary)',
                    }
              }
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor =
                    'var(--color-primary-hover)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor =
                    'var(--color-primary)'
                }
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-5 w-5" />
                  Já verifiquei meu email
                </>
              )}
            </Button>

            {/* Botão Reenviar */}
            <Button
              onClick={handleResendEmail}
              disabled={!canResend || isLoading}
              variant="outline"
              className="h-12 w-full gap-2 border-2 text-base font-medium transition-all hover:scale-[1.02] disabled:hover:scale-100"
            >
              {isLoading && !canResend ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Enviando...
                </>
              ) : countdown > 0 ? (
                <>
                  <Mail className="h-5 w-5" />
                  Reenviar em {countdown}s
                </>
              ) : (
                <>
                  <Mail className="h-5 w-5" />
                  Reenviar email
                </>
              )}
            </Button>
          </div>

          {/* Link para Sair */}
          <div className="mt-6 text-center">
            <button
              onClick={handleLogout}
              className="text-sm text-neutral-600 hover:underline"
            >
              Sair e usar outro email
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-neutral-600">
          © 2025 Gestão de Selos
        </p>
      </div>
    </div>
  )
}


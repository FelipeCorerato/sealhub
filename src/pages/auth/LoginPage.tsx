import { useState, FormEvent } from 'react'
import { Logo } from '@/components/Logo'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    // Validações
    if (!email.trim()) {
      toast.error('Email é obrigatório')
      return
    }

    if (!email.includes('@')) {
      toast.error('Email inválido')
      return
    }

    if (!password) {
      toast.error('Senha é obrigatória')
      return
    }

    if (password.length < 6) {
      toast.error('Senha deve ter no mínimo 6 caracteres')
      return
    }

    setIsLoading(true)
    try {
      await login(email, password)
    } catch (error) {
      toast.error('Falha no login', {
        description:
          error instanceof Error
            ? error.message
            : 'Verifique suas credenciais',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-neutral-50 to-orange-50 p-4">
      <div className="w-full max-w-md">
        {/* Card de Login */}
        <div className="rounded-3xl bg-white p-8 shadow-xl">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <Logo />
          </div>

          {/* Título */}
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-neutral-800">
              Bem-vindo de volta!
            </h1>
            <p className="mt-2 text-sm text-neutral-600">
              Faça login para acessar o sistema
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-neutral-700"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="h-12"
                autoComplete="email"
                autoFocus
              />
            </div>

            {/* Senha */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-neutral-700"
              >
                Senha
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="h-12"
                autoComplete="current-password"
              />
            </div>

            {/* Botão de Login */}
            <Button
              type="submit"
              disabled={isLoading}
              className="h-12 w-full bg-[#D97B35] text-base font-semibold text-white transition-all hover:bg-[#bd6126] hover:scale-[1.02] disabled:bg-neutral-300 disabled:hover:scale-100"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>

          {/* Credenciais de Teste */}
          <div className="mt-8 rounded-lg bg-neutral-50 p-4">
            <p className="mb-2 text-xs font-semibold uppercase text-neutral-500">
              Credenciais de teste:
            </p>
            <p className="text-sm text-neutral-700">
              <span className="font-medium">Email:</span> admin@vgsa.com.br
            </p>
            <p className="text-sm text-neutral-700">
              <span className="font-medium">Senha:</span> 123456
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-neutral-600">
          © 2025 VGSA - Gestão de Selos
        </p>
      </div>
    </div>
  )
}


import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Logo } from '@/components/Logo'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

export function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { register } = useAuth()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    // Validações
    if (!name.trim()) {
      toast.error('Nome é obrigatório')
      return
    }

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

    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem')
      return
    }

    setIsLoading(true)
    try {
      await register(email, password, name)
    } catch (error) {
      toast.error('Falha no registro', {
        description:
          error instanceof Error
            ? error.message
            : 'Não foi possível criar a conta',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-neutral-50 to-orange-50 p-4">
      <div className="w-full max-w-md">
        {/* Card de Registro */}
        <div className="rounded-3xl bg-white p-8 shadow-xl">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <Logo />
          </div>

          {/* Título */}
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-neutral-800">
              Criar nova conta
            </h1>
            <p className="mt-2 text-sm text-neutral-600">
              Preencha os dados para se cadastrar
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nome */}
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-neutral-700"
              >
                Nome completo
              </label>
              <Input
                id="name"
                type="text"
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                className="h-12"
                autoComplete="name"
                autoFocus
              />
            </div>

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
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="h-12"
                autoComplete="new-password"
              />
            </div>

            {/* Confirmar Senha */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium text-neutral-700"
              >
                Confirmar senha
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Digite a senha novamente"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                className="h-12"
                autoComplete="new-password"
              />
            </div>

            {/* Botão de Registro */}
            <Button
              type="submit"
              disabled={isLoading}
              className="h-12 w-full bg-[#D97B35] text-base font-semibold text-white transition-all hover:bg-[#bd6126] hover:scale-[1.02] disabled:bg-neutral-300 disabled:hover:scale-100"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Criando conta...
                </>
              ) : (
                'Criar conta'
              )}
            </Button>
          </form>

          {/* Link para Login */}
          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-600">
              Já tem uma conta?{' '}
              <Link
                to="/login"
                className="font-semibold text-[#D97B35] hover:underline"
              >
                Fazer login
              </Link>
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


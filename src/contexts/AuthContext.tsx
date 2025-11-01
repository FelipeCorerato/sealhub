import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

interface User {
  id: string
  name: string
  email: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

const STORAGE_KEY = 'sealhub_auth'

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  // Carregar sessão do localStorage ao iniciar
  useEffect(() => {
    const loadStoredAuth = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          const { user: storedUser } = JSON.parse(stored)
          setUser(storedUser)
        }
      } catch (error) {
        console.error('Erro ao carregar autenticação:', error)
        localStorage.removeItem(STORAGE_KEY)
      } finally {
        setIsLoading(false)
      }
    }

    loadStoredAuth()
  }, [])

  const login = async (email: string, password: string) => {
    // Mock de autenticação - importado dinamicamente para evitar circular dependency
    const { loginUser } = await import('@/lib/api.mock')
    
    try {
      const response = await loginUser(email, password)
      
      // Salvar no estado e localStorage
      setUser(response.user)
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ user: response.user, token: response.token }),
      )

      toast.success('Login realizado com sucesso!', {
        description: `Bem-vindo(a), ${response.user.name}`,
      })

      // Redirecionar para clientes
      navigate('/clientes')
    } catch (error) {
      console.error('Erro no login:', error)
      throw error
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
    
    toast.info('Sessão encerrada', {
      description: 'Você foi desconectado com sucesso.',
    })

    navigate('/login')
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}


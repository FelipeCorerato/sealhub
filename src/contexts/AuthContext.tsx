import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth'
import type { User as FirebaseUser } from 'firebase/auth'
import { auth } from '@/lib/firebase'

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
  logout: () => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
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

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  // Monitorar mudanças de autenticação do Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // Usuário está logado
        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuário',
        })
      } else {
        // Usuário não está logado
        setUser(null)
      }
      setIsLoading(false)
    })

    // Cleanup: cancelar inscrição quando o componente desmontar
    return () => unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      
      toast.success('Login realizado com sucesso!', {
        description: `Bem-vindo(a), ${userCredential.user.displayName || userCredential.user.email}`,
      })

      // Redirecionar para clientes
      navigate('/clientes')
    } catch (error: any) {
      console.error('Erro no login:', error)
      
      // Tratamento de erros específicos do Firebase
      let errorMessage = 'Verifique suas credenciais'
      
      switch (error.code) {
        case 'auth/invalid-credential':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          errorMessage = 'Email ou senha incorretos'
          break
        case 'auth/user-disabled':
          errorMessage = 'Usuário desabilitado'
          break
        case 'auth/too-many-requests':
          errorMessage = 'Muitas tentativas. Tente novamente mais tarde'
          break
        case 'auth/network-request-failed':
          errorMessage = 'Erro de conexão. Verifique sua internet'
          break
        case 'auth/invalid-email':
          errorMessage = 'Email inválido'
          break
      }
      
      throw new Error(errorMessage)
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      
      toast.info('Sessão encerrada', {
        description: 'Você foi desconectado com sucesso.',
      })

      navigate('/login')
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
      toast.error('Erro ao sair', {
        description: 'Não foi possível encerrar a sessão',
      })
    }
  }

  const register = async (email: string, password: string, name: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      
      // Atualizar o nome do usuário
      await updateProfile(userCredential.user, {
        displayName: name,
      })
      
      toast.success('Conta criada com sucesso!', {
        description: `Bem-vindo(a), ${name}`,
      })

      navigate('/clientes')
    } catch (error: any) {
      console.error('Erro no registro:', error)
      
      let errorMessage = 'Não foi possível criar a conta'
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Este email já está em uso'
          break
        case 'auth/weak-password':
          errorMessage = 'Senha muito fraca. Use no mínimo 6 caracteres'
          break
        case 'auth/invalid-email':
          errorMessage = 'Email inválido'
          break
      }
      
      throw new Error(errorMessage)
    }
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    register,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}


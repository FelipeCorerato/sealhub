import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  sendEmailVerification
} from 'firebase/auth'
import type { User as FirebaseUser } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { upsertUserProfile } from '@/lib/firebase/users'
import { isAllowedEmailDomain, getAllowedDomainsMessage } from '@/lib/email-domains'

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
  loginWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  checkEmailVerification: () => Promise<boolean>
  isEmailVerified: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// eslint-disable-next-line react-refresh/only-export-components
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
  const [isEmailVerified, setIsEmailVerified] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  // Monitorar mudanças de autenticação do Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // Usuário está logado
        const userData = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuário',
        }
        setUser(userData)
        setIsEmailVerified(firebaseUser.emailVerified)
        
        // Atualiza o perfil do usuário no Firestore
        try {
          await upsertUserProfile(userData.id, userData.name, userData.email)
        } catch (error) {
          console.error('Erro ao atualizar perfil do usuário:', error)
        }
      } else {
        // Usuário não está logado
        setUser(null)
        setIsEmailVerified(false)
      }
      setIsLoading(false)
    })

    // Cleanup: cancelar inscrição quando o componente desmontar
    return () => unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      
      // Verificar se o email foi verificado
      if (!userCredential.user.emailVerified) {
        toast.info('Email não verificado', {
          description: 'Você precisa verificar seu email antes de acessar o sistema.',
        })
        navigate('/verificar-email')
        return
      }
      
      toast.success('Login realizado com sucesso!', {
        description: `Bem-vindo(a), ${userCredential.user.displayName || userCredential.user.email}`,
      })

      // Redirecionar para clientes
      navigate('/clientes')
    } catch (error: unknown) {
      console.error('Erro no login:', error)
      
      // Tratamento de erros específicos do Firebase
      let errorMessage = 'Verifique suas credenciais'
      
      if (error && typeof error === 'object' && 'code' in error) {
        const firebaseError = error as { code: string }
        
        switch (firebaseError.code) {
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
      }
      
      throw new Error(errorMessage)
    }
  }

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider()
      provider.setCustomParameters({
        prompt: 'select_account'
      })
      
      const userCredential = await signInWithPopup(auth, provider)
      
      // Validar domínio do email
      const userEmail = userCredential.user.email
      if (!userEmail || !isAllowedEmailDomain(userEmail)) {
        // Fazer logout do usuário não autorizado
        await signOut(auth)
        throw new Error(getAllowedDomainsMessage())
      }
      
      // Google já verifica o email automaticamente, então podemos confiar
      toast.success('Login realizado com sucesso!', {
        description: `Bem-vindo(a), ${userCredential.user.displayName || userCredential.user.email}`,
      })

      // Redirecionar para clientes
      navigate('/clientes')
    } catch (error: unknown) {
      console.error('Erro no login com Google:', error)
      
      let errorMessage = 'Não foi possível fazer login com Google'
      
      if (error && typeof error === 'object' && 'code' in error) {
        const firebaseError = error as { code: string }
        
        switch (firebaseError.code) {
          case 'auth/popup-closed-by-user':
            errorMessage = 'Login cancelado pelo usuário'
            break
          case 'auth/popup-blocked':
            errorMessage = 'Pop-up bloqueado. Permita pop-ups para este site'
            break
          case 'auth/cancelled-popup-request':
            // Não mostrar erro se o usuário cancelou
            return
          case 'auth/account-exists-with-different-credential':
            errorMessage = 'Esta conta já existe com outro método de login'
            break
          case 'auth/network-request-failed':
            errorMessage = 'Erro de conexão. Verifique sua internet'
            break
        }
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
      // Validar domínio do email antes de criar a conta
      if (!isAllowedEmailDomain(email)) {
        throw new Error(getAllowedDomainsMessage())
      }
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      
      // Atualizar o nome do usuário
      await updateProfile(userCredential.user, {
        displayName: name,
      })
      
      // Enviar email de verificação
      try {
        await sendEmailVerification(userCredential.user)
      toast.success('Conta criada com sucesso!', {
          description: 'Enviamos um email de verificação para você.',
        })
      } catch (emailError) {
        console.error('Erro ao enviar email de verificação:', emailError)
        toast.warning('Conta criada!', {
          description: 'Mas não foi possível enviar o email de verificação.',
      })
      }

      navigate('/verificar-email')
    } catch (error: unknown) {
      console.error('Erro no registro:', error)
      
      let errorMessage = 'Não foi possível criar a conta'
      
      if (error && typeof error === 'object' && 'code' in error) {
        const firebaseError = error as { code: string }
        
        switch (firebaseError.code) {
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
      }
      
      throw new Error(errorMessage)
    }
  }

  const checkEmailVerification = async (): Promise<boolean> => {
    if (!auth.currentUser) return false
    
    // Recarregar o usuário para obter o status mais recente
    await auth.currentUser.reload()
    
    const isVerified = auth.currentUser.emailVerified
    setIsEmailVerified(isVerified)
    
    return isVerified
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    loginWithGoogle,
    logout,
    register,
    checkEmailVerification,
    isEmailVerified,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}


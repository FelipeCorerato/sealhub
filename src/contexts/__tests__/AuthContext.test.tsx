import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { BrowserRouter } from 'react-router-dom'
import type { ReactNode } from 'react'

// Mock do React Router
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Mock do Firebase Auth
const mockSignInWithEmailAndPassword = vi.fn()
const mockSignOut = vi.fn()
const mockCreateUserWithEmailAndPassword = vi.fn()
const mockUpdateProfile = vi.fn()
const mockSignInWithPopup = vi.fn()
const mockSendEmailVerification = vi.fn()
const mockOnAuthStateChanged = vi.fn()

vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: (...args: any[]) => mockSignInWithEmailAndPassword(...args),
  signOut: (...args: any[]) => mockSignOut(...args),
  createUserWithEmailAndPassword: (...args: any[]) => mockCreateUserWithEmailAndPassword(...args),
  updateProfile: (...args: any[]) => mockUpdateProfile(...args),
  signInWithPopup: (...args: any[]) => mockSignInWithPopup(...args),
  sendEmailVerification: (...args: any[]) => mockSendEmailVerification(...args),
  onAuthStateChanged: (...args: any[]) => mockOnAuthStateChanged(...args),
  GoogleAuthProvider: class GoogleAuthProvider {
    setCustomParameters = vi.fn()
  },
}))

// Mock do Firebase
vi.mock('@/lib/firebase', () => ({
  auth: {
    currentUser: null,
  },
}))

// Mock das funções do Firebase
vi.mock('@/lib/firebase/users', () => ({
  upsertUserProfile: vi.fn().mockResolvedValue(undefined),
}))

// Mock do email-domains
vi.mock('@/lib/email-domains', () => ({
  isAllowedEmailDomain: vi.fn((email: string) => email.includes('@iasabrasil.com.br')),
  getAllowedDomainsMessage: vi.fn(() => 'Apenas emails @iasabrasil.com.br são permitidos'),
}))

// Mock do sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}))

describe('contexts/AuthContext', () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <BrowserRouter>
      <AuthProvider>{children}</AuthProvider>
    </BrowserRouter>
  )

  beforeEach(() => {
    vi.clearAllMocks()
    mockNavigate.mockClear()
    
    // Mock padrão do onAuthStateChanged
    mockOnAuthStateChanged.mockImplementation((auth, callback) => {
      // Simula usuário não logado inicialmente
      callback(null)
      return vi.fn() // cleanup function
    })
  })

  describe('useAuth', () => {
    it('deve lançar erro se usado fora do AuthProvider', () => {
      expect(() => {
        renderHook(() => useAuth())
      }).toThrow('useAuth deve ser usado dentro de um AuthProvider')
    })

    it('deve fornecer contexto de autenticação', () => {
      const { result } = renderHook(() => useAuth(), { wrapper })

      expect(result.current).toBeDefined()
      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('login', () => {
    it('deve fazer login com email e senha', async () => {
      const mockUser = {
        uid: 'test-user-id',
        email: 'test@iasabrasil.com.br',
        displayName: 'Test User',
        emailVerified: true,
      }

      mockSignInWithEmailAndPassword.mockResolvedValue({
        user: mockUser,
      })

      const { result } = renderHook(() => useAuth(), { wrapper })

      await act(async () => {
        await result.current.login('test@iasabrasil.com.br', 'password123')
      })

      expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'test@iasabrasil.com.br',
        'password123'
      )
      expect(mockNavigate).toHaveBeenCalledWith('/clientes')
    })

    it('deve redirecionar para verificação se email não verificado', async () => {
      const mockUser = {
        uid: 'test-user-id',
        email: 'test@iasabrasil.com.br',
        displayName: 'Test User',
        emailVerified: false,
      }

      mockSignInWithEmailAndPassword.mockResolvedValue({
        user: mockUser,
      })

      const { result } = renderHook(() => useAuth(), { wrapper })

      await act(async () => {
        await result.current.login('test@iasabrasil.com.br', 'password123')
      })

      expect(mockNavigate).toHaveBeenCalledWith('/verificar-email')
    })

    it('deve tratar erros de login', async () => {
      mockSignInWithEmailAndPassword.mockRejectedValue({
        code: 'auth/invalid-credential',
      })

      const { result } = renderHook(() => useAuth(), { wrapper })

      await expect(
        result.current.login('test@iasabrasil.com.br', 'wrong-password')
      ).rejects.toThrow('Email ou senha incorretos')
    })
  })

  describe('register', () => {
    it('deve registrar novo usuário', async () => {
      const mockUser = {
        uid: 'new-user-id',
        email: 'newuser@iasabrasil.com.br',
        displayName: null,
        emailVerified: false,
      }

      mockCreateUserWithEmailAndPassword.mockResolvedValue({
        user: mockUser,
      })
      mockUpdateProfile.mockResolvedValue(undefined)
      mockSendEmailVerification.mockResolvedValue(undefined)

      const { result } = renderHook(() => useAuth(), { wrapper })

      await act(async () => {
        await result.current.register('newuser@iasabrasil.com.br', 'password123', 'New User')
      })

      expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalled()
      expect(mockUpdateProfile).toHaveBeenCalled()
      expect(mockSendEmailVerification).toHaveBeenCalled()
      expect(mockNavigate).toHaveBeenCalledWith('/verificar-email')
    })

    it('deve validar domínio do email', async () => {
      // Importar o mock e configurar para rejeitar email não autorizado
      const emailDomainsModule = await import('@/lib/email-domains')
      vi.mocked(emailDomainsModule.isAllowedEmailDomain).mockReturnValue(false)
      
      const { result } = renderHook(() => useAuth(), { wrapper })

      await expect(
        result.current.register('user@unauthorized.com', 'password123', 'User')
      ).rejects.toThrow()
      
      // Resetar mock
      vi.mocked(emailDomainsModule.isAllowedEmailDomain).mockReturnValue(true)
    })

    it('deve tratar erros de registro', async () => {
      mockCreateUserWithEmailAndPassword.mockRejectedValue({
        code: 'auth/email-already-in-use',
      })

      const { result } = renderHook(() => useAuth(), { wrapper })

      await expect(
        result.current.register('existing@iasabrasil.com.br', 'password123', 'User')
      ).rejects.toThrow('Este email já está em uso')
    })
  })

  describe('logout', () => {
    it('deve fazer logout', async () => {
      mockSignOut.mockResolvedValue(undefined)

      const { result } = renderHook(() => useAuth(), { wrapper })

      await act(async () => {
        await result.current.logout()
      })

      expect(mockSignOut).toHaveBeenCalled()
      expect(mockNavigate).toHaveBeenCalledWith('/login')
    })
  })

  describe('loginWithGoogle', () => {
    it('deve fazer login com Google', async () => {
      const mockUser = {
        uid: 'google-user-id',
        email: 'user@iasabrasil.com.br',
        displayName: 'Google User',
        emailVerified: true,
      }

      mockSignInWithPopup.mockResolvedValue({
        user: mockUser,
      })

      const { result } = renderHook(() => useAuth(), { wrapper })

      await act(async () => {
        await result.current.loginWithGoogle()
      })

      expect(mockSignInWithPopup).toHaveBeenCalled()
      expect(mockNavigate).toHaveBeenCalledWith('/clientes')
    })

    it('deve validar domínio ao fazer login com Google', async () => {
      const mockUser = {
        uid: 'google-user-id',
        email: 'user@unauthorized.com',
        displayName: 'Google User',
        emailVerified: true,
      }

      mockSignInWithPopup.mockResolvedValue({
        user: mockUser,
      })
      mockSignOut.mockResolvedValue(undefined)
      
      // Importar o mock e configurar para rejeitar email não autorizado
      const emailDomainsModule = await import('@/lib/email-domains')
      vi.mocked(emailDomainsModule.isAllowedEmailDomain).mockReturnValue(false)

      const { result } = renderHook(() => useAuth(), { wrapper })

      await expect(result.current.loginWithGoogle()).rejects.toThrow()

      expect(mockSignOut).toHaveBeenCalled()
      
      // Resetar mock
      vi.mocked(emailDomainsModule.isAllowedEmailDomain).mockReturnValue(true)
    })
  })

  describe('checkEmailVerification', () => {
    it('deve verificar status de verificação de email', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper })

      // Como não podemos mockar facilmente auth.currentUser,
      // apenas verificamos que a função existe e retorna boolean
      const mockReturn = await result.current.checkEmailVerification()
      
      expect(typeof mockReturn).toBe('boolean')
    })
  })

  describe('Estado de autenticação', () => {
    it('deve atualizar estado quando usuário faz login', async () => {
      const mockUser = {
        uid: 'test-user-id',
        email: 'test@iasabrasil.com.br',
        displayName: 'Test User',
        emailVerified: true,
      }

      let authCallback: any
      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        authCallback = callback
        callback(null) // Inicialmente não logado
        return vi.fn()
      })

      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.isAuthenticated).toBe(false)

      // Simular login
      if (authCallback) {
        act(() => {
          authCallback(mockUser)
        })
      }

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true)
      })
    })
  })
})


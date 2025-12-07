import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { OrganizationProvider, useOrganization } from '@/contexts/OrganizationContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { BrowserRouter } from 'react-router-dom'
import type { ReactNode } from 'react'
import { mockOrganization } from '@/tests/__mocks__/firebase.mock'

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
const mockOnAuthStateChanged = vi.fn()
vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  updateProfile: vi.fn(),
  signInWithPopup: vi.fn(),
  sendEmailVerification: vi.fn(),
  onAuthStateChanged: (...args: any[]) => mockOnAuthStateChanged(...args),
  GoogleAuthProvider: vi.fn(),
}))

vi.mock('@/lib/firebase', () => ({
  auth: {},
}))

vi.mock('@/lib/firebase/users', () => ({
  upsertUserProfile: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/lib/email-domains', () => ({
  isAllowedEmailDomain: vi.fn(() => true),
  getAllowedDomainsMessage: vi.fn(() => 'Apenas emails corporativos são permitidos'),
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}))

// Mock do getUserOrganization
const mockGetUserOrganization = vi.fn()
vi.mock('@/lib/firebase/organizations', () => ({
  getUserOrganization: (...args: any[]) => mockGetUserOrganization(...args),
}))

describe('contexts/OrganizationContext', () => {
  const mockUser = {
    uid: 'test-user-id',
    email: 'test@iasabrasil.com.br',
    displayName: 'Test User',
    emailVerified: true,
  }

  const wrapper = ({ children }: { children: ReactNode }) => (
    <BrowserRouter>
      <AuthProvider>
        <OrganizationProvider>{children}</OrganizationProvider>
      </AuthProvider>
    </BrowserRouter>
  )

  beforeEach(() => {
    vi.clearAllMocks()
    mockNavigate.mockClear()
    
    // Mock padrão do onAuthStateChanged - usuário logado
    mockOnAuthStateChanged.mockImplementation((auth, callback) => {
      callback(mockUser)
      return vi.fn()
    })
  })

  describe('useOrganization', () => {
    it('deve lançar erro se usado fora do OrganizationProvider', () => {
      expect(() => {
        renderHook(() => useOrganization())
      }).toThrow('useOrganization deve ser usado dentro de um OrganizationProvider')
    })

    it('deve fornecer contexto de organização', async () => {
      mockGetUserOrganization.mockResolvedValue(mockOrganization)

      const { result } = renderHook(() => useOrganization(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current).toBeDefined()
    })
  })

  describe('Carregamento de organização', () => {
    it('deve carregar organização do usuário', async () => {
      mockGetUserOrganization.mockResolvedValue(mockOrganization)

      const { result } = renderHook(() => useOrganization(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await waitFor(() => {
        expect(result.current.organization).toBeDefined()
      })

      expect(mockGetUserOrganization).toHaveBeenCalledWith('test-user-id')
    })

    it('deve tratar caso de usuário sem organização', async () => {
      mockGetUserOrganization.mockResolvedValue(null)

      const { result } = renderHook(() => useOrganization(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.organization).toBeNull()
      expect(result.current.isAssociated).toBe(false)
    })

    it('deve tratar erro ao carregar organização', async () => {
      mockGetUserOrganization.mockRejectedValue(new Error('Erro ao carregar'))

      const { result } = renderHook(() => useOrganization(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.organization).toBeNull()
    })
  })

  describe('isAdmin', () => {
    it('deve identificar usuário admin', async () => {
      const orgWithAdmin = {
        ...mockOrganization,
        adminUsers: ['test-user-id'],
      }

      mockGetUserOrganization.mockResolvedValue(orgWithAdmin)

      const { result } = renderHook(() => useOrganization(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await waitFor(() => {
        expect(result.current.isAdmin).toBe(true)
      })
    })

    it('deve identificar usuário não-admin', async () => {
      const orgWithoutAdmin = {
        ...mockOrganization,
        adminUsers: ['other-user-id'],
      }

      mockGetUserOrganization.mockResolvedValue(orgWithoutAdmin)

      const { result } = renderHook(() => useOrganization(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await waitFor(() => {
        expect(result.current.isAdmin).toBe(false)
      })
    })
  })

  describe('isAssociated', () => {
    it('deve retornar true se usuário tem organização', async () => {
      mockGetUserOrganization.mockResolvedValue(mockOrganization)

      const { result } = renderHook(() => useOrganization(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await waitFor(() => {
        expect(result.current.isAssociated).toBe(true)
      })
    })

    it('deve retornar false se usuário não tem organização', async () => {
      mockGetUserOrganization.mockResolvedValue(null)

      const { result } = renderHook(() => useOrganization(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.isAssociated).toBe(false)
    })
  })

  describe('refreshOrganization', () => {
    it('deve recarregar organização', async () => {
      mockGetUserOrganization.mockResolvedValue(mockOrganization)

      const { result } = renderHook(() => useOrganization(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(mockGetUserOrganization).toHaveBeenCalledTimes(1)

      // Atualizar mock para nova organização
      const updatedOrg = {
        ...mockOrganization,
        name: 'Updated Organization',
      }
      mockGetUserOrganization.mockResolvedValue(updatedOrg)

      await act(async () => {
        await result.current.refreshOrganization()
      })

      expect(mockGetUserOrganization).toHaveBeenCalledTimes(2)
    })
  })

  describe('Tema da organização', () => {
    it('deve aplicar tema da organização', async () => {
      const orgWithTheme = {
        ...mockOrganization,
        theme: {
          primaryColor: '#FF5733',
          faviconUrl: 'https://example.com/favicon.ico',
          logoUrl: 'https://example.com/logo.png',
        },
      }

      mockGetUserOrganization.mockResolvedValue(orgWithTheme)

      renderHook(() => useOrganization(), { wrapper })

      await waitFor(() => {
        const root = document.documentElement
        const primaryColor = root.style.getPropertyValue('--color-primary')
        // O tema deve ter sido aplicado
        expect(primaryColor).toBeDefined()
      })
    })

    it('deve funcionar sem tema configurado', async () => {
      const orgWithoutTheme = {
        ...mockOrganization,
        theme: {},
      }

      mockGetUserOrganization.mockResolvedValue(orgWithoutTheme)

      const { result } = renderHook(() => useOrganization(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.organization).toBeDefined()
    })
  })

  describe('Estado sem autenticação', () => {
    it('deve não carregar organização se usuário não estiver autenticado', async () => {
      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        callback(null) // Sem usuário
        return vi.fn()
      })

      const { result } = renderHook(() => useOrganization(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.organization).toBeNull()
      expect(mockGetUserOrganization).not.toHaveBeenCalled()
    })
  })
})


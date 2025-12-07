import { vi } from 'vitest'
import type { User as FirebaseUser } from 'firebase/auth'

// Mock do Firebase Auth
export const mockFirebaseUser: Partial<FirebaseUser> = {
  uid: 'test-user-id',
  email: 'test@iasabrasil.com.br',
  displayName: 'Test User',
  emailVerified: true,
  reload: vi.fn().mockResolvedValue(undefined),
}

export const mockAuth = {
  currentUser: mockFirebaseUser as FirebaseUser,
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  updateProfile: vi.fn(),
  signInWithPopup: vi.fn(),
  sendEmailVerification: vi.fn(),
}

// Mock do Firestore
export const mockFirestore = {
  collection: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  Timestamp: {
    now: vi.fn(() => ({
      toDate: () => new Date('2024-01-01T00:00:00.000Z'),
    })),
    fromDate: vi.fn((date: Date) => ({
      toDate: () => date,
    })),
  },
}

// Mock de documentos do Firestore
export const createMockDocSnapshot = (data: any, exists = true) => ({
  exists: () => exists,
  data: () => data,
  id: data?.id || 'mock-id',
})

export const createMockQuerySnapshot = (docs: any[]) => ({
  empty: docs.length === 0,
  docs: docs.map((doc) => ({
    id: doc.id,
    data: () => doc,
  })),
  forEach: (callback: (doc: any) => void) => {
    docs.forEach((doc) =>
      callback({
        id: doc.id,
        data: () => doc,
      })
    )
  },
})

// Mock de Organization
export const mockOrganization = {
  id: 'test-org-id',
  name: 'Test Organization',
  slug: 'test-org',
  adminUsers: ['test-user-id'],
  activeUsers: ['test-user-id'],
  pendingUsers: [],
  theme: {
    primaryColor: '#DC7B35',
  },
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
}

// Mock de Company
export const mockCompany = {
  id: 'test-company-id',
  organizationId: 'test-org-id',
  cnpj: '12345678000100',
  name: 'Test Company',
  legalName: 'Test Company Ltda',
  address: 'Rua Teste, 123, São Paulo - SP',
  type: 'headquarters' as const,
  status: 'active' as const,
  phone: '(11) 1234-5678',
  email: 'test@company.com',
  contactPerson: 'Test Person',
  notes: 'Test notes',
  createdAt: new Date('2024-01-01'),
  createdBy: 'test-user-id',
  updatedAt: new Date('2024-01-01'),
}

// Mock de Campaign
export const mockCampaign = {
  id: 'test-campaign-id',
  name: 'Test Campaign',
  sender: 'Test Sender',
  observation: 'Test observation',
  instructions: {
    fragile: true,
    attention: false,
    handleWithCare: true,
    thisWayUp: false,
  },
  organizationId: 'test-org-id',
  companyIds: ['test-company-id'],
  status: 'active' as const,
  createdAt: new Date('2024-01-01'),
  createdBy: 'test-user-id',
  updatedAt: new Date('2024-01-01'),
  updatedBy: 'test-user-id',
}

export const resetAllMocks = () => {
  Object.values(mockAuth).forEach((mock) => {
    if (typeof mock === 'function' && 'mockReset' in mock) {
      mock.mockReset()
    }
  })
  Object.values(mockFirestore).forEach((mock) => {
    if (typeof mock === 'function' && 'mockReset' in mock) {
      mock.mockReset()
    }
  })
}


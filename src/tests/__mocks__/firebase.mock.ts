import { vi } from 'vitest'
import type { User as FirebaseUser } from 'firebase/auth'
import type { DocumentSnapshot, QuerySnapshot, DocumentData, SnapshotMetadata } from 'firebase/firestore'

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

// Mock metadata para DocumentSnapshot
const mockMetadata: SnapshotMetadata = {
  hasPendingWrites: false,
  fromCache: false,
  isEqual: vi.fn(() => true),
}

// Mock de documentos do Firestore com tipos corretos
export const createMockDocSnapshot = <T = DocumentData>(
  data: T | null, 
  exists = true
): DocumentSnapshot<T, DocumentData> => ({
  exists: () => exists,
  data: () => (exists ? data as any : undefined),
  id: (data as any)?.id || 'mock-id',
  metadata: mockMetadata,
  get: vi.fn((fieldPath: string) => {
    if (!exists || !data) return undefined
    return (data as any)[fieldPath]
  }) as any,
  toJSON: vi.fn(() => data) as any,
  ref: {} as any,
} as DocumentSnapshot<T, DocumentData>)

export const createMockQuerySnapshot = <T = DocumentData>(
  docs: T[]
): QuerySnapshot<T, DocumentData> => ({
  empty: docs.length === 0,
  size: docs.length,
  docs: docs.map((doc) => ({
    id: (doc as any).id,
    data: () => doc,
    exists: () => true,
    metadata: mockMetadata,
    get: vi.fn() as any,
    toJSON: vi.fn(() => doc) as any,
    ref: {} as any,
  } as any)),
  forEach: (callback: (doc: any) => void) => {
    docs.forEach((doc) =>
      callback({
        id: (doc as any).id,
        data: () => doc,
        exists: () => true,
        metadata: mockMetadata,
        get: vi.fn(),
        toJSON: vi.fn(() => doc),
        ref: {} as any,
      })
    )
  },
  metadata: mockMetadata,
  query: {} as any,
  docChanges: vi.fn(() => []) as any,
  toJSON: vi.fn(() => docs) as any,
} as QuerySnapshot<T, DocumentData>)

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


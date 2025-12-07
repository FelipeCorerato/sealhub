import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createCompany,
  getCompanyById,
  getCompanyByCNPJ,
  searchCompaniesByName,
  searchCompaniesByCNPJ,
  getAllCompanies,
  updateCompany,
  deleteCompany,
  cnpjExists,
  upsertCompanyFromReceita,
  saveMatrizAndBranches,
  searchRelatedCompanies,
} from '@/lib/firebase/companies'
import type { CreateCompanyData, CompanyData } from '@/types'
import {
  mockCompany,
  createMockDocSnapshot,
  createMockQuerySnapshot,
  resetAllMocks,
} from '@/tests/__mocks__/firebase.mock'

// Mock do Firebase
vi.mock('@/lib/firebase', () => ({
  db: {},
}))

vi.mock('firebase/firestore', async () => {
  // Mock da classe Timestamp
  class MockTimestamp {
    seconds: number
    nanoseconds: number
    
    constructor(seconds: number, nanoseconds: number) {
      this.seconds = seconds
      this.nanoseconds = nanoseconds
    }
    
    toDate() {
      return new Date(this.seconds * 1000)
    }
    
    static now() {
      const now = Date.now()
      return new MockTimestamp(Math.floor(now / 1000), 0)
    }
    
    static fromDate(date: Date) {
      return new MockTimestamp(Math.floor(date.getTime() / 1000), 0)
    }
  }
  
  return {
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
    Timestamp: MockTimestamp,
  }
})

describe('firebase/companies', () => {
  beforeEach(() => {
    resetAllMocks()
    vi.clearAllMocks()
  })

  describe('createCompany', () => {
    it('deve criar uma nova empresa com sucesso', async () => {
      const { addDoc, getDoc, collection, Timestamp } = await import('firebase/firestore')
      
      const newCompanyData: CreateCompanyData = {
        organizationId: 'test-org-id',
        cnpj: '12345678000100',
        name: 'Nova Empresa',
        address: 'Rua Nova, 123',
        type: 'headquarters',
        status: 'active',
        createdBy: 'test-user-id',
      }

      const mockDocRef = { id: 'new-company-id' }
      const createdCompany = {
        ...mockCompany,
        ...newCompanyData,
        id: 'new-company-id',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      }
      
      vi.mocked(addDoc).mockResolvedValue(mockDocRef as any)
      vi.mocked(getDoc).mockResolvedValue(
        createMockDocSnapshot(createdCompany)
      )
      vi.mocked(collection).mockReturnValue({} as any)

      const result = await createCompany(newCompanyData)

      expect(result).toBeDefined()
      expect(result.name).toBe('Nova Empresa')
      expect(addDoc).toHaveBeenCalled()
      expect(getDoc).toHaveBeenCalled()
    })

    it('deve lançar erro se criação falhar', async () => {
      const { addDoc, getDoc, collection } = await import('firebase/firestore')
      
      const newCompanyData: CreateCompanyData = {
        organizationId: 'test-org-id',
        cnpj: '12345678000100',
        name: 'Nova Empresa',
        address: 'Rua Nova, 123',
        type: 'headquarters',
        status: 'active',
        createdBy: 'test-user-id',
      }

      const mockDocRef = { id: 'new-company-id' }
      vi.mocked(addDoc).mockResolvedValue(mockDocRef as any)
      vi.mocked(getDoc).mockResolvedValue(createMockDocSnapshot(null, false))
      vi.mocked(collection).mockReturnValue({} as any)

      await expect(createCompany(newCompanyData)).rejects.toThrow('Erro ao criar empresa')
    })
  })

  describe('getCompanyById', () => {
    it('deve retornar empresa por ID', async () => {
      const { doc, getDoc } = await import('firebase/firestore')
      
      const fullCompany = {
        ...mockCompany,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      }
      
      vi.mocked(doc).mockReturnValue({} as any)
      vi.mocked(getDoc).mockResolvedValue(createMockDocSnapshot(fullCompany))

      const result = await getCompanyById('test-company-id')

      expect(result).toBeDefined()
      expect(result?.name).toBe('Test Company')
      expect(doc).toHaveBeenCalled()
      expect(getDoc).toHaveBeenCalled()
    })

    it('deve retornar null se empresa não existir', async () => {
      const { doc, getDoc } = await import('firebase/firestore')
      
      vi.mocked(doc).mockReturnValue({} as any)
      vi.mocked(getDoc).mockResolvedValue(createMockDocSnapshot(null, false))

      const result = await getCompanyById('non-existent-id')

      expect(result).toBeNull()
    })
  })

  describe('getCompanyByCNPJ', () => {
    it('deve retornar empresa por CNPJ', async () => {
      const { collection, query, where, limit, getDocs } = await import('firebase/firestore')
      
      const fullCompany = {
        ...mockCompany,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      }
      
      vi.mocked(collection).mockReturnValue({} as any)
      vi.mocked(query).mockReturnValue({} as any)
      vi.mocked(where).mockReturnValue({} as any)
      vi.mocked(limit).mockReturnValue({} as any)
      vi.mocked(getDocs).mockResolvedValue(createMockQuerySnapshot([fullCompany]))

      const result = await getCompanyByCNPJ('12345678000100', 'test-org-id')

      expect(result).toBeDefined()
      expect(result?.cnpj).toBe('12345678000100')
    })

    it('deve retornar null se empresa não for encontrada', async () => {
      const { collection, query, where, limit, getDocs } = await import('firebase/firestore')
      
      vi.mocked(collection).mockReturnValue({} as any)
      vi.mocked(query).mockReturnValue({} as any)
      vi.mocked(where).mockReturnValue({} as any)
      vi.mocked(limit).mockReturnValue({} as any)
      vi.mocked(getDocs).mockResolvedValue(createMockQuerySnapshot([]))

      const result = await getCompanyByCNPJ('99999999999999', 'test-org-id')

      expect(result).toBeNull()
    })
  })

  describe('searchCompaniesByName', () => {
    it('deve buscar empresas por nome (case insensitive)', async () => {
      const { collection, query, where, orderBy, getDocs } = await import('firebase/firestore')
      
      const companies = [
        { ...mockCompany, id: '1', name: 'Test Company', createdAt: new Date(), updatedAt: new Date() },
        { ...mockCompany, id: '2', name: 'Another Test', createdAt: new Date(), updatedAt: new Date() },
        { ...mockCompany, id: '3', name: 'Different Name', createdAt: new Date(), updatedAt: new Date() },
      ]

      vi.mocked(collection).mockReturnValue({} as any)
      vi.mocked(query).mockReturnValue({} as any)
      vi.mocked(where).mockReturnValue({} as any)
      vi.mocked(orderBy).mockReturnValue({} as any)
      vi.mocked(getDocs).mockResolvedValue(createMockQuerySnapshot(companies))

      const result = await searchCompaniesByName('test', 'test-org-id')

      expect(result).toHaveLength(2)
      expect(result[0].name).toContain('Test')
      expect(result[1].name).toContain('Test')
    })

    it('deve retornar array vazio se nenhuma empresa for encontrada', async () => {
      const { collection, query, where, orderBy, getDocs } = await import('firebase/firestore')
      
      vi.mocked(collection).mockReturnValue({} as any)
      vi.mocked(query).mockReturnValue({} as any)
      vi.mocked(where).mockReturnValue({} as any)
      vi.mocked(orderBy).mockReturnValue({} as any)
      vi.mocked(getDocs).mockResolvedValue(createMockQuerySnapshot([]))

      const result = await searchCompaniesByName('nonexistent', 'test-org-id')

      expect(result).toHaveLength(0)
    })
  })

  describe('cnpjExists', () => {
    it('deve retornar true se CNPJ existir', async () => {
      const { collection, query, where, limit, getDocs } = await import('firebase/firestore')
      
      const fullCompany = {
        ...mockCompany,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      }
      
      vi.mocked(collection).mockReturnValue({} as any)
      vi.mocked(query).mockReturnValue({} as any)
      vi.mocked(where).mockReturnValue({} as any)
      vi.mocked(limit).mockReturnValue({} as any)
      vi.mocked(getDocs).mockResolvedValue(createMockQuerySnapshot([fullCompany]))

      const result = await cnpjExists('12345678000100', 'test-org-id')

      expect(result).toBe(true)
    })

    it('deve retornar false se CNPJ não existir', async () => {
      const { collection, query, where, limit, getDocs } = await import('firebase/firestore')
      
      vi.mocked(collection).mockReturnValue({} as any)
      vi.mocked(query).mockReturnValue({} as any)
      vi.mocked(where).mockReturnValue({} as any)
      vi.mocked(limit).mockReturnValue({} as any)
      vi.mocked(getDocs).mockResolvedValue(createMockQuerySnapshot([]))

      const result = await cnpjExists('99999999999999', 'test-org-id')

      expect(result).toBe(false)
    })
  })

  describe('updateCompany', () => {
    it('deve atualizar empresa com sucesso', async () => {
      const { doc, updateDoc, getDoc, Timestamp } = await import('firebase/firestore')
      
      const updates = { name: 'Updated Name', phone: '(11) 9999-9999' }
      const updatedCompany = {
        ...mockCompany,
        ...updates,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      }

      vi.mocked(doc).mockReturnValue({} as any)
      vi.mocked(updateDoc).mockResolvedValue(undefined)
      vi.mocked(getDoc).mockResolvedValue(createMockDocSnapshot(updatedCompany))

      const result = await updateCompany('test-company-id', updates)

      expect(result.name).toBe('Updated Name')
      expect(result.phone).toBe('(11) 9999-9999')
      expect(updateDoc).toHaveBeenCalled()
    })

    it('deve lançar erro se empresa não for encontrada', async () => {
      const { doc, updateDoc, getDoc } = await import('firebase/firestore')
      
      vi.mocked(doc).mockReturnValue({} as any)
      vi.mocked(updateDoc).mockResolvedValue(undefined)
      vi.mocked(getDoc).mockResolvedValue(createMockDocSnapshot(null, false))

      await expect(
        updateCompany('non-existent-id', { name: 'Updated' })
      ).rejects.toThrow('Empresa não encontrada')
    })
  })

  describe('deleteCompany', () => {
    it('deve deletar empresa com sucesso', async () => {
      const { doc, deleteDoc } = await import('firebase/firestore')
      
      vi.mocked(doc).mockReturnValue({} as any)
      vi.mocked(deleteDoc).mockResolvedValue(undefined)

      await expect(deleteCompany('test-company-id')).resolves.not.toThrow()
      expect(deleteDoc).toHaveBeenCalled()
    })
  })

  describe('searchRelatedCompanies', () => {
    it('deve buscar matriz e filiais relacionadas', async () => {
      const { collection, query, where, orderBy, getDocs } = await import('firebase/firestore')
      
      const relatedCompanies = [
        { ...mockCompany, id: '1', cnpj: '12345678000100', type: 'headquarters' as const, createdAt: new Date(), updatedAt: new Date() },
        { ...mockCompany, id: '2', cnpj: '12345678000200', type: 'branch' as const, createdAt: new Date(), updatedAt: new Date() },
        { ...mockCompany, id: '3', cnpj: '12345678000300', type: 'branch' as const, createdAt: new Date(), updatedAt: new Date() },
      ]

      vi.mocked(collection).mockReturnValue({} as any)
      vi.mocked(query).mockReturnValue({} as any)
      vi.mocked(where).mockReturnValue({} as any)
      vi.mocked(orderBy).mockReturnValue({} as any)
      vi.mocked(getDocs).mockResolvedValue(createMockQuerySnapshot(relatedCompanies))

      const result = await searchRelatedCompanies('12345678000100', 'test-org-id')

      expect(result).toHaveLength(3)
      expect(result[0].type).toBe('headquarters')
    })
  })

  describe('Testes integrados', () => {
    it('deve criar, buscar e atualizar empresa', async () => {
      const {
        addDoc,
        getDoc,
        doc,
        updateDoc,
        collection,
      } = await import('firebase/firestore')

      // Criar
      const newCompanyData: CreateCompanyData = {
        organizationId: 'test-org-id',
        cnpj: '12345678000100',
        name: 'Nova Empresa',
        address: 'Rua Nova, 123',
        type: 'headquarters',
        status: 'active',
        createdBy: 'test-user-id',
      }

      const mockDocRef = { id: 'new-company-id' }
      vi.mocked(addDoc).mockResolvedValue(mockDocRef as any)
      vi.mocked(collection).mockReturnValue({} as any)
      
      // Primeiro getDoc (após criar)
      vi.mocked(getDoc).mockResolvedValueOnce(
        createMockDocSnapshot({ ...newCompanyData, id: 'new-company-id' })
      )

      const created = await createCompany(newCompanyData)
      expect(created.name).toBe('Nova Empresa')

      // Buscar
      vi.mocked(doc).mockReturnValue({} as any)
      vi.mocked(getDoc).mockResolvedValueOnce(
        createMockDocSnapshot({ ...newCompanyData, id: 'new-company-id' })
      )

      const found = await getCompanyById('new-company-id')
      expect(found?.id).toBe('new-company-id')

      // Atualizar
      const updatedData = { ...newCompanyData, name: 'Empresa Atualizada' }
      vi.mocked(updateDoc).mockResolvedValue(undefined)
      vi.mocked(getDoc).mockResolvedValueOnce(
        createMockDocSnapshot({ ...updatedData, id: 'new-company-id' })
      )

      const updated = await updateCompany('new-company-id', { name: 'Empresa Atualizada' })
      expect(updated.name).toBe('Empresa Atualizada')
    })
  })
})


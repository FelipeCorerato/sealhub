import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createCampaign,
  getCampaignById,
  searchCampaignsByName,
  getCampaignsByStatus,
  getAllCampaigns,
  updateCampaign,
  deleteCampaign,
  addCompaniesToCampaign,
  getCampaignsByUser,
} from '@/lib/firebase/campaigns'
import type { CreateCampaignData } from '@/types'
import {
  mockCampaign,
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

// Mock do companies.ts ANTES de importar
vi.mock('@/lib/firebase/companies', () => ({
  getCompanyById: vi.fn(),
}))

describe('firebase/campaigns', () => {
  beforeEach(async () => {
    resetAllMocks()
    vi.clearAllMocks()
    
    // Configurar mock do getCompanyById
    const companiesModule = await import('@/lib/firebase/companies')
    vi.mocked(companiesModule.getCompanyById).mockResolvedValue(mockCompany)
  })

  describe('createCampaign', () => {
    it('deve criar uma nova campanha com sucesso', async () => {
      const { addDoc, getDoc, collection } = await import('firebase/firestore')
      
      const newCampaignData: CreateCampaignData = {
        name: 'Nova Campanha',
        sender: 'Remetente Teste',
        observation: 'Observação teste',
        instructions: {
          fragile: true,
          attention: false,
          handleWithCare: true,
          thisWayUp: false,
        },
        organizationId: 'test-org-id',
        companyIds: ['company-1'],
        status: 'draft',
        createdBy: 'test-user-id',
      }

      const mockDocRef = { id: 'new-campaign-id' }
      vi.mocked(addDoc).mockResolvedValue(mockDocRef as any)
      vi.mocked(getDoc).mockResolvedValue(
        createMockDocSnapshot({ ...newCampaignData, id: 'new-campaign-id' })
      )
      vi.mocked(collection).mockReturnValue({} as any)

      const result = await createCampaign(newCampaignData)

      expect(result).toBeDefined()
      expect(result.id).toBe('new-campaign-id')
      expect(result.name).toBe('Nova Campanha')
      expect(addDoc).toHaveBeenCalled()
    })

    it('deve lançar erro se criação falhar', async () => {
      const { addDoc, getDoc, collection } = await import('firebase/firestore')
      
      const newCampaignData: CreateCampaignData = {
        name: 'Nova Campanha',
        sender: 'Remetente Teste',
        observation: 'Observação teste',
        instructions: {
          fragile: false,
          attention: false,
          handleWithCare: false,
          thisWayUp: false,
        },
        organizationId: 'test-org-id',
        companyIds: [],
        status: 'draft',
        createdBy: 'test-user-id',
      }

      const mockDocRef = { id: 'new-campaign-id' }
      vi.mocked(addDoc).mockResolvedValue(mockDocRef as any)
      vi.mocked(getDoc).mockResolvedValue(createMockDocSnapshot(null, false))
      vi.mocked(collection).mockReturnValue({} as any)

      await expect(createCampaign(newCampaignData)).rejects.toThrow('Erro ao criar campanha')
    })
  })

  describe('getCampaignById', () => {
    it('deve retornar campanha por ID', async () => {
      const { doc, getDoc } = await import('firebase/firestore')
      
      vi.mocked(doc).mockReturnValue({} as any)
      vi.mocked(getDoc).mockResolvedValue(createMockDocSnapshot(mockCampaign))

      const result = await getCampaignById('test-campaign-id')

      expect(result).toBeDefined()
      expect(result?.id).toBe('test-campaign-id')
      expect(result?.name).toBe('Test Campaign')
    })

    it('deve retornar null se campanha não existir', async () => {
      const { doc, getDoc } = await import('firebase/firestore')
      
      vi.mocked(doc).mockReturnValue({} as any)
      vi.mocked(getDoc).mockResolvedValue(createMockDocSnapshot(null, false))

      const result = await getCampaignById('non-existent-id')

      expect(result).toBeNull()
    })
  })

  describe('searchCampaignsByName', () => {
    it('deve buscar campanhas por nome (case insensitive)', async () => {
      const { collection, query, where, orderBy, getDocs } = await import('firebase/firestore')
      
      const campaigns = [
        { ...mockCampaign, id: '1', name: 'Campanha Teste' },
        { ...mockCampaign, id: '2', name: 'Outro Teste' },
        { ...mockCampaign, id: '3', name: 'Diferente' },
      ]

      vi.mocked(collection).mockReturnValue({} as any)
      vi.mocked(query).mockReturnValue({} as any)
      vi.mocked(where).mockReturnValue({} as any)
      vi.mocked(orderBy).mockReturnValue({} as any)
      vi.mocked(getDocs).mockResolvedValue(createMockQuerySnapshot(campaigns))

      const result = await searchCampaignsByName('teste', 'test-org-id')

      expect(result).toHaveLength(2)
      expect(result[0].name.toLowerCase()).toContain('teste')
      expect(result[1].name.toLowerCase()).toContain('teste')
    })

    it('deve retornar array vazio se nenhuma campanha for encontrada', async () => {
      const { collection, query, where, orderBy, getDocs } = await import('firebase/firestore')
      
      vi.mocked(collection).mockReturnValue({} as any)
      vi.mocked(query).mockReturnValue({} as any)
      vi.mocked(where).mockReturnValue({} as any)
      vi.mocked(orderBy).mockReturnValue({} as any)
      vi.mocked(getDocs).mockResolvedValue(createMockQuerySnapshot([]))

      const result = await searchCampaignsByName('inexistente', 'test-org-id')

      expect(result).toHaveLength(0)
    })
  })

  describe('getCampaignsByStatus', () => {
    it('deve buscar campanhas por status', async () => {
      const { collection, query, where, orderBy, getDocs } = await import('firebase/firestore')
      
      const activeCampaigns = [
        { ...mockCampaign, id: '1', status: 'active' },
        { ...mockCampaign, id: '2', status: 'active' },
      ]

      vi.mocked(collection).mockReturnValue({} as any)
      vi.mocked(query).mockReturnValue({} as any)
      vi.mocked(where).mockReturnValue({} as any)
      vi.mocked(orderBy).mockReturnValue({} as any)
      vi.mocked(getDocs).mockResolvedValue(createMockQuerySnapshot(activeCampaigns))

      const result = await getCampaignsByStatus('active', 'test-org-id')

      expect(result).toHaveLength(2)
      expect(result[0].status).toBe('active')
      expect(result[1].status).toBe('active')
    })
  })

  describe('getAllCampaigns', () => {
    it('deve retornar todas as campanhas de uma organização', async () => {
      const { collection, query, where, orderBy, getDocs } = await import('firebase/firestore')
      
      const campaigns = [
        { ...mockCampaign, id: '1' },
        { ...mockCampaign, id: '2' },
        { ...mockCampaign, id: '3' },
      ]

      vi.mocked(collection).mockReturnValue({} as any)
      vi.mocked(query).mockReturnValue({} as any)
      vi.mocked(where).mockReturnValue({} as any)
      vi.mocked(orderBy).mockReturnValue({} as any)
      vi.mocked(getDocs).mockResolvedValue(createMockQuerySnapshot(campaigns))

      const result = await getAllCampaigns('test-org-id')

      expect(result).toHaveLength(3)
    })
  })

  describe('updateCampaign', () => {
    it('deve atualizar campanha com sucesso', async () => {
      const { doc, updateDoc, getDoc } = await import('firebase/firestore')
      
      const updates = { name: 'Campanha Atualizada', status: 'completed' as const }
      const updatedCampaign = { ...mockCampaign, ...updates }

      vi.mocked(doc).mockReturnValue({} as any)
      vi.mocked(updateDoc).mockResolvedValue(undefined)
      vi.mocked(getDoc).mockResolvedValue(createMockDocSnapshot(updatedCampaign))

      const result = await updateCampaign('test-campaign-id', updates, 'test-user-id')

      expect(result.name).toBe('Campanha Atualizada')
      expect(result.status).toBe('completed')
      expect(updateDoc).toHaveBeenCalled()
    })

    it('deve lançar erro se campanha não for encontrada', async () => {
      const { doc, updateDoc, getDoc } = await import('firebase/firestore')
      
      vi.mocked(doc).mockReturnValue({} as any)
      vi.mocked(updateDoc).mockResolvedValue(undefined)
      vi.mocked(getDoc).mockResolvedValue(createMockDocSnapshot(null, false))

      await expect(
        updateCampaign('non-existent-id', { name: 'Updated' }, 'test-user-id')
      ).rejects.toThrow('Campanha não encontrada')
    })
  })

  describe('deleteCampaign', () => {
    it('deve deletar campanha com sucesso', async () => {
      const { doc, deleteDoc } = await import('firebase/firestore')
      
      vi.mocked(doc).mockReturnValue({} as any)
      vi.mocked(deleteDoc).mockResolvedValue(undefined)

      await expect(deleteCampaign('test-campaign-id')).resolves.not.toThrow()
      expect(deleteDoc).toHaveBeenCalled()
    })
  })

  describe('addCompaniesToCampaign', () => {
    it('deve adicionar empresas a uma campanha', async () => {
      const { doc, getDoc, updateDoc } = await import('firebase/firestore')
      
      const campaignWithNewCompanies = {
        ...mockCampaign,
        companyIds: ['test-company-id', 'new-company-1', 'new-company-2'],
      }

      vi.mocked(doc).mockReturnValue({} as any)
      vi.mocked(getDoc)
        .mockResolvedValueOnce(createMockDocSnapshot(mockCampaign))
        .mockResolvedValueOnce(createMockDocSnapshot(campaignWithNewCompanies))
      vi.mocked(updateDoc).mockResolvedValue(undefined)

      const result = await addCompaniesToCampaign(
        'test-campaign-id',
        ['new-company-1', 'new-company-2'],
        'test-user-id'
      )

      expect(result.companyIds).toHaveLength(3)
      expect(result.companyIds).toContain('new-company-1')
      expect(result.companyIds).toContain('new-company-2')
    })

    it('deve evitar duplicatas ao adicionar empresas', async () => {
      const { doc, getDoc } = await import('firebase/firestore')
      
      vi.mocked(doc).mockReturnValue({} as any)
      vi.mocked(getDoc).mockResolvedValue(createMockDocSnapshot(mockCampaign))

      await expect(
        addCompaniesToCampaign('test-campaign-id', ['test-company-id'], 'test-user-id')
      ).rejects.toThrow('Todos os clientes selecionados já estão vinculados')
    })
  })

  describe('getCampaignsByUser', () => {
    it('deve buscar campanhas de um usuário específico', async () => {
      const { collection, query, where, orderBy, getDocs } = await import('firebase/firestore')
      
      const userCampaigns = [
        { ...mockCampaign, id: '1', createdBy: 'test-user-id' },
        { ...mockCampaign, id: '2', createdBy: 'test-user-id' },
      ]

      vi.mocked(collection).mockReturnValue({} as any)
      vi.mocked(query).mockReturnValue({} as any)
      vi.mocked(where).mockReturnValue({} as any)
      vi.mocked(orderBy).mockReturnValue({} as any)
      vi.mocked(getDocs).mockResolvedValue(createMockQuerySnapshot(userCampaigns))

      const result = await getCampaignsByUser('test-user-id', 'test-org-id')

      expect(result).toHaveLength(2)
      expect(result[0].createdBy).toBe('test-user-id')
      expect(result[1].createdBy).toBe('test-user-id')
    })
  })

  describe('Testes integrados', () => {
    it('deve criar, buscar e atualizar campanha', async () => {
      const { addDoc, getDoc, doc, updateDoc, collection } = await import('firebase/firestore')

      // Criar
      const newCampaignData: CreateCampaignData = {
        name: 'Campanha Integrada',
        sender: 'Remetente',
        observation: 'Obs',
        instructions: {
          fragile: true,
          attention: false,
          handleWithCare: false,
          thisWayUp: false,
        },
        organizationId: 'test-org-id',
        companyIds: [],
        status: 'draft',
        createdBy: 'test-user-id',
      }

      const mockDocRef = { id: 'new-campaign-id' }
      vi.mocked(addDoc).mockResolvedValue(mockDocRef as any)
      vi.mocked(collection).mockReturnValue({} as any)
      vi.mocked(getDoc).mockResolvedValueOnce(
        createMockDocSnapshot({ ...newCampaignData, id: 'new-campaign-id' })
      )

      const created = await createCampaign(newCampaignData)
      expect(created.name).toBe('Campanha Integrada')

      // Buscar
      vi.mocked(doc).mockReturnValue({} as any)
      vi.mocked(getDoc).mockResolvedValueOnce(
        createMockDocSnapshot({ ...newCampaignData, id: 'new-campaign-id' })
      )

      const found = await getCampaignById('new-campaign-id')
      expect(found?.id).toBe('new-campaign-id')

      // Atualizar
      const updatedData = { ...newCampaignData, name: 'Campanha Atualizada', status: 'active' as const }
      vi.mocked(updateDoc).mockResolvedValue(undefined)
      vi.mocked(getDoc).mockResolvedValueOnce(
        createMockDocSnapshot({ ...updatedData, id: 'new-campaign-id' })
      )

      const updated = await updateCampaign('new-campaign-id', { name: 'Campanha Atualizada', status: 'active' }, 'test-user-id')
      expect(updated.name).toBe('Campanha Atualizada')
      expect(updated.status).toBe('active')
    })
  })
})


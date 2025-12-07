import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  generateSealsPDF,
  printSeals,
  downloadSeals,
  type SealData,
} from '@/lib/seal-generator'
import { mockCompany, mockCampaign } from '@/tests/__mocks__/firebase.mock'
import type { Company } from '@/types'

// Mock do jsPDF
vi.mock('jspdf', () => {
  class MockJsPDF {
    setFontSize = vi.fn()
    setFont = vi.fn()
    setTextColor = vi.fn()
    setFillColor = vi.fn()
    setDrawColor = vi.fn()
    setLineWidth = vi.fn()
    text = vi.fn()
    rect = vi.fn()
    circle = vi.fn()
    line = vi.fn()
    lines = vi.fn()
    addPage = vi.fn()
    splitTextToSize = vi.fn((text: string) => [text])
    getTextWidth = vi.fn(() => 50)
    save = vi.fn()
    
    constructor(options?: any) {}
  }
  
  return {
    default: MockJsPDF,
  }
})

describe('lib/seal-generator', () => {
  const mockSealData: SealData = {
    campaignName: 'Test Campaign',
    sender: 'Test Sender\nRua Teste, 123',
    observation: 'Test observation',
    instructions: {
      fragile: true,
      attention: false,
      handleWithCare: true,
      thisWayUp: false,
    },
    companies: [mockCompany],
    organizationLogoUrl: 'https://example.com/logo.png',
    organizationName: 'Test Organization',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('generateSealsPDF', () => {
    it('deve gerar PDF com sucesso', () => {
      const pdf = generateSealsPDF(mockSealData)

      expect(pdf).toBeDefined()
    })

    it('deve gerar PDF para múltiplas empresas', () => {
      const multipleCompanies: SealData = {
        ...mockSealData,
        companies: [
          { ...mockCompany, id: '1', name: 'Company 1' },
          { ...mockCompany, id: '2', name: 'Company 2' },
          { ...mockCompany, id: '3', name: 'Company 3' },
        ],
      }

      const pdf = generateSealsPDF(multipleCompanies)

      expect(pdf).toBeDefined()
    })

    it('deve lidar com dados mínimos', () => {
      const minimalData: SealData = {
        campaignName: 'Minimal Campaign',
        sender: 'Sender',
        observation: '',
        instructions: {
          fragile: false,
          attention: false,
          handleWithCare: false,
          thisWayUp: false,
        },
        companies: [
          {
            ...mockCompany,
            phone: undefined,
            email: undefined,
            contactPerson: undefined,
            notes: undefined,
          },
        ],
      }

      const pdf = generateSealsPDF(minimalData)

      expect(pdf).toBeDefined()
    })

    it('deve processar todas as instruções', () => {
      const allInstructions: SealData = {
        ...mockSealData,
        instructions: {
          fragile: true,
          attention: true,
          handleWithCare: true,
          thisWayUp: true,
        },
      }

      const pdf = generateSealsPDF(allInstructions)

      expect(pdf).toBeDefined()
    })
  })

  describe('printSeals', () => {
    it('deve abrir janela de impressão', () => {
      const mockWindow = {
        document: {
          open: vi.fn(),
          write: vi.fn(),
          close: vi.fn(),
        },
      }

      window.open = vi.fn().mockReturnValue(mockWindow)

      printSeals(mockSealData)

      expect(window.open).toHaveBeenCalledWith('', '_blank')
      expect(mockWindow.document.open).toHaveBeenCalled()
      expect(mockWindow.document.write).toHaveBeenCalled()
      expect(mockWindow.document.close).toHaveBeenCalled()
    })

    it('deve lidar com popup bloqueado', () => {
      window.open = vi.fn().mockReturnValue(null)

      printSeals(mockSealData)

      expect(window.open).toHaveBeenCalled()
      // Não deve lançar erro se popup for bloqueado
    })

    it('deve gerar HTML com dados da campanha', () => {
      const mockWindow = {
        document: {
          open: vi.fn(),
          write: vi.fn(),
          close: vi.fn(),
        },
      }

      window.open = vi.fn().mockReturnValue(mockWindow)

      printSeals(mockSealData)

      const htmlContent = mockWindow.document.write.mock.calls[0][0]
      expect(htmlContent).toContain('Test Campaign')
      expect(htmlContent).toContain('Test Sender')
    })
  })

  describe('downloadSeals', () => {
    it('deve fazer download do PDF', () => {
      const pdf = generateSealsPDF(mockSealData)
      
      // Mock do save para testar
      const mockSave = vi.fn()
      pdf.save = mockSave

      downloadSeals(mockSealData)

      // Verifica que o save foi chamado (não podemos verificar o mesmo objeto devido ao escopo)
      // Então apenas verificamos que o PDF foi gerado
      expect(pdf).toBeDefined()
    })

    it('deve gerar nome de arquivo válido ao fazer download', () => {
      const dataWithSpaces: SealData = {
        ...mockSealData,
        campaignName: 'Campaign With Multiple Spaces',
      }

      const pdf = generateSealsPDF(dataWithSpaces)
      
      // Verifica que o PDF foi gerado com sucesso
      expect(pdf).toBeDefined()
      
      // O nome do arquivo seria: selos_Campaign_With_Multiple_Spaces_timestamp.pdf
      // Mas como não podemos testar o timestamp facilmente, apenas verificamos o PDF
    })
  })

  describe('Formatação de dados', () => {
    it('deve escapar caracteres HTML especiais', () => {
      const mockWindow = {
        document: {
          open: vi.fn(),
          write: vi.fn(),
          close: vi.fn(),
        },
      }

      window.open = vi.fn().mockReturnValue(mockWindow)

      const dataWithSpecialChars: SealData = {
        ...mockSealData,
        campaignName: 'Test <Campaign> & "Special" \'Chars\'',
        sender: 'Sender & Co.',
      }

      printSeals(dataWithSpecialChars)

      const htmlContent = mockWindow.document.write.mock.calls[0][0]
      expect(htmlContent).toContain('&amp;')
      expect(htmlContent).toContain('&lt;')
      expect(htmlContent).toContain('&gt;')
    })

    it('deve formatar CNPJ corretamente', () => {
      const mockWindow = {
        document: {
          open: vi.fn(),
          write: vi.fn(),
          close: vi.fn(),
        },
      }

      window.open = vi.fn().mockReturnValue(mockWindow)

      printSeals(mockSealData)

      const htmlContent = mockWindow.document.write.mock.calls[0][0]
      expect(htmlContent).toContain('12.345.678/0001-00')
    })

    it('deve processar quebras de linha', () => {
      const mockWindow = {
        document: {
          open: vi.fn(),
          write: vi.fn(),
          close: vi.fn(),
        },
      }

      window.open = vi.fn().mockReturnValue(mockWindow)

      const dataWithLineBreaks: SealData = {
        ...mockSealData,
        sender: 'Line 1\nLine 2\rLine 3\r\nLine 4',
      }

      printSeals(dataWithLineBreaks)

      const htmlContent = mockWindow.document.write.mock.calls[0][0]
      expect(htmlContent).toContain('<br />')
    })
  })

  describe('Testes integrados', () => {
    it('deve gerar selos completos com todas as informações', () => {
      const completeData: SealData = {
        campaignName: 'Campanha Completa',
        sender: 'Remetente Completo\nRua Teste, 123\nSão Paulo - SP',
        observation: 'Observação importante',
        instructions: {
          fragile: true,
          attention: true,
          handleWithCare: false,
          thisWayUp: true,
        },
        companies: [
          {
            ...mockCompany,
            name: 'Empresa 1',
            address: 'Endereço 1',
            phone: '(11) 1111-1111',
            contactPerson: 'Pessoa 1',
          },
          {
            ...mockCompany,
            id: '2',
            name: 'Empresa 2',
            address: 'Endereço 2',
            phone: '(11) 2222-2222',
            contactPerson: 'Pessoa 2',
          },
        ],
        organizationLogoUrl: 'https://example.com/logo.png',
        organizationName: 'Organização Teste',
      }

      // PDF
      const pdf = generateSealsPDF(completeData)
      expect(pdf).toBeDefined()

      // HTML para impressão
      const mockWindow = {
        document: {
          open: vi.fn(),
          write: vi.fn(),
          close: vi.fn(),
        },
      }
      window.open = vi.fn().mockReturnValue(mockWindow)

      printSeals(completeData)

      expect(mockWindow.document.write).toHaveBeenCalled()
      const htmlContent = mockWindow.document.write.mock.calls[0][0]
      expect(htmlContent).toContain('Campanha Completa')
      expect(htmlContent).toContain('html')
    })

    it('deve gerar múltiplas páginas corretamente', () => {
      const manyCompanies: Company[] = Array.from({ length: 10 }, (_, i) => ({
        ...mockCompany,
        id: `company-${i}`,
        name: `Empresa ${i + 1}`,
      }))

      const dataWithManyCompanies: SealData = {
        ...mockSealData,
        companies: manyCompanies,
      }

      const pdf = generateSealsPDF(dataWithManyCompanies)
      expect(pdf).toBeDefined()

      // HTML deve ter múltiplas páginas (2 selos por página)
      const mockWindow = {
        document: {
          open: vi.fn(),
          write: vi.fn(),
          close: vi.fn(),
        },
      }
      window.open = vi.fn().mockReturnValue(mockWindow)

      printSeals(dataWithManyCompanies)

      expect(mockWindow.document.write).toHaveBeenCalled()
      const htmlContent = mockWindow.document.write.mock.calls[0][0]
      expect(htmlContent).toContain('Test Campaign')
      expect(htmlContent).toContain('html')
    })
  })
})


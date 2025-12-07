import { describe, it, expect } from 'vitest'
import {
  onlyNumbers,
  formatCNPJ,
  validateCNPJ,
  getRemainingDigits,
  getCNPJBase,
  getCNPJBranch,
  isHeadquarters,
  getHeadquartersCNPJ,
} from '@/lib/cnpj'

describe('lib/cnpj', () => {
  describe('onlyNumbers', () => {
    it('deve remover todos os caracteres não numéricos', () => {
      expect(onlyNumbers('12.345.678/0001-00')).toBe('12345678000100')
      expect(onlyNumbers('12345678000100')).toBe('12345678000100')
      expect(onlyNumbers('abc123def456')).toBe('123456')
      expect(onlyNumbers('')).toBe('')
    })

    it('deve preservar apenas números', () => {
      expect(onlyNumbers('!@#$%123^&*()')).toBe('123')
      expect(onlyNumbers('(11) 1234-5678')).toBe('1112345678')
    })
  })

  describe('formatCNPJ', () => {
    it('deve formatar CNPJ completo corretamente', () => {
      expect(formatCNPJ('12345678000100')).toBe('12.345.678/0001-00')
    })

    it('deve formatar CNPJ parcial progressivamente', () => {
      expect(formatCNPJ('12')).toBe('12')
      expect(formatCNPJ('123')).toBe('12.3')
      expect(formatCNPJ('12345')).toBe('12.345')
      expect(formatCNPJ('12345678')).toBe('12.345.678')
      expect(formatCNPJ('1234567800')).toBe('12.345.678/00')
      expect(formatCNPJ('123456780001')).toBe('12.345.678/0001')
    })

    it('deve manter formatação de CNPJ já formatado', () => {
      expect(formatCNPJ('12.345.678/0001-00')).toBe('12.345.678/0001-00')
    })

    it('deve lidar com string vazia', () => {
      expect(formatCNPJ('')).toBe('')
    })
  })

  describe('validateCNPJ', () => {
    it('deve validar CNPJ com 14 dígitos', () => {
      expect(validateCNPJ('12345678000100')).toBe(true)
      expect(validateCNPJ('12.345.678/0001-00')).toBe(true)
    })

    it('deve rejeitar CNPJ com quantidade incorreta de dígitos', () => {
      expect(validateCNPJ('123456780001')).toBe(false) // 12 dígitos
      expect(validateCNPJ('1234567800010')).toBe(false) // 13 dígitos
      expect(validateCNPJ('123456780001000')).toBe(false) // 15 dígitos
      expect(validateCNPJ('')).toBe(false)
    })
  })

  describe('getRemainingDigits', () => {
    it('deve calcular dígitos restantes corretamente', () => {
      expect(getRemainingDigits('')).toBe(14)
      expect(getRemainingDigits('12')).toBe(12)
      expect(getRemainingDigits('12345678')).toBe(6)
      expect(getRemainingDigits('1234567800')).toBe(4)
      expect(getRemainingDigits('12345678000100')).toBe(0)
    })

    it('deve retornar 0 para CNPJ completo ou maior', () => {
      expect(getRemainingDigits('12345678000100')).toBe(0)
      expect(getRemainingDigits('123456780001000000')).toBe(0)
    })
  })

  describe('getCNPJBase', () => {
    it('deve extrair os 8 primeiros dígitos', () => {
      expect(getCNPJBase('12345678000100')).toBe('12345678')
      expect(getCNPJBase('12.345.678/0001-00')).toBe('12345678')
      expect(getCNPJBase('12.345.678/0005-00')).toBe('12345678')
    })

    it('deve funcionar com CNPJ parcial', () => {
      expect(getCNPJBase('123456')).toBe('123456')
      expect(getCNPJBase('1234567890')).toBe('12345678')
    })
  })

  describe('getCNPJBranch', () => {
    it('deve extrair o número da filial (4 dígitos após posição 8)', () => {
      expect(getCNPJBranch('12345678000100')).toBe('0001')
      expect(getCNPJBranch('12.345.678/0001-00')).toBe('0001')
      expect(getCNPJBranch('12.345.678/0005-00')).toBe('0005')
      expect(getCNPJBranch('12.345.678/0042-00')).toBe('0042')
    })

    it('deve retornar string vazia se não houver dígitos suficientes', () => {
      expect(getCNPJBranch('12345678')).toBe('')
      expect(getCNPJBranch('123456780')).toBe('0')
    })
  })

  describe('isHeadquarters', () => {
    it('deve identificar matriz (filial 0001)', () => {
      expect(isHeadquarters('12345678000100')).toBe(true)
      expect(isHeadquarters('12.345.678/0001-00')).toBe(true)
    })

    it('deve identificar que não é matriz', () => {
      expect(isHeadquarters('12345678000200')).toBe(false)
      expect(isHeadquarters('12.345.678/0005-00')).toBe(false)
      expect(isHeadquarters('12.345.678/0042-00')).toBe(false)
    })
  })

  describe('getHeadquartersCNPJ', () => {
    it('deve gerar CNPJ da matriz a partir de qualquer filial', () => {
      expect(getHeadquartersCNPJ('12345678000500')).toBe('12345678000100')
      expect(getHeadquartersCNPJ('12.345.678/0005-00')).toBe('12345678000100')
      expect(getHeadquartersCNPJ('12.345.678/0042-12')).toBe('12345678000112')
    })

    it('deve manter CNPJ da matriz inalterado', () => {
      expect(getHeadquartersCNPJ('12345678000100')).toBe('12345678000100')
      expect(getHeadquartersCNPJ('12.345.678/0001-00')).toBe('12345678000100')
    })

    it('deve preservar os dígitos verificadores', () => {
      expect(getHeadquartersCNPJ('12345678000599')).toBe('12345678000199')
      expect(getHeadquartersCNPJ('12345678004212')).toBe('12345678000112')
    })
  })

  describe('Testes integrados - Cenários reais', () => {
    it('deve processar CNPJ completo de matriz', () => {
      const cnpj = '12.345.678/0001-00'
      
      expect(validateCNPJ(cnpj)).toBe(true)
      expect(isHeadquarters(cnpj)).toBe(true)
      expect(getCNPJBase(cnpj)).toBe('12345678')
      expect(getCNPJBranch(cnpj)).toBe('0001')
      expect(formatCNPJ(cnpj)).toBe('12.345.678/0001-00')
    })

    it('deve processar CNPJ completo de filial', () => {
      const cnpj = '12.345.678/0005-00'
      
      expect(validateCNPJ(cnpj)).toBe(true)
      expect(isHeadquarters(cnpj)).toBe(false)
      expect(getCNPJBase(cnpj)).toBe('12345678')
      expect(getCNPJBranch(cnpj)).toBe('0005')
      expect(getHeadquartersCNPJ(cnpj)).toBe('12345678000100')
    })

    it('deve processar entrada progressiva do usuário', () => {
      const entrada = '1234567800'
      
      expect(validateCNPJ(entrada)).toBe(false)
      expect(getRemainingDigits(entrada)).toBe(4)
      expect(formatCNPJ(entrada)).toBe('12.345.678/00')
    })
  })
})


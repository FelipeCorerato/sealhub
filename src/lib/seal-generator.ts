import jsPDF from 'jspdf'
import type { Company, CampaignInstructions } from '@/types'
import { formatCNPJ } from './cnpj'

export interface SealData {
  campaignName: string
  sender: string
  observation: string
  instructions: CampaignInstructions
  companies: Company[]
}

// Função para adicionar texto com quebra de linha automática
function addMultilineText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  fontSize: number = 10,
  align: 'left' | 'center' | 'right' = 'left'
): number {
  doc.setFontSize(fontSize)
  const lines = doc.splitTextToSize(text, maxWidth) as string[]
  
  lines.forEach((line: string, index: number) => {
    const lineY = y + (index * fontSize * 0.4)
    
    if (align === 'center') {
      const textWidth = doc.getTextWidth(line)
      doc.text(line, x + (maxWidth - textWidth) / 2, lineY)
    } else if (align === 'right') {
      const textWidth = doc.getTextWidth(line)
      doc.text(line, x + maxWidth - textWidth, lineY)
    } else {
      doc.text(line, x, lineY)
    }
  })
  
  return y + (lines.length * fontSize * 0.4)
}

// Função para desenhar um triângulo
function drawTriangle(
  doc: jsPDF,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number,
  style: 'S' | 'F' = 'S'
) {
  doc.lines([[x2 - x1, y2 - y1], [x3 - x2, y3 - y2], [x1 - x3, y1 - y3]], x1, y1, [1, 1], style)
}

// Função para desenhar um ícone de instrução
function drawInstructionIcon(
  doc: jsPDF,
  x: number,
  y: number,
  type: 'fragile' | 'attention' | 'handleWithCare' | 'thisWayUp'
) {
  const size = 12
  
  doc.setDrawColor(220, 123, 53) // Cor laranja
  doc.setLineWidth(0.5)
  
  switch (type) {
    case 'fragile':
      // Desenha um círculo (símbolo frágil)
      doc.setDrawColor(220, 123, 53)
      doc.setFillColor(255, 255, 255)
      doc.circle(x + size / 2, y + size / 2, size / 2, 'FD')
      doc.setFontSize(10)
      doc.setTextColor(220, 123, 53)
      doc.setFont('helvetica', 'bold')
      doc.text('!', x + size / 2 - 1.2, y + size / 2 + 3)
      break
      
    case 'attention':
      // Triângulo de atenção
      doc.setFillColor(220, 123, 53)
      drawTriangle(doc, x + size / 2, y, x, y + size, x + size, y + size, 'S')
      doc.setFontSize(8)
      doc.setTextColor(255, 255, 255)
      doc.text('!', x + size / 2 - 1, y + size - 2)
      break
      
    case 'handleWithCare':
      // Quadrado com símbolo
      doc.rect(x, y, size, size, 'S')
      doc.setFontSize(8)
      doc.setTextColor(220, 123, 53)
      doc.text('✋', x + 2, y + size - 2)
      break
      
    case 'thisWayUp':
      // Seta para cima (triângulo preenchido)
      doc.setFillColor(220, 123, 53)
      drawTriangle(doc, x + size / 2, y, x, y + size, x + size, y + size, 'F')
      break
  }
}

// Gera um selo individual
function generateSeal(
  doc: jsPDF,
  company: Company,
  sealData: SealData,
  pageNumber: number,
  totalPages: number
) {
  // Configurações de página
  const pageWidth = 210 // A4 width em mm
  const pageHeight = 297 // A4 height em mm
  const margin = 15
  const contentWidth = pageWidth - (margin * 2)
  
  // Adiciona uma nova página se não for a primeira
  if (pageNumber > 1) {
    doc.addPage()
  }
  
  let currentY = margin
  
  // ===== CABEÇALHO =====
  doc.setFillColor(220, 123, 53) // Cor laranja
  doc.rect(0, 0, pageWidth, 20, 'F')
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('SELO DE ENVIO', pageWidth / 2, 13, { align: 'center' })
  
  currentY = 30
  
  // ===== INFORMAÇÕES DA CAMPANHA =====
  doc.setFillColor(245, 245, 245)
  doc.rect(margin, currentY, contentWidth, 30, 'F')
  
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Campanha:', margin + 5, currentY + 8)
  doc.setFont('helvetica', 'normal')
  currentY = addMultilineText(
    doc,
    sealData.campaignName,
    margin + 30,
    currentY + 8,
    contentWidth - 35,
    10
  )
  
  currentY += 8
  
  // ===== DESTINATÁRIO =====
  currentY += 10
  doc.setFillColor(220, 123, 53)
  doc.rect(margin, currentY, contentWidth, 8, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('DESTINATÁRIO', margin + 5, currentY + 6)
  
  currentY += 15
  
  // Nome da empresa
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  currentY = addMultilineText(
    doc,
    company.name,
    margin + 5,
    currentY,
    contentWidth - 10,
    14
  )
  
  currentY += 8
  
  // CNPJ
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`CNPJ: ${formatCNPJ(company.cnpj)}`, margin + 5, currentY)
  
  currentY += 8
  
  // Endereço
  doc.setFontSize(11)
  currentY = addMultilineText(
    doc,
    company.address,
    margin + 5,
    currentY,
    contentWidth - 10,
    11
  )
  
  currentY += 10
  
  // Informações de contato (se disponível)
  if (company.phone || company.contactPerson) {
    if (company.contactPerson) {
      doc.setFontSize(10)
      doc.text(`A/C: ${company.contactPerson}`, margin + 5, currentY)
      currentY += 6
    }
    if (company.phone) {
      doc.text(`Tel: ${company.phone}`, margin + 5, currentY)
      currentY += 6
    }
  }
  
  currentY += 5
  
  // ===== REMETENTE =====
  doc.setFillColor(220, 123, 53)
  doc.rect(margin, currentY, contentWidth, 8, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('REMETENTE', margin + 5, currentY + 6)
  
  currentY += 15
  
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  currentY = addMultilineText(
    doc,
    sealData.sender,
    margin + 5,
    currentY,
    contentWidth - 10,
    11
  )
  
  currentY += 10
  
  // ===== OBSERVAÇÕES =====
  if (sealData.observation) {
    doc.setFillColor(245, 245, 245)
    doc.rect(margin, currentY, contentWidth, 25, 'F')
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('Observação:', margin + 5, currentY + 8)
    doc.setFont('helvetica', 'normal')
    currentY = addMultilineText(
      doc,
      sealData.observation,
      margin + 5,
      currentY + 14,
      contentWidth - 10,
      10
    )
    
    currentY += 10
  }
  
  currentY += 10
  
  // ===== INSTRUÇÕES DE MANUSEIO =====
  const activeInstructions = Object.entries(sealData.instructions)
    .filter(([_, value]) => value)
  
  if (activeInstructions.length > 0) {
    doc.setFillColor(255, 245, 230)
    doc.setDrawColor(220, 123, 53)
    doc.setLineWidth(1)
    doc.rect(margin, currentY, contentWidth, 35, 'FD')
    
    doc.setTextColor(220, 123, 53)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('INSTRUÇÕES DE MANUSEIO', margin + 5, currentY + 8)
    
    currentY += 15
    
    const instructionLabels: Record<string, string> = {
      fragile: 'FRÁGIL',
      attention: 'ATENÇÃO',
      handleWithCare: 'MANUSEAR COM CUIDADO',
      thisWayUp: 'ESTE LADO PARA CIMA',
    }
    
    let iconX = margin + 10
    activeInstructions.forEach(([key]) => {
      drawInstructionIcon(doc, iconX, currentY - 5, key as any)
      
      doc.setFontSize(8)
      doc.setTextColor(0, 0, 0)
      doc.setFont('helvetica', 'bold')
      const label = instructionLabels[key]
      const labelWidth = doc.getTextWidth(label)
      doc.text(label, iconX + 6 - labelWidth / 2, currentY + 12)
      
      iconX += 45
    })
  }
  
  // ===== RODAPÉ =====
  doc.setFontSize(8)
  doc.setTextColor(128, 128, 128)
  doc.setFont('helvetica', 'normal')
  doc.text(
    `Selo ${pageNumber} de ${totalPages} | ${new Date().toLocaleDateString('pt-BR')}`,
    pageWidth / 2,
    pageHeight - 10,
    { align: 'center' }
  )
  
  // Linha decorativa no rodapé
  doc.setDrawColor(220, 123, 53)
  doc.setLineWidth(0.5)
  doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15)
}

// Função principal para gerar o PDF com todos os selos
export function generateSealsPDF(sealData: SealData): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })
  
  sealData.companies.forEach((company, index) => {
    generateSeal(
      doc,
      company,
      sealData,
      index + 1,
      sealData.companies.length
    )
  })
  
  return doc
}

// Função para abrir o PDF na janela de impressão
export function printSeals(sealData: SealData): void {
  const doc = generateSealsPDF(sealData)
  
  // Abre o PDF em uma nova aba/janela e tenta acionar a impressão
  const pdfBlob = doc.output('blob')
  const pdfUrl = URL.createObjectURL(pdfBlob)
  
  const printWindow = window.open(pdfUrl, '_blank')
  
  if (printWindow) {
    printWindow.onload = function() {
      // Aguarda o carregamento completo e então aciona a impressão
      setTimeout(() => {
        printWindow.print()
      }, 250)
    }
  }
}

// Função para baixar o PDF
export function downloadSeals(sealData: SealData): void {
  const doc = generateSealsPDF(sealData)
  const fileName = `selos_${sealData.campaignName.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`
  doc.save(fileName)
}


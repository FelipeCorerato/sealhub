import jsPDF from 'jspdf'
import type { Company, CampaignInstructions } from '@/types'
import { formatCNPJ } from './cnpj'
import fragileIcon from '@/assets/fagile.png'
import attentionIcon from '@/assets/attention.png'
import beCarefulIcon from '@/assets/be-careful.png'
import thisSideUpIcon from '@/assets/this-side-goes-up.png'
import defaultLogo from '@/assets/iasa.png'

export interface SealData {
  campaignName: string
  sender: string
  observation: string
  instructions: CampaignInstructions
  companies: Company[]
  organizationLogoUrl?: string
  organizationName?: string
}

function escapeHtml(value?: string): string {
  if (!value) return ''
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function formatMultiline(value?: string): string {
  return escapeHtml(value)
    .replace(/\r\n/g, '<br />')
    .replace(/\n/g, '<br />')
}

function formatAddress(value?: string): string {
  if (!value) return ''
  const prepared = value.replace(/, /g, ',\n')
  return formatMultiline(prepared)
}

interface InstructionDefinition {
  key: keyof CampaignInstructions
  symbol: string
}

const instructionDefinitions: InstructionDefinition[] = [
  { key: 'fragile', symbol: 'F' },
  { key: 'thisWayUp', symbol: 'E' },
  { key: 'handleWithCare', symbol: 'M' },
  { key: 'attention', symbol: 'A' },
]

const instructionImages: Record<keyof CampaignInstructions, string> = {
  fragile: fragileIcon,
  thisWayUp: thisSideUpIcon,
  handleWithCare: beCarefulIcon,
  attention: attentionIcon,
}

const instructionTextLabels: Record<keyof CampaignInstructions, string> = {
  fragile: 'FRÁGIL',
  thisWayUp: 'ESTE LADO PARA CIMA',
  handleWithCare: 'MANUSEAR COM CUIDADO',
  attention: 'ATENÇÃO',
}

function buildInstructionSquare(instructions: CampaignInstructions): string {
  const active = instructionDefinitions.filter(({ key }) => instructions[key])

  if (active.length === 0) {
    return ''
  }

  const items = active
    .map(({ key, symbol }) => {
      const imgSrc = instructionImages[key]
      if (imgSrc) {
        return `<div class="instruction-icon"><img src="${imgSrc}" alt="${instructionTextLabels[key]}" class="instruction-image" /></div>`
      }

      return `<div class="instruction-icon"><span class="instruction-letter">${symbol}</span></div>`
    })
    .join('')

  return `
    <div class="instruction-square">
      <div class="instruction-square-title">CUIDADO</div>
      <div class="instruction-grid">${items}</div>
      <div class="instruction-square-footer">FRÁGIL</div>
    </div>
  `
}

function buildLogoBox(logoUrl?: string): string {
  const src = logoUrl ? escapeHtml(logoUrl) : defaultLogo
  console.log({ src })
  return `<div class="logo-box"><img src="${defaultLogo}" alt="Logo" /></div>`
}

function buildObservation(observation?: string, contactPerson?: string): string {
  const text = observation || (contactPerson ? `A/C ${contactPerson}` : '')

  if (!text) {
    return ''
  }

  return `<div class="observation">${escapeHtml(text).toUpperCase()}</div>`
}

function buildLabel(company: Company, index: number, sealData: SealData): string {
  const senderHtml = formatMultiline(sealData.sender)
  const storeCode = `LOJA ${String(index + 1).padStart(3, '0')}`
  const stripText = `${storeCode} | ${escapeHtml(company.name).toUpperCase()}`
  const addressHtml = formatAddress(company.address)
  const contactLines = [
    company.contactPerson ? `<div class="contact-line">A/C ${escapeHtml(company.contactPerson)}</div>` : '',
    company.phone ? `<div class="contact-line">TEL: ${escapeHtml(company.phone)}</div>` : '',
  ]
    .filter(Boolean)
    .join('')

  const instructionSquare = buildInstructionSquare(sealData.instructions)

  return `
    <div class="label">
      <div class="label-inner">
        <div class="label-header">
          ${buildLogoBox(sealData.organizationLogoUrl)}
          <div class="sender-box">
            <div class="sender-title">DE:</div>
            <div class="sender-text">${senderHtml}</div>
          </div>
        </div>

        <div class="strip">${stripText}</div>

        <div class="section">
          <div class="section-title">CONTEÚDO</div>
          <div class="campaign-title">${escapeHtml(sealData.campaignName)}</div>
        </div>

        ${buildObservation(sealData.observation, company.contactPerson)}

        ${
          instructionSquare
            ? `
              <div class="instruction-panel">
                ${instructionSquare}
                <div class="delivery-card">
                  <div class="section-title">ENDEREÇO DE ENTREGA</div>
                  <div class="delivery-address">
                    ${addressHtml}
                    <div class="cnpj-line">CNPJ: ${formatCNPJ(company.cnpj)}</div>
                    ${contactLines}
                  </div>
                </div>
              </div>
            `
            : `
              <div class="delivery-card no-instructions">
                <div class="section-title">ENDEREÇO DE ENTREGA</div>
                <div class="delivery-address">
                  ${addressHtml}
                  <div class="cnpj-line">CNPJ: ${formatCNPJ(company.cnpj)}</div>
                  ${contactLines}
                </div>
              </div>
            `
        }
      </div>
    </div>
  `
}

function generateSealsHtml(sealData: SealData): string {
  const labels = sealData.companies.map((company, index) => buildLabel(company, index, sealData))
  const pages: string[] = []

  for (let i = 0; i < labels.length; i += 2) {
    const pageLabels = labels.slice(i, i + 2)
    pages.push(`<section class="page">${pageLabels.join('')}</section>`)
  }

  const title = escapeHtml(sealData.campaignName)

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="utf-8" />
        <title>Selos - ${title}</title>
        <style>
          * {
            box-sizing: border-box;
          }
          html, body {
            margin: 0;
            padding: 0;
            background: #f6f2ea;
            font-family: 'Helvetica Neue', Arial, sans-serif;
            color: #111;
          }
          @page {
            size: A4 landscape;
            margin: 0;
          }
          @media print {
            * {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
          body {
            padding: 0;
            background: #fff;
            width: 100%;
            height: 100%;
          }
          .page {
            width: 297mm;
            height: 210mm;
            margin: 0 auto;
            padding: 0;
            display: flex;
            gap: 0;
            page-break-after: always;
          }
          .page:last-of-type {
            page-break-after: auto;
          }
          .label {
            width: 50%;
            border: 1.4px solid #111;
            border-radius: 0;
            padding: 0;
            background: #fff;
            display: flex;
            height: 210mm;
          }
          .label + .label {
            border-left: none;
          }
          .label-inner {
            padding: 10mm 12mm;
            display: flex;
            flex-direction: column;
            justify-content: center;
            gap: 9mm;
            width: 100%;
            font-size: 14px;
          }
          .label-header {
            display: flex;
            gap: 8mm;
            justify-content: space-between;
            align-items: center;
            padding-bottom: 3mm;
            border-bottom: 1.2px solid #111;
          }
          .logo-container {
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .logo-box {
            width: 42mm;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2mm;
          }
          .logo-box img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
          }
          .logo-divider {
            width: 1px;
            height: 36px;
            background: #111;
            border-radius: 9999px;
          }
          .sender-box {
            flex: 1;
            padding: 0;
            text-transform: uppercase;
            font-size: 15px;
            line-height: 1.4;
          }
          .sender-title {
            font-weight: 700;
            letter-spacing: 0.08em;
            margin-bottom: 1mm;
          }
          .strip {
            background: #111;
            color: #fff;
            font-size: 14px;
            letter-spacing: 0.08em;
            font-weight: 700;
            padding: 2mm 3mm;
            border-radius: 4px;
            text-align: center;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .section-title {
            font-size: 20px;
            letter-spacing: 0.18em;
            font-weight: 700;
            color: #555;
            text-align: center;
          }
          .campaign-title {
            font-size: 44px;
            font-weight: 900;
            text-transform: uppercase;
            margin-top: 4mm;
            text-align: center;
          }
          .observation {
            text-align: center;
            font-size: 22px;
            font-weight: 700;
            text-transform: uppercase;
            border-top: 1px solid #ddd;
            border-bottom: 1px solid #ddd;
            padding: 3mm 0;
          }
          .delivery-address {
            margin-top: 2mm;
            font-size: 15px;
            text-transform: uppercase;
            line-height: 1.5;
          }
          .contact-line {
            margin-top: 1mm;
            font-size: 10px;
          }
          .cnpj-line {
            margin-top: 2mm;
            font-size: 10px;
            font-weight: 600;
          }
          .instruction-panel {
            margin-top: auto;
            display: flex;
            gap: 5mm;
            align-items: center;
          }
          .instruction-square {
            background: #111;
            color: #fff;
            width: 36mm;
            min-height: 36mm;
            padding: 2.5mm;
            display: flex;
            flex-direction: column;
            gap: 2mm;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .instruction-square-title,
          .instruction-square-footer {
            font-weight: 700;
            text-align: center;
            font-size: 13px;
            letter-spacing: 0.12em;
          }
          .instruction-grid {
            display: grid;
            grid-template-columns: repeat(2, 34px);
            grid-auto-rows: 34px;
            justify-content: center;
            align-content: center;
          }
          .instruction-icon {
            margin: 0;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .instruction-letter {
            width: 22px;
            height: 22px;
            border-radius: 50%;
            border: 1.5px solid #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 15px;
            font-weight: 700;
          }
          .instruction-image {
            width: 34px;
            height: 34px;
            object-fit: contain;
            display: block;
          }
          .delivery-card {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            padding: 0 4mm;
            text-align: left;
          }
          .delivery-card .section-title {
            text-align: left;
          }
          .delivery-card.no-instructions {
            margin-top: auto;
          }
        </style>
      </head>
      <body>
        ${pages.join('')}
        <script>
          window.onload = function () {
            setTimeout(function () {
              window.print();
            }, 400);
          };
        </script>
      </body>
    </html>
  `
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
    
    let iconX = margin + 10
    activeInstructions.forEach(([key]) => {
      drawInstructionIcon(doc, iconX, currentY - 5, key as any)
      
      doc.setFontSize(8)
      doc.setTextColor(0, 0, 0)
      doc.setFont('helvetica', 'bold')
      const label = instructionTextLabels[key as keyof CampaignInstructions] || key.toUpperCase()
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
  const html = generateSealsHtml(sealData)
  const printWindow = window.open('', '_blank')

  if (!printWindow) {
    return
  }

  printWindow.document.open()
  printWindow.document.write(html)
  printWindow.document.close()
}

// Função para baixar o PDF
export function downloadSeals(sealData: SealData): void {
  const doc = generateSealsPDF(sealData)
  const fileName = `selos_${sealData.campaignName.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`
  doc.save(fileName)
}


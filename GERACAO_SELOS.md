# 📄 Geração de Selos - Documentação Completa

## ✅ O que foi implementado

### 1. Biblioteca de Geração de PDFs
- ✅ Instalado `jspdf` para geração de PDFs
- ✅ Criado módulo `seal-generator.ts` com funções de geração
- ✅ Implementado design profissional para os selos

### 2. Funcionalidades Principais
- ✅ Gerar PDF com um selo por página (formato A4)
- ✅ Abrir automaticamente a janela de impressão do Chrome
- ✅ Incluir todas as informações da campanha
- ✅ Mostrar instruções de manuseio com ícones visuais
- ✅ Gerar selos para campanhas novas e existentes

## 🎨 Layout do Selo

Cada selo ocupa uma página A4 completa e contém:

```
┌────────────────────────────────────────────────────────┐
│ [Cabeçalho Laranja]                                    │
│              SELO DE ENVIO                             │
├────────────────────────────────────────────────────────┤
│                                                        │
│ [Informações da Campanha]                              │
│ Campanha: Nome da campanha                             │
│                                                        │
│ ┌──────────────────────────────────────────────────┐  │
│ │ DESTINATÁRIO                                     │  │
│ ├──────────────────────────────────────────────────┤  │
│ │ Nome da Empresa                                  │  │
│ │ CNPJ: 00.000.000/0001-00                        │  │
│ │ Endereço completo do destinatário                │  │
│ │ A/C: Nome do contato (se disponível)            │  │
│ │ Tel: Telefone (se disponível)                   │  │
│ └──────────────────────────────────────────────────┘  │
│                                                        │
│ ┌──────────────────────────────────────────────────┐  │
│ │ REMETENTE                                        │  │
│ ├──────────────────────────────────────────────────┤  │
│ │ Endereço completo do remetente                   │  │
│ └──────────────────────────────────────────────────┘  │
│                                                        │
│ [Observação]                                           │
│ Observação: Texto da observação                        │
│                                                        │
│ [Instruções de Manuseio - se houver]                  │
│ ┌──────────────────────────────────────────────────┐  │
│ │ INSTRUÇÕES DE MANUSEIO                           │  │
│ │  [!]     [△]    [✋]    [▲]                      │  │
│ │ FRÁGIL  ATENÇÃO  CUIDADO  P/CIMA                 │  │
│ └──────────────────────────────────────────────────┘  │
│                                                        │
├────────────────────────────────────────────────────────┤
│ Selo 1 de 5 | 14/11/2025                             │
└────────────────────────────────────────────────────────┘
```

## 🚀 Como Usar

### Opção 1: Criar Nova Campanha e Gerar Selos

```
1. Ir para "Campanhas" no menu lateral
2. Preencher formulário da campanha:
   - Nome da campanha
   - Endereço do remetente
   - Observação (ex: A/C Gestor)
   - Instruções de manuseio (opcional)
3. Buscar e selecionar clientes
4. Clicar em "Gerar Selos"
5. ✅ Campanha é salva no Firestore
6. ✅ PDF é gerado automaticamente
7. ✅ Janela de impressão abre automaticamente
```

### Opção 2: Gerar Selos de Campanha Existente

```
1. Ir para "Campanhas" no menu lateral
2. Clicar em "Buscar Campanha"
3. Buscar a campanha desejada:
   - Por nome da campanha
   - Por nome do cliente
   - Ou listar todas
4. Na lista de resultados, clicar em "Gerar Etiquetas"
5. ✅ PDF é gerado com os dados da campanha
6. ✅ Janela de impressão abre automaticamente
```

## 📊 Estrutura de Dados

### SealData Interface

```typescript
interface SealData {
  campaignName: string          // Nome da campanha
  sender: string                // Endereço do remetente
  observation: string           // Observação (ex: A/C Gestor)
  instructions: {               // Instruções de manuseio
    fragile: boolean           // Frágil
    attention: boolean         // Atenção
    handleWithCare: boolean    // Manusear com Cuidado
    thisWayUp: boolean         // Este Lado Para Cima
  }
  companies: Company[]          // Lista de empresas/clientes
}
```

## 🎯 Funções Disponíveis

### `generateSealsPDF(sealData: SealData): jsPDF`

Gera um documento PDF com todos os selos.

**Retorna:** Objeto jsPDF com o documento completo

**Exemplo:**
```typescript
const doc = generateSealsPDF({
  campaignName: "Dia das Mães 2025",
  sender: "M7 Comercial Importadora",
  observation: "A/C Gestor",
  instructions: {
    fragile: true,
    attention: false,
    handleWithCare: true,
    thisWayUp: false,
  },
  companies: selectedCompanies,
})
```

### `printSeals(sealData: SealData): void`

Gera o PDF e abre automaticamente a janela de impressão do navegador.

**Exemplo:**
```typescript
printSeals({
  campaignName: "Dia das Mães 2025",
  sender: "M7 Comercial Importadora",
  observation: "A/C Gestor",
  instructions: { fragile: true, ... },
  companies: selectedCompanies,
})
```

### `downloadSeals(sealData: SealData): void`

Gera o PDF e faz o download direto do arquivo.

**Nome do arquivo:** `selos_[nome_campanha]_[timestamp].pdf`

**Exemplo:**
```typescript
downloadSeals({
  campaignName: "Dia das Mães 2025",
  // ... demais dados
})
// Baixa: selos_Dia_das_Mães_2025_1699999999999.pdf
```

## 🎨 Elementos Visuais

### Cores

- **Laranja Principal:** `#DC7B35` (220, 123, 53)
  - Usado em: cabeçalho, títulos de seção, ícones de instrução
- **Cinza Claro:** `#F5F5F5` (245, 245, 245)
  - Usado em: fundo de seções secundárias
- **Amarelo Claro:** `#FFF5E6` (255, 245, 230)
  - Usado em: fundo das instruções de manuseio

### Ícones de Instruções

- **Frágil:** Círculo com "!" no centro
- **Atenção:** Triângulo com "!" no centro
- **Manusear com Cuidado:** Quadrado com emoji de mão
- **Este Lado Para Cima:** Triângulo apontando para cima

### Fontes

- **Cabeçalho:** Helvetica Bold, 18pt
- **Títulos de Seção:** Helvetica Bold, 12pt
- **Nome da Empresa:** Helvetica Bold, 14pt
- **Texto Normal:** Helvetica, 10-11pt
- **Rodapé:** Helvetica, 8pt

## 🖨️ Impressão

### Configurações Recomendadas

Quando a janela de impressão abrir:

```
✅ Formato: A4 (210 x 297 mm)
✅ Orientação: Retrato (Portrait)
✅ Margens: Padrão (ou mínimas)
✅ Escala: 100%
✅ Páginas: Todas
✅ Cor: Colorido (recomendado)
✅ Qualidade: Alta
```

### Impressão em Lote

- Cada cliente selecionado gera **1 página**
- Se selecionar 5 clientes → PDF terá 5 páginas
- Você pode:
  - Imprimir todas de uma vez
  - Imprimir apenas páginas específicas (ex: páginas 1-3)
  - Salvar como PDF em vez de imprimir

## 🔄 Fluxo Completo

### Criar Campanha e Gerar Selos

```
1. Usuário preenche formulário da campanha
2. Usuário busca e seleciona clientes
3. Usuário clica em "Gerar Selos"
4. Sistema valida os dados
5. Sistema cria a campanha no Firestore
6. Sistema filtra apenas clientes selecionados
7. Sistema gera o PDF (função generateSealsPDF)
8. Sistema configura impressão automática (autoPrint)
9. Sistema abre PDF em nova aba
10. Navegador abre janela de impressão automaticamente
11. Usuário pode imprimir ou salvar
12. Formulário é limpo após sucesso
```

## 🧪 Como Testar

### Teste 1: Gerar Selos para Nova Campanha

```bash
1. Login no sistema
2. Ir para "Campanhas"
3. Preencher:
   - Nome: "Teste Impressão Selos"
   - Remetente: "M7 Comercial Importadora"
   - Observação: "Teste de geração de selos"
   - Marcar: Frágil e Atenção
4. Listar todos os clientes
5. Selecionar 3 clientes diferentes
6. Clicar em "Gerar Selos"
7. ✅ Toast de sucesso aparece
8. ✅ Toast "Gerando selos..." aparece
9. ✅ Nova aba/janela abre com PDF
10. ✅ Janela de impressão abre automaticamente
11. ✅ PDF tem 3 páginas (1 por cliente)
12. ✅ Cada página tem todos os dados corretos
```

### Teste 2: Gerar Selos de Campanha Existente

```bash
1. Ir para "Campanhas"
2. Clicar em "Buscar Campanha"
3. Listar todas as campanhas
4. Clicar em "Gerar Etiquetas" de uma campanha
5. ✅ Toast "Gerando selos..." aparece
6. ✅ Nova aba/janela abre com PDF
7. ✅ Janela de impressão abre automaticamente
8. ✅ PDF tem N páginas (1 por cliente da campanha)
```

### Teste 3: Verificar Layout do Selo

```bash
1. Gerar selos de uma campanha com instruções
2. No PDF, verificar:
   ✅ Cabeçalho laranja com "SELO DE ENVIO"
   ✅ Nome da campanha aparece no topo
   ✅ Seção "DESTINATÁRIO" com fundo laranja
   ✅ Nome da empresa em negrito e maior
   ✅ CNPJ formatado (00.000.000/0001-00)
   ✅ Endereço completo
   ✅ Seção "REMETENTE" com fundo laranja
   ✅ Endereço do remetente
   ✅ Seção "Observação" com fundo cinza claro
   ✅ Texto da observação
   ✅ Seção "INSTRUÇÕES DE MANUSEIO" (se houver)
   ✅ Ícones das instruções marcadas
   ✅ Labels das instruções abaixo dos ícones
   ✅ Rodapé com "Selo X de Y | Data"
   ✅ Linha decorativa no rodapé
```

### Teste 4: Múltiplos Clientes

```bash
1. Criar campanha com 5 clientes
2. Gerar selos
3. Verificar no PDF:
   ✅ Página 1: Cliente 1
   ✅ Página 2: Cliente 2
   ✅ Página 3: Cliente 3
   ✅ Página 4: Cliente 4
   ✅ Página 5: Cliente 5
   ✅ Rodapé correto em cada página (1 de 5, 2 de 5, etc.)
```

## 💡 Dicas

### Para Salvar PDF em vez de Imprimir

```
1. Quando a janela de impressão abrir
2. Em "Destino", selecione "Salvar como PDF"
3. Clique em "Salvar"
4. Escolha o local e nome do arquivo
```

### Para Imprimir Apenas Alguns Selos

```
1. Quando a janela de impressão abrir
2. Em "Páginas", selecione "Personalizar"
3. Digite as páginas desejadas (ex: 1-3 ou 1,3,5)
4. Clique em "Imprimir"
```

### Para Reimprimir Selos Mais Tarde

```
1. Ir para "Campanhas" → "Buscar Campanha"
2. Buscar a campanha desejada
3. Clicar em "Gerar Etiquetas"
4. ✅ Selos são gerados novamente
```

## 📝 Arquivos Criados/Modificados

### Criados:
- ✅ `src/lib/seal-generator.ts` - Módulo de geração de selos
- ✅ `GERACAO_SELOS.md` - Esta documentação

### Modificados:
- ✅ `package.json` - Adicionado dependência `jspdf`
- ✅ `src/pages/campaigns/CampaignsPage.tsx` - Integrado geração de selos

## 🎨 Personalização

### Para Mudar as Cores

Edite o arquivo `src/lib/seal-generator.ts`:

```typescript
// Cor laranja principal
doc.setFillColor(220, 123, 53)  // RGB

// Cor cinza claro (fundo)
doc.setFillColor(245, 245, 245)  // RGB

// Cor amarela clara (instruções)
doc.setFillColor(255, 245, 230)  // RGB
```

### Para Adicionar Logo

Adicione no cabeçalho da função `generateSeal`:

```typescript
// Após o cabeçalho laranja
doc.addImage(
  logoBase64,  // Base64 da imagem
  'PNG',       // Formato
  margin + 5,  // X
  5,           // Y
  20,          // Largura
  10           // Altura
)
```

### Para Mudar o Tamanho da Fonte

Edite as chamadas `doc.setFontSize()`:

```typescript
doc.setFontSize(18)  // Cabeçalho
doc.setFontSize(14)  // Nome da empresa
doc.setFontSize(12)  // Títulos de seção
doc.setFontSize(10)  // Texto normal
```

## 🚨 Troubleshooting

### PDF não abre automaticamente

**Problema:** Navegador bloqueou pop-up

**Solução:** 
1. Clique no ícone de bloqueio de pop-up na barra de endereço
2. Permitir pop-ups para este site
3. Tente gerar os selos novamente

### Janela de impressão não abre

**Problema:** `autoPrint()` não funciona em alguns navegadores

**Solução:**
1. O PDF ainda abre em nova aba
2. Use Ctrl+P (Cmd+P no Mac) para imprimir manualmente
3. Ou clique com botão direito → Imprimir

### Layout quebrado no PDF

**Problema:** Texto muito longo ultrapassa as margens

**Solução:**
1. A função `addMultilineText` já faz quebra automática
2. Se ainda assim quebrar, reduza a fonte ou aumente `maxWidth`
3. Edite o arquivo `seal-generator.ts`

### Caracteres especiais não aparecem

**Problema:** Fonte Helvetica não suporta acentos

**Solução:**
```typescript
// Adicione esta linha no início da função generateSeal
doc.setFont('helvetica', 'normal', 'utf-8')
```

## 🚀 Melhorias Futuras

### Possíveis Adições:

1. **Código de Barras**
   - Adicionar código de barras único por selo
   - Biblioteca: `jsbarcode`

2. **QR Code**
   - Gerar QR code com link para rastreamento
   - Biblioteca: `qrcode`

3. **Templates Personalizados**
   - Permitir criar diferentes layouts de selo
   - Salvar templates no Firestore

4. **Impressão em Etiquetas**
   - Suporte para diferentes tamanhos de etiqueta
   - Formatos: 10x15cm, A6, etc.

5. **Exportar para Excel**
   - Lista de envios em planilha
   - Biblioteca: `xlsx`

6. **Histórico de Impressões**
   - Registrar quando selos foram impressos
   - Contador de reimpressões

## 📦 Dependências

```json
{
  "jspdf": "^2.5.2"  // Geração de PDFs
}
```

## 🎓 Recursos Adicionais

- [jsPDF Documentação](https://github.com/parallax/jsPDF)
- [jsPDF API Reference](http://raw.githack.com/MrRio/jsPDF/master/docs/)

---

**Status:** ✅ Totalmente funcional e integrado!  
**Versão:** 1.0.0  
**Última atualização:** 14/11/2025


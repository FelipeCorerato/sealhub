# 🎯 Tela de Campanhas - Implementação Completa

## ✅ O que foi implementado

### 1. Integração com Firestore
- ✅ Tipos de dados completos (`Campaign`, `CreateCampaignData`, `UpdateCampaignData`)
- ✅ Serviços CRUD no Firestore (`lib/firebase/campaigns.ts`)
- ✅ Regras de segurança configuradas

### 2. Busca de Clientes
- ✅ Buscar por nome (case-insensitive)
- ✅ Buscar por CNPJ (parcial)
- ✅ Listar todos os clientes cadastrados
- ✅ Toast de feedback para todas as operações

### 3. Seleção de Clientes
- ✅ Tabela com checkboxes para seleção múltipla
- ✅ Clique na linha inteira para selecionar/desselecionar
- ✅ Contador de selecionados no cabeçalho da tabela
- ✅ Usa IDs do Firestore (não mais CNPJs)

### 4. Criação de Campanhas
- ✅ Formulário completo com validações
- ✅ Instruções de manuseio (Frágil, Atenção, etc)
- ✅ Salva no Firestore com status 'active'
- ✅ Limpa formulário após criar
- ✅ Toast de sucesso/erro

## 🎨 Interface

### Formulário da Campanha

```
┌─────────────────────────────────────────────────────┐
│ Informações Sobre a Campanha                       │
│                                                     │
│ Nome da Campanha *                                  │
│ [Ex: Dia das mães 2025]                            │
│                                                     │
│ Remetente *                      Observação *      │
│ [M7 Comercial...]                [A/C Gestor]      │
│                                                     │
│ Instruções de manuseio                              │
│ [☐ Frágil] [☐ Atenção] [☐ Manusear com Cuidado]   │
└─────────────────────────────────────────────────────┘
```

### Seleção de Clientes

```
┌─────────────────────────────────────────────────────┐
│ Selecionar Clientes                                 │
│                                                     │
│                      [Listar Todos os Clientes]     │
│                                                     │
│ Buscar por nome *                  OU  Buscar CNPJ *│
│ [Ex: Iasa Impressionante] [Buscar]    [00.000...   │
└─────────────────────────────────────────────────────┘
```

### Tabela de Clientes

```
┌───────────────────────────────────────────────────────┐
│ 3 Resultado(s) encontrado(s) • 2 selecionado(s)      │
├───────────────────────────────────────────────────────┤
│ Incluir? | CNPJ            | Nome        | Endereço │
├───────────────────────────────────────────────────────┤
│ [☑]      | 19.131.243/...  | Bradesco   | Av. ...  │
│ [☑]      | 33.000.167/...  | Santander  | Av. ...  │
│ [☐]      | 60.701.190/...  | Itaú       | Av. ...  │
└───────────────────────────────────────────────────────┘
```

### Rodapé (quando há clientes selecionados)

```
┌─────────────────────────────────────────────────────┐
│ 2 cliente(s) selecionado(s)                         │
│ Campanha: Dia das mães 2025         [Gerar Selos]  │
└─────────────────────────────────────────────────────┘
```

## 🔄 Fluxo Completo

### Criar Nova Campanha

```
1. Login
2. Navegar para "Campanhas"
3. Preencher formulário da campanha
   - Nome
   - Remetente
   - Observação
   - Instruções (opcional)
4. Buscar clientes
   - Por nome
   - Por CNPJ
   - Ou listar todos
5. Selecionar clientes (checkbox)
6. Clicar em "Gerar Selos"
7. ✅ Campanha criada no Firestore
8. Formulário limpo automaticamente
```

## 📊 Estrutura de Dados

### Campaign (no Firestore)

```typescript
{
  id: string                    // Gerado automaticamente
  name: string                  // Nome da campanha
  sender: string                // Endereço do remetente
  observation: string           // Observação (ex: A/C Gestor)
  
  // Instruções de manuseio
  instructions: {
    fragile: boolean           // Frágil
    attention: boolean         // Atenção
    handleWithCare: boolean    // Manusear com Cuidado
    thisWayUp: boolean         // Este Lado Para Cima
  }
  
  // Clientes vinculados (IDs do Firestore)
  companyIds: string[]         // ['abc123', 'def456', ...]
  
  // Status
  status: 'draft' | 'active' | 'completed' | 'cancelled'
  
  // Metadados
  createdAt: Date              // Data de criação
  createdBy: string            // ID do usuário
  updatedAt: Date              // Última atualização
}
```

## 🚨 Validações

### Ao criar campanha:

- ❌ Nome vazio → "Nome da campanha é obrigatório"
- ❌ Remetente vazio → "Remetente é obrigatório"
- ❌ Observação vazia → "Observação é obrigatória"
- ❌ Nenhum cliente selecionado → "Selecione pelo menos um cliente"
- ❌ Usuário não autenticado → "Usuário não autenticado"

## 🎯 Como Testar

### Teste 1: Criar Campanha Completa

```bash
1. Adicionar clientes na tela de Clientes
   - Pelo menos 2-3 clientes diferentes
   
2. Ir para Campanhas
   
3. Preencher:
   - Nome: "Teste Dia das Mães 2025"
   - Remetente: "M7 Comercial Importadora"
   - Observação: "A/C Gestor"
   - Marcar: Frágil e Atenção
   
4. Clicar em "Listar Todos os Clientes"
   
5. Selecionar 2 clientes (clique na linha ou checkbox)
   
6. Clicar em "Gerar Selos"
   
7. ✅ Deve aparecer toast de sucesso
8. ✅ Formulário deve limpar
9. ✅ Verificar no Firebase Console → Firestore → campaigns
```

### Teste 2: Buscar Clientes

```bash
1. Buscar por nome:
   - Digite "banco"
   - Clique em Buscar
   - ✅ Deve mostrar toast com quantidade
   
2. Buscar por CNPJ:
   - Digite "19131243"
   - Clique em Buscar
   - ✅ Deve encontrar clientes
   
3. Listar todos:
   - Clicar em "Listar Todos os Clientes"
   - ✅ Deve mostrar todos
```

### Teste 3: Seleção Múltipla

```bash
1. Listar todos os clientes
2. Clicar na linha (não no checkbox) de um cliente
   - ✅ Deve selecionar
3. Clicar novamente
   - ✅ Deve desselecionar
4. Usar checkbox diretamente
   - ✅ Deve funcionar igual
5. Selecionar 3 clientes
   - ✅ Contador deve mostrar "3 selecionado(s)"
   - ✅ Rodapé deve aparecer
```

### Teste 4: Validações

```bash
1. Clicar em "Gerar Selos" sem preencher nada
   - ✅ "Nome da campanha é obrigatório"
   
2. Preencher só o nome
   - ✅ "Remetente é obrigatório"
   
3. Preencher nome e remetente
   - ✅ "Observação é obrigatória"
   
4. Preencher tudo mas não selecionar cliente
   - ✅ "Selecione pelo menos um cliente"
   
5. Preencher tudo e selecionar clientes
   - ✅ Deve criar com sucesso!
```

## 🔥 Atualizar Regras no Firebase

No Firebase Console → Firestore → Rules, adicione/atualize:

```javascript
// ===== CAMPAIGNS =====
match /campaigns/{campaignId} {
  // Qualquer usuário autenticado pode ler
  allow read: if request.auth != null;
  
  // Qualquer usuário autenticado pode criar
  allow create: if request.auth != null
    && request.resource.data.createdBy == request.auth.uid
    && request.resource.data.name is string
    && request.resource.data.sender is string
    && request.resource.data.observation is string
    && request.resource.data.status in ['draft', 'active', 'completed', 'cancelled'];
  
  // Qualquer usuário autenticado pode atualizar
  allow update: if request.auth != null;
  
  // Apenas o criador pode deletar
  allow delete: if request.auth != null
    && resource.data.createdBy == request.auth.uid;
}
```

Depois clique em **"Publish"** e aguarde 30 segundos.

## 🔍 Verificar no Firebase

### Console do Firestore:

```
firebase.google.com → Seu Projeto → Firestore Database

campaigns/
├── {campaignId1}
│   ├── name: "Dia das mães 2025"
│   ├── sender: "M7 Comercial..."
│   ├── observation: "A/C Gestor"
│   ├── instructions: { fragile: true, ... }
│   ├── companyIds: ["abc123", "def456"]
│   ├── status: "active"
│   ├── createdAt: Timestamp
│   ├── createdBy: "user_id"
│   └── updatedAt: Timestamp
```

## 🎨 Melhorias Visuais

### UX:

- ✅ Clique na linha inteira para selecionar (não só no checkbox)
- ✅ Toast de feedback em todas as operações
- ✅ Contador visual de clientes selecionados
- ✅ Rodapé animado que aparece/desaparece
- ✅ Loading spinner durante buscas
- ✅ Validações com mensagens claras

### Visual:

- ✅ Cards com bordas arredondadas (rounded-2xl)
- ✅ Sombras suaves
- ✅ Cor laranja (#D97B35) consistente
- ✅ Ícones visuais para instruções
- ✅ Layout responsivo (desktop e mobile)

## 📝 Arquivos Modificados/Criados

### Criados:
- ✅ `src/lib/firebase/campaigns.ts` - Serviços do Firestore
- ✅ `CAMPANHAS_SETUP.md` - Esta documentação

### Modificados:
- ✅ `src/types/index.ts` - Tipos de Campaign
- ✅ `src/pages/campaigns/CampaignsPage.tsx` - Integração Firestore
- ✅ `src/components/ClientSelectionTable.tsx` - Usa IDs em vez de CNPJs
- ✅ `src/lib/firebase/index.ts` - Exporta serviços de campanhas
- ✅ `firestore.rules` - Regras de segurança para campanhas

## 🚀 Próximos Passos (Futuro)

1. **Buscar Campanhas Existentes**
   - Implementar a funcionalidade "Buscar Campanha"
   - Listar campanhas criadas
   - Filtrar por status (ativa, concluída, etc)

2. **Editar Campanhas**
   - Editar informações
   - Adicionar/remover clientes
   - Alterar status

3. **Geração de Selos (PDF)**
   - Gerar PDF com dados da campanha
   - Um selo por cliente
   - Com código de barras
   - Com instruções visuais

4. **Histórico**
   - Ver campanhas anteriores
   - Estatísticas (quantos selos gerados, etc)

## 💡 Dicas

### Para adicionar clientes rapidamente (teste):

```
CNPJs de empresas reais para testar:
- 19.131.243/0001-97 (Banco Bradesco)
- 33.000.167/0001-01 (Banco Santander)
- 60.701.190/0001-04 (Itaú Unibanco)
- 00.000.000/0001-91 (Banco do Brasil)
- 07.237.373/0001-20 (Pão de Açúcar)
```

### Debug:

```javascript
// Console do navegador (F12)
// Ver dados da campanha antes de salvar:
console.log({
  name: campaignName,
  sender,
  observation,
  instructions,
  companyIds: Array.from(selectedIds),
})
```

---

**Status:** ✅ Totalmente funcional e integrado com Firestore!  
**Versão:** 1.0.0  
**Última atualização:** $(date)


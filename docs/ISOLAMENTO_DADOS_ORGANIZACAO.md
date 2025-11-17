# Isolamento de Dados por Organização

## 📋 Visão Geral

Este documento descreve a implementação do isolamento de dados entre organizações para **campanhas** e **clientes (companies)**, garantindo que cada organização veja apenas seus próprios dados.

## ✅ O que foi implementado

### 1. Tipos TypeScript Atualizados

Adicionado o campo `organizationId` aos tipos:

```typescript
// src/types/index.ts

export interface Company {
  id: string
  organizationId: string  // ✨ NOVO
  cnpj: string
  name: string
  // ... outros campos
}

export interface Campaign {
  id: string
  organizationId: string  // ✨ NOVO
  name: string
  sender: string
  // ... outros campos
}
```

### 2. Funções de Firestore Atualizadas

Todas as funções de CRUD e busca agora **obrigatoriamente** recebem `organizationId`:

#### Campanhas (`src/lib/firebase/campaigns.ts`)

```typescript
// ANTES
export async function getAllCampaigns(): Promise<Campaign[]>

// DEPOIS
export async function getAllCampaigns(organizationId: string): Promise<Campaign[]>
```

**Funções atualizadas:**
- `searchCampaignsByName(searchTerm, organizationId)`
- `getCampaignsByStatus(status, organizationId)`
- `getAllCampaigns(organizationId)`
- `getCampaignsByUser(userId, organizationId)`
- `searchCampaignsWithCompaniesByName(searchTerm, organizationId)`
- `searchCampaignsByCompanyName(companyNameSearch, organizationId)`
- `getAllCampaignsWithCompanies(organizationId)`

#### Clientes (`src/lib/firebase/companies.ts`)

```typescript
// ANTES
export async function getAllCompanies(): Promise<Company[]>

// DEPOIS
export async function getAllCompanies(organizationId: string): Promise<Company[]>
```

**Funções atualizadas:**
- `getCompanyByCNPJ(cnpj, organizationId)`
- `searchCompaniesByName(searchTerm, organizationId)`
- `searchCompaniesByCNPJ(cnpjPart, organizationId)`
- `getAllCompanies(organizationId)`
- `cnpjExists(cnpj, organizationId)`
- `upsertCompanyFromReceita(receitaData, userId, organizationId, headquartersId?)`
- `saveMatrizAndBranches(matrizData, filiaisData, userId, organizationId)`

### 3. Componentes Atualizados

#### CampaignsPage (`src/pages/campaigns/CampaignsPage.tsx`)

```typescript
export function CampaignsPage() {
  const { organization } = useOrganization()  // ✨ NOVO
  
  // Criação de campanha
  const campaign = await createCampaign({
    name: campaignName,
    organizationId: organization.id,  // ✨ NOVO
    // ... outros campos
  })
  
  // Buscas
  const results = await searchCampaignsWithCompaniesByName(name, organization.id)
  const companies = await getAllCompanies(organization.id)
}
```

#### ClientsPage (`src/pages/clients/ClientsPage.tsx`)

```typescript
export function ClientsPage() {
  const { organization } = useOrganization()  // ✨ NOVO
  
  // Salvar matriz e filiais
  const { matriz, filiais } = await saveMatrizAndBranches(
    matrizData, 
    filiaisData, 
    user.id, 
    organization.id  // ✨ NOVO
  )
  
  // Busca
  const results = await searchCompaniesByName(name, organization.id)
}
```

### 4. Firestore Security Rules

As regras já estavam implementadas em `/firestore-rules-multi-tenant.rules`:

```javascript
// Campanhas - apenas membros da organização podem ler
match /campaigns/{campaignId} {
  allow read: if request.auth != null
    && isMemberOf(resource.data.organizationId);
  
  allow create: if request.auth != null
    && request.resource.data.organizationId is string
    && isMemberOf(request.resource.data.organizationId);
  
  allow update: if request.auth != null
    && isMemberOf(resource.data.organizationId)
    && request.resource.data.organizationId == resource.data.organizationId;
}

// Clientes - apenas membros da organização podem ler
match /companies/{companyId} {
  allow read: if request.auth != null
    && isMemberOf(resource.data.organizationId);
  
  allow create: if request.auth != null
    && request.resource.data.organizationId is string
    && isMemberOf(request.resource.data.organizationId);
  
  allow update: if request.auth != null
    && isMemberOf(resource.data.organizationId)
    && request.resource.data.organizationId == resource.data.organizationId;
}
```

### 5. Script de Migração

Criado script para adicionar `organizationId` a dados existentes:

**Arquivo:** `/scripts/migrate-add-organization-id.ts`

```bash
# Como executar:
npx ts-node scripts/migrate-add-organization-id.ts
```

**O script:**
1. Verifica se a organização padrão existe
2. Adiciona `organizationId` a todas as campanhas sem este campo
3. Adiciona `organizationId` a todos os clientes sem este campo
4. Gera relatório de sucesso/erros

## 🔒 Garantias de Segurança

### Camada 1: Frontend
- Todas as queries filtram por `organizationId`
- Impossível buscar dados de outra organização no código

### Camada 2: Firestore Rules
- Validação no banco de dados
- Usuário só pode:
  - Ler dados da sua organização
  - Criar dados associados à sua organização
  - Não pode alterar o `organizationId` de dados existentes

### Camada 3: Validação de Membership
- Função `isMemberOf(orgId)` verifica se o usuário é membro ativo
- Apenas membros ativos podem acessar dados da organização

## 📊 Fluxo de Dados

```
Usuário faz login
    ↓
OrganizationContext carrega organização do usuário
    ↓
CampaignsPage/ClientsPage recebe organization.id
    ↓
Funções de busca/criação usam organizationId
    ↓
Firestore valida permissões
    ↓
Retorna apenas dados da organização
```

## 🚀 Como usar nos novos componentes

Sempre que criar um novo componente que trabalha com campanhas ou clientes:

```typescript
import { useOrganization } from '@/contexts/OrganizationContext'

export function MeuComponente() {
  const { organization } = useOrganization()
  
  // Sempre verificar se organization existe
  if (!organization) {
    return <div>Carregando...</div>
  }
  
  // Passar organizationId em todas as funções
  const dados = await minhaFuncao(...params, organization.id)
}
```

## ⚠️ Checklist para novos recursos

Ao adicionar novos tipos de dados que devem ser isolados:

- [ ] Adicionar `organizationId` ao tipo TypeScript
- [ ] Atualizar `docToXXX` para incluir `organizationId`
- [ ] Adicionar filtro `where('organizationId', '==', organizationId)` em todas as queries
- [ ] Passar `organizationId` em todas as funções create/update
- [ ] Adicionar regras de segurança no Firestore
- [ ] Criar script de migração se necessário
- [ ] Atualizar componentes para usar `useOrganization()`

## 📝 Notas Importantes

1. **Dados existentes:** Execute o script de migração APENAS UMA VEZ
2. **organizationId obrigatório:** Nunca crie dados sem `organizationId`
3. **Validação dupla:** Frontend + Firestore Rules = segurança máxima
4. **Queries compostas:** Firestore exige índices para queries com múltiplos `where`

## 🔍 Testando o Isolamento

### Teste Manual

1. Crie uma segunda organização
2. Associe um usuário de teste a ela
3. Faça login com esse usuário
4. Verifique que ele NÃO vê dados da primeira organização
5. Crie dados e verifique que apenas ele os vê

### Teste via Console Firestore

1. Verifique que todos os documentos têm `organizationId`
2. Tente acessar dados de outra organização via Rules Simulator
3. Deve retornar "Permission Denied"

## 📚 Documentos Relacionados

- `/docs/MULTI_TENANT_STRUCTURE.md` - Arquitetura geral
- `/docs/USER_ASSOCIATION_SYSTEM.md` - Sistema de associação
- `/firestore-rules-multi-tenant.rules` - Regras completas


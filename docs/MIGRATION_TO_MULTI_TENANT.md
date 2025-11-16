# Migração para Sistema Multi-Tenant

## 📋 Overview

Guia para migrar dados existentes para o novo sistema multi-tenant.

## ⚠️ IMPORTANTE

**Faça backup completo do Firestore antes de iniciar a migração!**

```bash
# Exportar dados do Firestore
firebase firestore:export gs://seu-bucket/backup-$(date +%Y%m%d)
```

## 🎯 Objetivos da Migração

1. ✅ Criar organizações para empresas existentes
2. ✅ Associar usuários às organizações
3. ✅ Adicionar `organizationId` em companies
4. ✅ Adicionar `organizationId` em campaigns
5. ✅ Criar registros em `organizationMembers`
6. ✅ Manter integridade dos dados

## 📝 Passo a Passo

### Passo 1: Criar Organização Inicial

```typescript
// Script: scripts/create-initial-organization.ts

import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { createOrganization } from '../src/lib/firebase/organizations'

async function createInitialOrg() {
  const orgData = {
    name: 'IASA Brasil',
    tradeName: 'IASA',
    cnpj: '12.345.678/0001-90', // Substitua pelo CNPJ real
    description: 'Organização principal',
    emailDomains: ['@iasabrasil.com.br'],
    theme: {
      primaryColor: '#D97B35',
      primaryHoverColor: '#C16A2A',
      lightBackgroundColor: '#FFF5ED',
    },
    settings: {
      defaultSender: 'IASA Brasil',
      timezone: 'America/Sao_Paulo',
      language: 'pt-BR',
    }
  }
  
  // Use o ID do primeiro admin como criador
  const adminUserId = 'USER_ID_DO_ADMIN'
  
  const org = await createOrganization(orgData, adminUserId)
  console.log('Organização criada:', org.id)
  
  return org.id
}

createInitialOrg()
```

### Passo 2: Associar Usuários à Organização

```typescript
// Script: scripts/migrate-users-to-organization.ts

import { collection, getDocs, doc, updateDoc } from 'firebase/firestore'
import { db } from '../src/lib/firebase'
import { addOrganizationMember } from '../src/lib/firebase/organizations'

async function migrateUsers(organizationId: string) {
  const usersRef = collection(db, 'users')
  const usersSnap = await getDocs(usersRef)
  
  console.log(`Migrando ${usersSnap.size} usuários...`)
  
  for (const userDoc of usersSnap.docs) {
    const userData = userDoc.data()
    const userId = userDoc.id
    
    try {
      // Adicionar como membro da organização
      await addOrganizationMember(
        organizationId,
        userId,
        'member', // Ajuste o role conforme necessário
        userId, // addedBy
        userData.email,
        userData.name
      )
      
      // Atualizar documento do usuário
      await updateDoc(doc(db, 'users', userId), {
        currentOrganizationId: organizationId
      })
      
      console.log(`✅ Usuário ${userData.email} migrado`)
    } catch (error) {
      console.error(`❌ Erro ao migrar ${userData.email}:`, error)
    }
  }
  
  console.log('Migração de usuários concluída!')
}

// Execute:
migrateUsers('ID_DA_ORGANIZACAO')
```

### Passo 3: Atualizar Companies

```typescript
// Script: scripts/add-org-to-companies.ts

import { collection, getDocs, doc, updateDoc } from 'firebase/firestore'
import { db } from '../src/lib/firebase'

async function addOrgToCompanies(organizationId: string) {
  const companiesRef = collection(db, 'companies')
  const companiesSnap = await getDocs(companiesRef)
  
  console.log(`Atualizando ${companiesSnap.size} empresas...`)
  
  let updated = 0
  let errors = 0
  
  for (const companyDoc of companiesSnap.docs) {
    try {
      await updateDoc(doc(db, 'companies', companyDoc.id), {
        organizationId: organizationId
      })
      updated++
      
      if (updated % 10 === 0) {
        console.log(`Progresso: ${updated}/${companiesSnap.size}`)
      }
    } catch (error) {
      console.error(`❌ Erro na empresa ${companyDoc.id}:`, error)
      errors++
    }
  }
  
  console.log(`✅ ${updated} empresas atualizadas`)
  console.log(`❌ ${errors} erros`)
}

// Execute:
addOrgToCompanies('ID_DA_ORGANIZACAO')
```

### Passo 4: Atualizar Campaigns

```typescript
// Script: scripts/add-org-to-campaigns.ts

import { collection, getDocs, doc, updateDoc } from 'firebase/firestore'
import { db } from '../src/lib/firebase'

async function addOrgToCampaigns(organizationId: string) {
  const campaignsRef = collection(db, 'campaigns')
  const campaignsSnap = await getDocs(campaignsRef)
  
  console.log(`Atualizando ${campaignsSnap.size} campanhas...`)
  
  let updated = 0
  let errors = 0
  
  for (const campaignDoc of campaignsSnap.docs) {
    try {
      await updateDoc(doc(db, 'campaigns', campaignDoc.id), {
        organizationId: organizationId
      })
      updated++
      
      if (updated % 10 === 0) {
        console.log(`Progresso: ${updated}/${campaignsSnap.size}`)
      }
    } catch (error) {
      console.error(`❌ Erro na campanha ${campaignDoc.id}:`, error)
      errors++
    }
  }
  
  console.log(`✅ ${updated} campanhas atualizadas`)
  console.log(`❌ ${errors} erros`)
}

// Execute:
addOrgToCampaigns('ID_DA_ORGANIZACAO')
```

### Passo 5: Atualizar Firestore Rules

Veja o arquivo `firestore-rules-multi-tenant.rules` para as novas regras.

### Passo 6: Atualizar Código do Frontend

```typescript
// 1. Adicionar OrganizationProvider em app/providers.tsx

import { OrganizationProvider } from '@/contexts/OrganizationContext'

export function Providers({ children }: ProvidersProps) {
  return (
    <BrowserRouter>
      <AuthProvider>
        <OrganizationProvider>  {/* ← ADICIONAR */}
          <ThemeProvider>
            <AccessibilityProvider>
              <SidebarProvider>
                <Toaster position="top-right" />
                {children}
              </SidebarProvider>
            </AccessibilityProvider>
          </ThemeProvider>
        </OrganizationProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
```

```typescript
// 2. Atualizar queries em companies.ts

export async function getCompanies(organizationId: string): Promise<Company[]> {
  const companiesRef = collection(db, 'companies')
  const q = query(
    companiesRef,
    where('organizationId', '==', organizationId), // ← ADICIONAR
    orderBy('name', 'asc')
  )
  // ... resto do código
}
```

```typescript
// 3. Atualizar queries em campaigns.ts

export async function getCampaigns(organizationId: string): Promise<Campaign[]> {
  const campaignsRef = collection(db, 'campaigns')
  const q = query(
    campaignsRef,
    where('organizationId', '==', organizationId), // ← ADICIONAR
    orderBy('updatedAt', 'desc')
  )
  // ... resto do código
}
```

## ✅ Checklist de Migração

### Pré-Migração
- [ ] Fazer backup completo do Firestore
- [ ] Revisar documentação
- [ ] Testar scripts em ambiente de desenvolvimento
- [ ] Preparar rollback plan

### Execução
- [ ] Criar organização inicial
- [ ] Migrar usuários
- [ ] Adicionar organizationId em companies
- [ ] Adicionar organizationId em campaigns
- [ ] Verificar dados migrados
- [ ] Atualizar Firestore Rules
- [ ] Atualizar código frontend

### Pós-Migração
- [ ] Testar login de usuários
- [ ] Verificar listagem de companies
- [ ] Verificar listagem de campaigns
- [ ] Testar criação de novos registros
- [ ] Verificar aplicação de tema
- [ ] Monitorar logs de erro

### Validação
- [ ] Todos os usuários têm organizationId
- [ ] Todas as companies têm organizationId
- [ ] Todas as campaigns têm organizationId
- [ ] OrganizationMembers criados corretamente
- [ ] Tema aplicado corretamente
- [ ] Permissões funcionando

## 🚨 Troubleshooting

### Problema: Usuário não consegue ver dados

**Causa:** `organizationId` não foi adicionado aos registros ou membro não foi criado

**Solução:**
```typescript
// Verificar se usuário tem membro na organização
const member = await getUserOrganization(userId)
console.log('Membro:', member)

// Verificar se companies têm organizationId
const companies = await getDocs(collection(db, 'companies'))
companies.docs.forEach(doc => {
  console.log(doc.id, 'org:', doc.data().organizationId)
})
```

### Problema: Firestore Rules bloqueando acesso

**Causa:** Rules antigas ainda ativas

**Solução:**
```bash
# Verificar rules atuais
firebase firestore:rules:get

# Fazer deploy das novas rules
firebase deploy --only firestore:rules
```

### Problema: Tema não aplicado

**Causa:** OrganizationContext não está no provider tree

**Solução:**
```typescript
// Verificar se OrganizationProvider está envolvendo a aplicação
<OrganizationProvider>
  <App />
</OrganizationProvider>
```

## 📊 Script de Validação

```typescript
// Script: scripts/validate-migration.ts

async function validateMigration(organizationId: string) {
  console.log('🔍 Validando migração...\n')
  
  // 1. Verificar organização
  const org = await getOrganization(organizationId)
  console.log('✅ Organização encontrada:', org?.name)
  
  // 2. Verificar membros
  const members = await getOrganizationMembers(organizationId)
  console.log(`✅ ${members.length} membros encontrados`)
  
  // 3. Verificar companies com org
  const companiesRef = collection(db, 'companies')
  const companiesSnap = await getDocs(companiesRef)
  const companiesWithOrg = companiesSnap.docs.filter(
    doc => doc.data().organizationId === organizationId
  )
  console.log(`✅ ${companiesWithOrg.length}/${companiesSnap.size} companies com organizationId`)
  
  // 4. Verificar campaigns com org
  const campaignsRef = collection(db, 'campaigns')
  const campaignsSnap = await getDocs(campaignsRef)
  const campaignsWithOrg = campaignsSnap.docs.filter(
    doc => doc.data().organizationId === organizationId
  )
  console.log(`✅ ${campaignsWithOrg.length}/${campaignsSnap.size} campaigns com organizationId`)
  
  // 5. Verificar users com org
  const usersRef = collection(db, 'users')
  const usersSnap = await getDocs(usersRef)
  const usersWithOrg = usersSnap.docs.filter(
    doc => doc.data().currentOrganizationId === organizationId
  )
  console.log(`✅ ${usersWithOrg.length}/${usersSnap.size} users com currentOrganizationId`)
  
  console.log('\n✅ Validação concluída!')
}

// Execute:
validateMigration('ID_DA_ORGANIZACAO')
```

## 🔄 Rollback (Se necessário)

Se algo der errado, restaure o backup:

```bash
# Restaurar backup
firebase firestore:import gs://seu-bucket/backup-20250116
```

## 📚 Próximos Passos Após Migração

1. Criar interface de administração
2. Implementar convites de membros
3. Adicionar mais organizações
4. Configurar relatórios por organização
5. Implementar limites e cotas


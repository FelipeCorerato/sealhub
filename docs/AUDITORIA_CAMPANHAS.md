# Auditoria de Campanhas

## 📋 Visão Geral

O sistema rastreia automaticamente quem criou e quem fez a última atualização em cada campanha. Isso permite auditoria completa das operações realizadas no sistema.

## 🔍 Campos de Auditoria

Cada campanha possui os seguintes campos de rastreamento:

### `createdBy`
- **Tipo**: `string` (User ID do Firebase)
- **Descrição**: ID do usuário que criou a campanha
- **Definido em**: Criação da campanha
- **Imutável**: Sim, nunca é alterado após a criação

### `updatedBy`
- **Tipo**: `string` (User ID do Firebase)
- **Descrição**: ID do usuário que fez a última atualização
- **Definido em**: Criação (inicialmente igual a `createdBy`) e em cada atualização
- **Imutável**: Não, atualizado a cada modificação

### `createdAt`
- **Tipo**: `Timestamp`
- **Descrição**: Data e hora de criação
- **Definido em**: Criação da campanha
- **Imutável**: Sim

### `updatedAt`
- **Tipo**: `Timestamp`
- **Descrição**: Data e hora da última atualização
- **Definido em**: Criação e em cada atualização
- **Imutável**: Não, atualizado a cada modificação

## 💻 Como Funciona

### Ao Criar uma Campanha

Quando uma campanha é criada, tanto o `createdBy` quanto o `updatedBy` são definidos com o ID do usuário logado:

```typescript
const campaign = await createCampaign({
  name: 'Campanha Natal 2025',
  sender: 'M7 Comercial...',
  observation: 'A/C Gestor',
  instructions: { /* ... */ },
  companyIds: ['id1', 'id2'],
  status: 'active',
  createdBy: user.id,  // Automaticamente definido como updatedBy também
})

// Resultado:
// createdBy: 'user123'
// updatedBy: 'user123'  (inicialmente igual ao createdBy)
// createdAt: 2025-11-16T10:00:00Z
// updatedAt: 2025-11-16T10:00:00Z
```

### Ao Atualizar uma Campanha

Quando uma campanha é atualizada, o `updatedBy` é automaticamente definido com o ID do usuário que fez a atualização:

```typescript
const updatedCampaign = await updateCampaign(
  campaignId,
  {
    status: 'completed',
    observation: 'Nova observação',
  },
  user.id  // ID do usuário que está fazendo a atualização
)

// Resultado:
// createdBy: 'user123'  (permanece inalterado)
// updatedBy: 'user456'  (atualizado para o novo usuário)
// createdAt: 2025-11-16T10:00:00Z  (permanece inalterado)
// updatedAt: 2025-11-16T15:30:00Z  (atualizado)
```

## 🔒 Regras de Segurança

As regras do Firestore garantem que:

1. **Na criação**: `createdBy` e `updatedBy` devem ser o ID do usuário autenticado
2. **Na atualização**: 
   - `updatedBy` deve ser o ID do usuário autenticado
   - `createdBy` não pode ser alterado

```javascript
// Criar - valida que createdBy e updatedBy são do usuário atual
allow create: if request.auth != null
  && request.resource.data.createdBy == request.auth.uid
  && request.resource.data.updatedBy == request.auth.uid
  // ... outras validações

// Atualizar - valida que updatedBy é do usuário atual e createdBy não mudou
allow update: if request.auth != null
  && request.resource.data.updatedBy == request.auth.uid
  && request.resource.data.createdBy == resource.data.createdBy
```

## 👤 Exibição de Nomes de Usuários

### Coleção `users`

O sistema mantém uma coleção de perfis de usuários no Firestore com informações básicas:

```typescript
{
  id: string,        // UID do Firebase Auth
  name: string,      // Nome de exibição
  email: string,     // Email do usuário
  createdAt: Date,   // Data de criação
  updatedAt: Date    // Última atualização
}
```

### Sincronização Automática

Sempre que um usuário faz login ou se registra, seu perfil é automaticamente criado ou atualizado no Firestore. Isso é feito de forma transparente no `AuthContext`:

```typescript
// Executado automaticamente no login
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      const userData = {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: firebaseUser.displayName || 'Usuário',
      }
      
      // Salva/atualiza perfil no Firestore
      await upsertUserProfile(userData.id, userData.name, userData.email)
    }
  })
}, [])
```

### Exibição na Interface

Ao listar campanhas, o sistema busca automaticamente os perfis dos usuários envolvidos:

```typescript
// Na listagem de campanhas
useEffect(() => {
  const loadUserProfiles = async () => {
    // Coleta IDs de criadores e atualizadores
    const userIds = new Set<string>()
    campaigns.forEach(c => {
      userIds.add(c.createdBy)
      userIds.add(c.updatedBy)
    })
    
    // Busca perfis em lote (paralelo)
    const profiles = await getUserProfiles([...userIds])
    setUserProfiles(profiles)
  }
}, [campaigns])
```

Na interface, os nomes são exibidos com fallback:

- **Se o perfil existe**: Exibe o nome do usuário (ex: "João Silva")
- **Se não existe**: Exibe os primeiros 8 caracteres do ID (ex: "Usuário 12345678...")

## 📊 Exemplo de Uso

### Buscar Campanhas de um Usuário

```typescript
import { getCampaignsByUser } from '@/lib/firebase/campaigns'
import { useAuth } from '@/contexts/AuthContext'

function MyCampaigns() {
  const { user } = useAuth()
  
  const loadMyCampaigns = async () => {
    const campaigns = await getCampaignsByUser(user.id)
    console.log(`Você criou ${campaigns.length} campanhas`)
  }
}
```

### Exibir Informações de Auditoria

```typescript
import { getUserDisplayName } from '@/lib/firebase/users'

function CampaignDetails({ 
  campaign, 
  userProfiles 
}: { 
  campaign: Campaign
  userProfiles: Map<string, UserProfile>
}) {
  return (
    <div>
      <h2>{campaign.name}</h2>
      
      <div className="audit-info">
        <p>
          Criado por: {getUserDisplayName(
            campaign.createdBy,
            userProfiles.get(campaign.createdBy)
          )} 
          em {campaign.createdAt.toLocaleString()}
        </p>
        <p>
          Última atualização por: {getUserDisplayName(
            campaign.updatedBy,
            userProfiles.get(campaign.updatedBy)
          )} 
          em {campaign.updatedAt.toLocaleString()}
        </p>
      </div>
    </div>
  )
}
```

### Verificar se Usuário é o Criador

```typescript
function canDeleteCampaign(campaign: Campaign, userId: string): boolean {
  return campaign.createdBy === userId
}

function CampaignActions({ campaign }: { campaign: Campaign }) {
  const { user } = useAuth()
  
  return (
    <div>
      {canDeleteCampaign(campaign, user.id) && (
        <button onClick={() => deleteCampaign(campaign.id)}>
          Excluir Campanha
        </button>
      )}
    </div>
  )
}
```

## 🔄 Migração de Dados Existentes

Se você tem campanhas criadas antes desta funcionalidade, elas podem não ter o campo `updatedBy`. O sistema automaticamente usa o `createdBy` como fallback:

```typescript
// Na conversão do Firestore
function docToCampaign(id: string, data: DocumentData): Campaign {
  return {
    // ...
    updatedBy: data.updatedBy || data.createdBy, // Fallback para createdBy
  }
}
```

## ✅ Benefícios

1. **Auditoria Completa**: Saber quem criou e quem modificou cada campanha
2. **Rastreabilidade**: Histórico de alterações com timestamps
3. **Segurança**: Regras do Firestore garantem que não há manipulação
4. **Transparência**: Usuários não precisam se preocupar, tudo é automático
5. **Responsabilização**: Cada ação está associada a um usuário específico

## 📝 Notas Importantes

- O rastreamento é **automático e transparente** para o usuário final
- Não é possível criar ou atualizar uma campanha sem estar autenticado
- O campo `createdBy` **nunca** é alterado após a criação
- O campo `updatedBy` é atualizado em **toda** modificação da campanha
- As datas usam `Timestamp` do Firestore para garantir consistência entre fusos horários

## 📸 Como Fica na Interface

### Listagem de Campanhas

Cada campanha exibe:

```
┌─────────────────────────────────────────────────┐
│ Campanha Natal 2025                             │
│ 📅 Criada em: 16/11/2025 10:00                 │
│ 🕐 Atualizada em: 16/11/2025 15:30             │
│ 📦 5 cliente(s)                                  │
│                                                  │
│ ─────────────────────────────────────────────   │
│ Criada por: João Silva                          │
│ Última atualização por: Maria Santos            │
└─────────────────────────────────────────────────┘
```

### Tooltip com ID Completo

Ao passar o mouse sobre o nome do usuário, um tooltip exibe o ID completo:

```
João Silva
└─ ID: a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

## 🚀 Próximos Passos

Possíveis melhorias futuras:

1. **Histórico Completo**: Criar uma subcoleção `history` para rastrear todas as alterações
2. **Detalhamento**: Registrar quais campos foram alterados
3. **Interface de Auditoria**: Página para visualizar todas as ações de um usuário
4. **Notificações**: Avisar criadores quando suas campanhas forem modificadas
5. **Exportação**: Gerar relatórios de auditoria em Excel/PDF
6. **Avatar**: Adicionar foto de perfil dos usuários
7. **Busca por Responsável**: Filtrar campanhas por quem criou ou atualizou


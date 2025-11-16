# Sistema de Associação de Usuários

## Visão Geral

O sistema de associação de usuários controla o acesso à plataforma através de três níveis:

1. **Email com domínio válido** → Permite registro
2. **Associação à organização** → Permite acesso aos dados
3. **Permissão de Admin** → Permite gerenciar configurações e usuários

## Fluxo de Acesso do Usuário

### 1. Registro
```
Usuário se registra com email @iasabrasil.com.br
↓
Sistema valida o domínio do email
↓
Conta é criada e email de verificação é enviado
```

### 2. Verificação de Email
```
Usuário clica no link do email
↓
Email é verificado no Firebase Auth
↓
Usuário pode fazer login
```

### 3. Aguardando Associação
```
Usuário faz login com email verificado
↓
Sistema verifica se está associado à organização
↓
Se NÃO → Redireciona para página de "Aguardando Aprovação"
Se SIM → Acessa a plataforma normalmente
```

### 4. Associação pelo Admin
```
Admin acessa painel Admin → Usuários da Organização
↓
Visualiza usuário "Não associado"
↓
Clica em "Associar"
↓
Usuário agora pode acessar os dados da organização
```

## Tabela de Estados

| Email Válido | Email Verificado | Associado | Pode Acessar? | Tela Exibida |
|--------------|------------------|-----------|---------------|--------------|
| ❌ | - | - | ❌ | Erro ao registrar |
| ✅ | ❌ | - | ❌ | Verificar Email |
| ✅ | ✅ | ❌ | ❌ | Aguardando Associação |
| ✅ | ✅ | ✅ | ✅ | Dashboard (Clientes/Campanhas) |

## Componentes do Sistema

### Frontend

#### 1. `OrganizationContext.tsx`
- Fornece dados da organização
- Expõe `isAssociated` e `isAdmin`
- Carrega organização do usuário logado

#### 2. `PrivateRoute.tsx`
- Protege rotas privadas
- Verifica autenticação → verificação de email → associação
- Redireciona para página apropriada

#### 3. `PendingAssociationPage.tsx`
- Página exibida para usuários não associados
- Permite verificar novamente o status
- Opção para fazer logout

#### 4. `OrganizationSettingsPage.tsx` (Admin)
- Lista todos os usuários com email do domínio
- Mostra status de associação
- Permite associar/desassociar usuários
- Permite promover/rebaixar admins

### Backend (Firestore)

#### Coleção: `organizationMembers`

**ID do documento:** `${userId}_${organizationId}` (ID previsível)

**Estrutura:**
```typescript
{
  userId: string
  organizationId: string
  email: string
  name: string
  role: 'admin' | 'member' | 'viewer'
  status: 'active' | 'inactive' | 'invited' | 'suspended'
  joinedAt: Timestamp
  invitedBy: string
  permissions: string[]
}
```

**Por que ID previsível?**
- Permite verificação eficiente nas Firestore Rules
- Evita queries complexas
- Garante unicidade (um usuário por organização)

#### Firestore Rules

```javascript
function isMemberOf(orgId) {
  let memberId = request.auth.uid + '_' + orgId;
  return exists(/databases/$(database)/documents/organizationMembers/$(memberId))
    && get(/databases/$(database)/documents/organizationMembers/$(memberId)).data.status == 'active';
}
```

Todas as coleções que contêm dados organizacionais (companies, campaigns, etc.) usam essa função para verificar acesso.

## Funções Principais

### `getOrganizationUsers(organizationId)`
- Lista todos os usuários com email do domínio da organização
- Retorna informações de associação e permissão
- Ordena por: associados primeiro, depois por nome

### `associateUserToOrganization(organizationId, userId, userEmail, currentUserId)`
- Associa usuário à organização
- Cria ou reativa registro em `organizationMembers`
- Apenas admins podem executar

**Validações:**
- Verifica se currentUserId é admin
- Usa ID previsível para evitar duplicatas

### `disassociateUserFromOrganization(organizationId, userId, currentUserId)`
- Remove acesso do usuário
- Marca registro como `inactive`
- Apenas admins podem executar

**Validações:**
- Verifica se currentUserId é admin
- Não permite desassociar admins (precisa remover admin primeiro)
- Não permite auto-desassociação

### `updateUserRole(organizationId, userId, newRole, currentUserId)`
- Altera permissão entre 'admin' e 'member'
- Atualiza array `adminUsers` na organização

**Validações:**
- Apenas admins podem alterar permissões
- Não pode remover o último admin

## Segurança

### Níveis de Proteção

1. **Frontend (React Router)**
   - `PrivateRoute` verifica autenticação, verificação e associação
   - Redireciona usuários não autorizados

2. **Backend (Firestore Rules)**
   - Valida domínio de email
   - Verifica associação ativa via `isMemberOf()`
   - Verifica permissões de admin via `isAdminOf()`

3. **Lógica de Negócio (Cloud Functions - futuro)**
   - Notificações quando usuário é associado
   - Auditoria de mudanças de permissão
   - Limpeza automática de usuários inativos

### Proteção Contra Ataques

| Ataque | Proteção |
|--------|----------|
| Registro com email não corporativo | Validação de domínio no frontend e backend |
| Acesso sem email verificado | Redirect para `/verificar-email` |
| Acesso sem associação | Redirect para `/aguardando-associacao` |
| Modificação direta no Firestore | Rules verificam `isMemberOf()` e `isAdminOf()` |
| Escalação de privilégios | Validações impedem auto-promoção |
| Remoção do último admin | Validação impede operação |

## Fluxo de Dados

```mermaid
graph TD
    A[Usuário faz login] --> B{Email verificado?}
    B -->|Não| C[/verificar-email]
    B -->|Sim| D{getUserOrganization}
    D -->|Retorna null| E[/aguardando-associacao]
    D -->|Retorna org| F[OrganizationContext]
    F --> G{isAssociated?}
    G -->|false| E
    G -->|true| H[Dashboard]
    
    I[Admin acessa /admin] --> J[getOrganizationUsers]
    J --> K[Lista com isAssociated]
    K --> L[Admin clica Associar]
    L --> M[associateUserToOrganization]
    M --> N[Cria doc userId_orgId]
    N --> O[status: active]
```

## Exemplo de Uso

### Cenário: Novo Colaborador

1. **Colaborador** registra-se com `joao@iasabrasil.com.br`
2. **Sistema** envia email de verificação
3. **Colaborador** clica no link e verifica email
4. **Colaborador** faz login
5. **Sistema** detecta que não está associado
6. **Sistema** exibe "Aguardando Aprovação"
7. **Admin** recebe notificação (futuro)
8. **Admin** acessa painel e clica "Associar"
9. **Sistema** cria registro `joao_iasa_orgId` com `status: active`
10. **Colaborador** clica "Verificar Novamente"
11. **Sistema** carrega organização com sucesso
12. **Colaborador** acessa dashboard normalmente

### Cenário: Promover para Admin

1. **Admin** acessa painel
2. **Admin** localiza usuário na lista
3. **Admin** clica "Tornar Admin"
4. **Sistema** adiciona userId ao array `adminUsers` da organização
5. **Usuário** agora vê menu "Admin" na sidebar
6. **Usuário** pode gerenciar configurações e usuários

## Melhorias Futuras

### 1. Notificações
- Email quando usuário é associado
- Notificação in-app para admins sobre novos registros

### 2. Auditoria
- Log de todas as mudanças de permissão
- Histórico de quem associou/desassociou usuários

### 3. Convites
- Admin pode convidar usuários por email
- Usuário recebe link para registro pré-aprovado

### 4. Múltiplas Organizações
- Usuário pode pertencer a várias organizações
- Seletor de organização no frontend

### 5. Permissões Granulares
- Permissões específicas por recurso (clientes, campanhas)
- Roles customizados além de admin/member

## Troubleshooting

### Usuário não consegue acessar após associação

**Sintomas:** Página de "Aguardando Aprovação" mesmo após admin associar

**Solução:**
1. Verificar se documento `userId_orgId` existe no Firestore
2. Confirmar que `status: 'active'`
3. Usuário deve clicar em "Verificar Novamente" ou fazer novo login

### Admin não consegue desassociar usuário

**Sintomas:** Botão "Desassociar" desabilitado

**Possíveis causas:**
- Tentando desassociar outro admin → Remover permissão de admin primeiro
- Tentando desassociar a si mesmo → Não permitido

### Firestore Rules bloqueando acesso

**Sintomas:** Erro de permissão ao acessar dados

**Verificações:**
1. Documento `userId_orgId` existe?
2. Campo `status` é `'active'`?
3. OrganizationId no documento de dados corresponde?

**Debug:**
```javascript
// No console do navegador
const { userId } = auth.currentUser;
const { organizationId } = organization;
const memberId = `${userId}_${organizationId}`;
const memberDoc = await getDoc(doc(db, 'organizationMembers', memberId));
console.log('Member doc:', memberDoc.exists(), memberDoc.data());
```

## Referências

- [Documentação Multi-Tenant](./MULTI_TENANT_STRUCTURE.md)
- [Verificação de Email](./EMAIL_VERIFICATION.md)
- [Firestore Rules](../firestore-rules-multi-tenant.rules)
- [Tipos TypeScript](../src/types/organization.ts)


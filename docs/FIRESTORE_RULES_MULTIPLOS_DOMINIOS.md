# Firestore Rules - Múltiplos Domínios

## 📋 Exemplo com Múltiplos Domínios

Quando você tiver múltiplos domínios corporativos, use esta estrutura nas regras do Firestore:

### Opção 1: Função Helper (Recomendado)

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Função helper para validar domínios permitidos
    function isAllowedEmailDomain(email) {
      return email.matches('.*@iasabrasil\\.com\\.br$') ||
             email.matches('.*@empresa2\\.com\\.br$') ||
             email.matches('.*@empresa3\\.com$');
    }
    
    // ===== COMPANIES (Clientes) =====
    match /companies/{companyId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null
        && request.resource.data.createdBy == request.auth.uid
        && request.resource.data.cnpj is string
        && request.resource.data.name is string
        && request.resource.data.address is string
        && request.resource.data.type in ['headquarters', 'branch']
        && request.resource.data.status in ['active', 'closed', 'suspended'];
      allow update: if request.auth != null
        && request.resource.data.cnpj == resource.data.cnpj;
      allow delete: if request.auth != null
        && resource.data.createdBy == request.auth.uid;
    }
    
    // ===== CAMPAIGNS =====
    match /campaigns/{campaignId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null
        && request.resource.data.createdBy == request.auth.uid
        && request.resource.data.updatedBy == request.auth.uid
        && request.resource.data.name is string
        && request.resource.data.sender is string
        && request.resource.data.observation is string
        && request.resource.data.status in ['draft', 'active', 'completed', 'cancelled'];
      allow update: if request.auth != null
        && request.resource.data.updatedBy == request.auth.uid
        && request.resource.data.createdBy == resource.data.createdBy;
      allow delete: if request.auth != null
        && resource.data.createdBy == request.auth.uid;
    }
    
    // ===== CAMPAIGN_CLIENTS (Futuro) =====
    match /campaignClients/{campaignClientId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
      allow delete: if request.auth != null;
    }
    
    // ===== SEALS (Futuro) =====
    match /seals/{sealId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
      allow delete: if request.auth != null;
    }
    
    // ===== USERS (Perfis de Usuários) =====
    match /users/{userId} {
      allow read: if request.auth != null;
      
      // Usar a função helper para validar domínio
      allow create, update: if request.auth != null
        && request.auth.uid == userId
        && isAllowedEmailDomain(request.auth.token.email);
      
      allow delete: if false;
    }
  }
}
```

### Opção 2: Lista de Domínios (Mais Limpo)

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Lista de domínios permitidos como constante
    function getAllowedDomains() {
      return [
        '@iasabrasil.com.br',
        '@empresa2.com.br',
        '@empresa3.com'
      ];
    }
    
    // Função para verificar se o email termina com algum domínio permitido
    function isAllowedEmailDomain(email) {
      // Itera sobre cada domínio permitido
      return email.matches('.*@iasabrasil\\.com\\.br$') ||
             email.matches('.*@empresa2\\.com\\.br$') ||
             email.matches('.*@empresa3\\.com$');
    }
    
    // ... resto das regras igual ao exemplo anterior
  }
}
```

## 📝 Passos para Adicionar um Novo Domínio

1. **Adicione o domínio no frontend** (`src/lib/email-domains.ts`):
```typescript
export const ALLOWED_EMAIL_DOMAINS = [
  '@iasabrasil.com.br',
  '@novodominio.com.br',  // ← ADICIONE AQUI
] as const
```

2. **Adicione o domínio nas Firestore Rules** (`firestore.rules`):
```javascript
function isAllowedEmailDomain(email) {
  return email.matches('.*@iasabrasil\\.com\\.br$') ||
         email.matches('.*@novodominio\\.com\\.br$');  // ← ADICIONE AQUI
}
```

3. **Faça o deploy das regras**:
```bash
firebase deploy --only firestore:rules
```

## ⚠️ Importante

- **Escape os pontos**: Use `\\.` em vez de `.` nas regex
- **Use o cifrão**: Termine a regex com `$` para garantir que o domínio está no final
- **Use `.*` no início**: Para capturar qualquer caractere antes do @

## 🧪 Testando as Regras

Você pode testar as regras no Firebase Console:

1. Acesse o Firebase Console
2. Vá em **Firestore Database** → **Rules**
3. Clique em **Rules Playground**
4. Teste com diferentes emails

Exemplo de teste:
```
Location: /users/test123
Method: create
Authenticated: Yes
Auth UID: test123
Auth Token Email: joao@iasabrasil.com.br
```

## 🔍 Validação de Regex

Para testar suas regex, use sites como:
- https://regex101.com/
- https://regexr.com/

Padrão de regex para domínios:
```
.*@iasabrasil\.com\.br$
```

Exemplos de emails que devem corresponder:
- ✅ `joao@iasabrasil.com.br`
- ✅ `maria.silva@iasabrasil.com.br`
- ✅ `admin+test@iasabrasil.com.br`
- ❌ `joao@gmail.com`
- ❌ `maria@iasabrasil.com.br.fake.com`


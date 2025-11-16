# 🔒 Configurar Regras de Segurança do Firestore

## ❌ Erro Atual

```
Missing or insufficient permissions
```

Este erro acontece porque o Firestore **não tem permissão** para ler/escrever dados. Você precisa configurar as regras de segurança.

## ✅ Solução: Configurar no Firebase Console

### Passo 1: Acessar o Firebase Console

1. Acesse: https://console.firebase.google.com/
2. Selecione seu projeto (SealHub)

### Passo 2: Navegar até Firestore

1. No menu lateral esquerdo, clique em **"Build"** (Criar)
2. Clique em **"Firestore Database"**

### Passo 3: Abrir Regras de Segurança

1. Clique na aba **"Rules"** (Regras) no topo
2. Você verá um editor de código

### Passo 4: Substituir as Regras

**OPÇÃO A: Regras de Produção (Recomendado)**

Cole o seguinte código:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // COMPANIES (Clientes)
    match /companies/{companyId} {
      // Qualquer usuário autenticado pode ler
      allow read: if request.auth != null;
      
      // Qualquer usuário autenticado pode criar
      allow create: if request.auth != null
        && request.resource.data.createdBy == request.auth.uid
        && request.resource.data.cnpj is string
        && request.resource.data.name is string;
      
      // Qualquer usuário autenticado pode atualizar
      allow update: if request.auth != null;
      
      // Apenas o criador pode deletar
      allow delete: if request.auth != null
        && resource.data.createdBy == request.auth.uid;
    }
    
    // CAMPAIGNS (Para futuro uso)
    match /campaigns/{campaignId} {
      allow read, write: if request.auth != null;
    }
    
    match /campaignClients/{campaignClientId} {
      allow read, write: if request.auth != null;
    }
    
    match /seals/{sealId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**OPÇÃO B: Regras de Desenvolvimento (Apenas para Testes)**

⚠️ **ATENÇÃO**: Use APENAS em ambiente de desenvolvimento!

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Passo 5: Publicar as Regras

1. Clique no botão **"Publish"** (Publicar) no topo
2. Aguarde a confirmação: "Rules updated successfully"

### Passo 6: Testar

1. Volte para o SealHub
2. Faça login
3. Tente buscar um CNPJ novamente
4. O erro deve desaparecer! ✅

## 🔍 Como Saber se Funcionou?

Execute este teste:

1. **Login** → Deve funcionar normalmente
2. **Adicionar Cliente** → Digite CNPJ → Buscar
3. **Resultado Esperado**: 
   - Se CNPJ não existe: Exibe dados da Receita Federal
   - Se CNPJ já existe: Mostra mensagem "CNPJ já cadastrado"

## 🚨 Troubleshooting

### Erro persiste após publicar as regras?

1. **Aguarde 1-2 minutos** - As regras levam tempo para propagar
2. **Limpe o cache do navegador** - `Cmd + Shift + R` (Mac) ou `Ctrl + Shift + R` (Windows)
3. **Faça logout e login novamente** - Isso renova o token de autenticação
4. **Verifique se está logado** - Abra o Console do navegador e digite:
   ```javascript
   firebase.auth().currentUser
   ```
   Deve retornar um objeto com dados do usuário

### Erro: "Firebase: Error (auth/configuration-not-found)"

Você precisa habilitar o Authentication:

1. Firebase Console → **Authentication**
2. Clique em **"Get Started"**
3. Habilite **"Email/Password"** e **"Google"**

### Erro: "Firestore is not initialized"

Verifique se as variáveis de ambiente estão configuradas:

```bash
# .env.local
VITE_FIREBASE_API_KEY=sua_api_key
VITE_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu_projeto_id
VITE_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
VITE_FIREBASE_APP_ID=seu_app_id
```

## 📚 Entendendo as Regras

### O que significa `request.auth != null`?

- ✅ Permite acesso apenas para **usuários autenticados**
- ❌ Bloqueia acesso para **usuários não logados**

### O que significa `resource.data.createdBy == request.auth.uid`?

- ✅ Permite que apenas o **criador do documento** possa deletá-lo
- ❌ Outros usuários não podem deletar (mesmo autenticados)

### Por que usar regras de produção?

- 🔒 **Segurança**: Previne acesso não autorizado
- 📊 **Validação**: Garante que dados estejam corretos
- 💰 **Economia**: Reduz leituras/escritas desnecessárias
- 🐛 **Debug**: Facilita identificar problemas

## 🎯 Próximos Passos

Após configurar as regras:

1. ✅ Teste adicionar um cliente
2. ✅ Teste buscar clientes
3. ✅ Teste editar um cliente
4. ✅ Teste deletar um cliente

Se tudo funcionar, você está pronto para implementar as campanhas! 🚀

## 📞 Suporte

Se o erro persistir, verifique:

1. Console do navegador (F12 → Console)
2. Firebase Console → Firestore → Usage (para ver se há atividade)
3. Firebase Console → Authentication → Users (verificar se usuário está cadastrado)

```bash
# Ver logs do Firebase no terminal
npm run dev
```

Procure por mensagens como:
- ✅ "Firestore initialized"
- ❌ "Permission denied"
- ❌ "Missing or insufficient permissions"


# Configuração de Domínios de Email Permitidos

## 📋 Visão Geral

O sistema possui validação de domínios de email para controlar quem pode se registrar na plataforma. Apenas emails de domínios corporativos específicos são permitidos.

## ✅ Domínios Atualmente Permitidos

- `@iasabrasil.com.br`

## 🔧 Como Adicionar Novos Domínios

### 1. Frontend (TypeScript)

Edite o arquivo `/src/lib/email-domains.ts`:

```typescript
export const ALLOWED_EMAIL_DOMAINS = [
  '@iasabrasil.com.br',
  '@novodominio.com.br',  // Adicione aqui
  '@outrodominio.com',    // Adicione quantos precisar
] as const
```

### 2. Backend (Firestore Rules)

Edite o arquivo `/firestore.rules`:

```javascript
// Encontre a seção de USERS e atualize a regex:
allow create, update: if request.auth != null
  && request.auth.uid == userId
  && (
    request.auth.token.email.matches('.*@iasabrasil\\.com\\.br$') ||
    request.auth.token.email.matches('.*@novodominio\\.com\\.br$') ||
    request.auth.token.email.matches('.*@outrodominio\\.com$')
  );
```

**Importante:** Não esqueça de escapar os pontos com `\\.` nas regras do Firestore!

### 3. Deploy das Regras

Após atualizar as regras do Firestore, faça o deploy:

```bash
firebase deploy --only firestore:rules
```

## 🛡️ Como Funciona a Validação

### Camadas de Segurança

1. **Frontend (RegisterPage.tsx)**
   - Valida o domínio antes de enviar o formulário
   - Mostra mensagens amigáveis ao usuário
   - Previne tentativas desnecessárias de registro

2. **Frontend (AuthContext.tsx)**
   - Valida no registro com email/senha
   - Valida no login com Google
   - Faz logout automático se o domínio não for permitido

3. **Backend (Firestore Rules)**
   - Valida no lado do servidor
   - Impede criação/atualização de perfis com domínios não autorizados
   - Última linha de defesa contra tentativas maliciosas

## 📝 Exemplos de Uso

### Exemplo 1: Email Válido
- Email: `joao.silva@iasabrasil.com.br`
- ✅ Registro permitido

### Exemplo 2: Email Inválido
- Email: `joao.silva@gmail.com`
- ❌ Registro bloqueado
- Mensagem: "Apenas emails corporativos @iasabrasil.com.br são permitidos."

### Exemplo 3: Login com Google
- Usuário tenta fazer login com conta Google pessoal
- ✅ Login é feito no Firebase
- ❌ Sistema detecta domínio inválido
- ✅ Logout automático é executado
- ❌ Mensagem de erro é exibida

## 🔍 Testando a Validação

### Teste 1: Registro com Email Corporativo
1. Acesse a página de registro
2. Preencha com email `@iasabrasil.com.br`
3. Deve funcionar normalmente

### Teste 2: Registro com Email Pessoal
1. Acesse a página de registro
2. Preencha com email `@gmail.com`
3. Deve mostrar erro: "Email não permitido"

### Teste 3: Login com Google
1. Tente fazer login com conta Google corporativa
2. Deve funcionar normalmente
3. Tente com conta Google pessoal
4. Deve fazer logout automático e mostrar erro

## 📱 Interface do Usuário

### Mudanças Visuais

- **Label do campo:** "Email corporativo" (anteriormente "Email")
- **Placeholder:** "seu@iasabrasil.com.br"
- **Texto de ajuda:** "Apenas emails corporativos são permitidos"
- **Mensagem de erro:** Mostra os domínios permitidos

## 🚀 Expansão Futura

Para adicionar suporte a múltiplos domínios de diferentes empresas:

### Opção 1: Organizações (Recomendado)
- Criar coleção `organizations` no Firestore
- Cada organização tem seus domínios permitidos
- Usuários são associados a uma organização
- Permite gestão mais granular

### Opção 2: Domínios Dinâmicos
- Armazenar lista de domínios no Firestore
- Carregar dinamicamente no frontend
- Atualizar sem precisar fazer deploy
- Requer mais cuidado com segurança

### Opção 3: Whitelist de Emails
- Em vez de domínios, permitir emails específicos
- Útil para consultores ou parceiros externos
- Mais trabalho de manutenção

## ⚠️ Considerações Importantes

1. **Sincronização**: Sempre mantenha frontend e backend sincronizados
2. **Deploy**: Lembre-se de fazer deploy das regras do Firestore
3. **Testes**: Teste com emails válidos e inválidos após mudanças
4. **Usuários Existentes**: Usuários já registrados não são afetados
5. **Case Sensitivity**: A validação é case-insensitive (`toLowerCase()`)

## 🐛 Troubleshooting

### Problema: Usuário com domínio correto não consegue se registrar
**Solução**: Verifique se o domínio está corretamente configurado nos dois lugares (TypeScript e Firestore Rules)

### Problema: Regras do Firestore dão erro após deploy
**Solução**: Verifique se você escapou corretamente os pontos (`\\.`) na regex

### Problema: Login com Google não valida o domínio
**Solução**: Verifique se o código de validação está presente no `loginWithGoogle()` do `AuthContext.tsx`

## 📞 Suporte

Para dúvidas ou problemas, consulte:
- Documentação do Firebase Auth: https://firebase.google.com/docs/auth
- Documentação do Firestore Rules: https://firebase.google.com/docs/firestore/security/get-started


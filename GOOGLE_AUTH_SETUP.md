# 🔥 Configuração do Google Sign-In no Firebase

## Passo 1: Habilitar Google Sign-In no Firebase Console

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto **sealhub-72985**
3. No menu lateral, clique em **Authentication** (Autenticação)
4. Clique na aba **Sign-in method** (Método de login)
5. Na lista de provedores, clique em **Google**
6. **Ative** a opção "Enable" (Habilitar)
7. Configure:
   - **Project support email**: Selecione um email do projeto
   - O resto das configurações já vem preenchido automaticamente
8. Clique em **Save** (Salvar)

## Passo 2: Configurar domínios autorizados (opcional, só para produção)

Por padrão, `localhost` já está autorizado para desenvolvimento. Para produção:

1. Na mesma página de **Authentication**
2. Role até **Authorized domains** (Domínios autorizados)
3. Clique em **Add domain** (Adicionar domínio)
4. Adicione seu domínio de produção (ex: `sealhub.com.br`)
5. Clique em **Add** (Adicionar)

## ✅ Pronto!

Agora você pode testar o login com Google:

```bash
npm run dev
```

Acesse: `http://localhost:5173/login` e clique no botão **"Continuar com Google"**

## 🎨 O que foi implementado

### ✅ Páginas Atualizadas

1. **LoginPage** - Agora tem botão "Continuar com Google"
2. **RegisterPage** - Também tem botão "Continuar com Google"

### ✅ Funcionalidades

- ✅ Login com Google usando pop-up
- ✅ Prompt "select_account" (permite escolher a conta Google)
- ✅ Tratamento completo de erros em português
- ✅ Loading states separados para cada método
- ✅ Redirecionamento automático após login
- ✅ Integração completa com o sistema existente

### ✅ Tratamento de Erros

O sistema trata os seguintes cenários:
- Pop-up fechado pelo usuário
- Pop-up bloqueado pelo navegador
- Conta já existe com outro método de login
- Erro de conexão
- Cancelamento de popup

## 🔒 Segurança

- O Firebase gerencia toda a autenticação OAuth
- Nenhuma senha ou token é armazenado localmente
- Autenticação server-side gerenciada pelo Firebase
- Suporte a múltiplos métodos de login (Email/Senha + Google)

## 🎯 Fluxo de Autenticação

1. Usuário clica em "Continuar com Google"
2. Pop-up do Google é aberto
3. Usuário escolhe a conta Google
4. Firebase valida a autenticação
5. Usuário é redirecionado para `/clientes`
6. Sessão é persistida automaticamente

## 📝 Notas Importantes

- O primeiro login com Google cria automaticamente um usuário no Firebase
- O nome do usuário é obtido do perfil do Google
- O email do Google é usado como email principal
- Não é necessário senha para login com Google
- A sessão persiste mesmo após recarregar a página

## 🚀 Testando

1. Habilite Google Sign-In no Firebase Console (Passo 1 acima)
2. Execute: `npm run dev`
3. Acesse: `http://localhost:5173/login`
4. Clique em "Continuar com Google"
5. Escolha sua conta Google
6. Você será redirecionado para a página de clientes!

## 🔄 Compatibilidade

- ✅ Email/Password + Google funcionam juntos
- ✅ Usuário pode ter ambos os métodos vinculados
- ✅ Logout funciona para ambos os métodos
- ✅ Persistência de sessão funciona normalmente

---

**Tudo pronto para usar o Google Sign-In!** 🎉


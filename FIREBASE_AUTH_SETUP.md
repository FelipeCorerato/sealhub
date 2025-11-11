# 🔥 Configuração do Firebase Authentication

## Passo 1: Habilitar Email/Password no Firebase Console

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto **sealhub-72985**
3. No menu lateral, clique em **Authentication** (Autenticação)
4. Clique na aba **Sign-in method** (Método de login)
5. Clique em **Email/Password**
6. **Ative** a opção **Email/Password**
7. Clique em **Salvar**

## Passo 2: Criar seu primeiro usuário

Existem duas formas de criar usuários:

### Opção A: Através do Console Firebase (Recomendado para primeiro usuário)

1. Na página de **Authentication**
2. Clique na aba **Users** (Usuários)
3. Clique em **Add user** (Adicionar usuário)
4. Preencha:
   - **Email**: seu@email.com
   - **Password**: sua_senha_segura
5. Clique em **Add user**

### Opção B: Através da tela de registro da aplicação

1. Execute o projeto: `npm run dev`
2. Acesse: `http://localhost:5173/registro`
3. Preencha o formulário de registro
4. Clique em "Criar conta"

## ✅ Pronto!

Agora você pode fazer login na aplicação usando:
- **URL de Login**: `http://localhost:5173/login`
- **Email**: o email que você cadastrou
- **Senha**: a senha que você definiu

## 📚 Recursos do Sistema de Autenticação

O sistema implementado inclui:

✅ **Login com Email/Senha**
✅ **Registro de novos usuários**
✅ **Logout**
✅ **Persistência de sessão** (Firebase gerencia automaticamente)
✅ **Proteção de rotas** (rotas privadas redirecionam para login)
✅ **Tratamento de erros** (mensagens amigáveis em português)
✅ **Loading states** (indicadores visuais durante operações)

## 🔒 Segurança

- As senhas são criptografadas automaticamente pelo Firebase
- O Firebase gerencia tokens de autenticação de forma segura
- As credenciais nunca são armazenadas no localStorage
- O Firebase Authentication é certificado e segue as melhores práticas de segurança

## 🛠️ Como funciona

1. **Login**: `signInWithEmailAndPassword()` do Firebase Auth
2. **Registro**: `createUserWithEmailAndPassword()` do Firebase Auth
3. **Logout**: `signOut()` do Firebase Auth
4. **Monitoramento de Estado**: `onAuthStateChanged()` detecta automaticamente login/logout
5. **Persistência**: Firebase gerencia a sessão automaticamente

## 📝 Próximos Passos (Opcional)

Se você quiser adicionar mais funcionalidades de autenticação:

- [ ] Recuperação de senha (Forgot Password)
- [ ] Login com Google
- [ ] Login com GitHub
- [ ] Verificação de email
- [ ] Atualização de perfil (nome, foto)

Consulte a [documentação do Firebase Auth](https://firebase.google.com/docs/auth) para mais informações.


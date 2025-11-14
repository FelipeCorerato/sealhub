# 🚨 Como Resolver o Erro de Deploy

## ❌ Erro que Você Está Vendo

```
Error: Input required and not supplied: firebaseServiceAccount
```

## ✅ Solução em 3 Passos

### 🎯 SOLUÇÃO MAIS FÁCIL (Recomendado!)

Execute **UM comando** que faz tudo automaticamente:

```bash
npx firebase init hosting:github
```

**Isso vai:**
- ✅ Criar a service account
- ✅ Adicionar o secret no GitHub automaticamente
- ✅ Configurar tudo pra você

**Pronto!** Depois é só fazer push novamente.

---

### 📋 Ou Siga Estes Passos Manuais:

#### 1️⃣ Gerar Service Account

1. Acesse: https://console.firebase.google.com/project/sealhub-72985/settings/serviceaccounts/adminsdk
2. Clique no botão **"Generate new private key"**
3. Clique em **"Generate key"** para confirmar
4. Um arquivo JSON será baixado ✅

#### 2️⃣ Adicionar Secret no GitHub

1. Abra o arquivo JSON que foi baixado
2. Copie **TODO** o conteúdo (Ctrl/Cmd + A, depois Ctrl/Cmd + C)
3. Acesse: https://github.com/SEU-USUARIO/sealhub/settings/secrets/actions
   - ⚠️ Troque `SEU-USUARIO` pelo seu username do GitHub
4. Clique em **"New repository secret"**
5. Preencha:
   - **Name**: `FIREBASE_SERVICE_ACCOUNT`
   - **Secret**: Cole o JSON completo aqui
6. Clique em **"Add secret"**

#### 3️⃣ Adicionar Variáveis de Ambiente

No mesmo lugar (Settings > Secrets), adicione mais 7 secrets:

| Nome do Secret | Valor |
|----------------|-------|
| `VITE_FIREBASE_API_KEY` | Copie do seu arquivo `.env` local |
| `VITE_FIREBASE_AUTH_DOMAIN` | `sealhub-72985.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `sealhub-72985` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `sealhub-72985.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Copie do `.env` |
| `VITE_FIREBASE_APP_ID` | Copie do `.env` |
| `VITE_FIREBASE_MEASUREMENT_ID` | Copie do `.env` |

**Onde encontrar esses valores:**
- Seu arquivo `.env` local
- Ou Firebase Console: https://console.firebase.google.com/project/sealhub-72985/settings/general

---

## 🔄 Re-executar o Deploy

Depois de adicionar os secrets:

**Opção 1 - Re-run no GitHub:**
1. Vá em: https://github.com/SEU-USUARIO/sealhub/actions
2. Clique no workflow que falhou
3. Clique em **"Re-run all jobs"**

**Opção 2 - Novo commit:**
```bash
git commit --allow-empty -m "Trigger deploy"
git push origin main
```

---

## ✅ Checklist de Verificação

Antes de tentar novamente, verifique se você tem:

- [ ] Secret `FIREBASE_SERVICE_ACCOUNT` adicionado
- [ ] Secret `VITE_FIREBASE_API_KEY` adicionado
- [ ] Secret `VITE_FIREBASE_AUTH_DOMAIN` adicionado
- [ ] Secret `VITE_FIREBASE_PROJECT_ID` adicionado
- [ ] Secret `VITE_FIREBASE_STORAGE_BUCKET` adicionado
- [ ] Secret `VITE_FIREBASE_MESSAGING_SENDER_ID` adicionado
- [ ] Secret `VITE_FIREBASE_APP_ID` adicionado
- [ ] Secret `VITE_FIREBASE_MEASUREMENT_ID` adicionado

**Para verificar:**
Vá em Settings > Secrets and variables > Actions
Você deve ver 8 secrets listados.

---

## 🆘 Ainda Com Problema?

### Erro: "Permission denied" ou "403"
**Solução:** Verifique se você tem permissão de admin no repositório GitHub

### Erro: "Invalid service account"
**Solução:** Gere uma nova service account e adicione novamente

### Erro: Build falha
**Solução:** Teste localmente primeiro:
```bash
npm run build
```

---

## 📞 Links Úteis

- [Firebase Service Accounts](https://console.firebase.google.com/project/sealhub-72985/settings/serviceaccounts/adminsdk)
- [GitHub Secrets (Substitua SEU-USUARIO)](https://github.com/SEU-USUARIO/sealhub/settings/secrets/actions)
- [GitHub Actions Runs](https://github.com/SEU-USUARIO/sealhub/actions)
- [Guia Completo](./GITHUB_ACTIONS_SETUP.md)
- [Checklist Detalhado](./CHECKLIST_DEPLOY.md)

---

## 💡 Dica Final

**Use o comando automático!** É muito mais fácil e evita erros:

```bash
npx firebase init hosting:github
```

Ele faz tudo pra você em segundos! 🚀


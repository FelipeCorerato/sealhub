# ❌ Erro: firebaseServiceAccount não configurado

## O Problema

```
Error: Input required and not supplied: firebaseServiceAccount
```

Esse erro significa que o secret `FIREBASE_SERVICE_ACCOUNT` não está configurado no GitHub.

## ✅ Solução Rápida

### Opção 1: Configuração Automática (Recomendado!)

Execute este comando que faz TUDO automaticamente:

```bash
npx firebase init hosting:github
```

**O que esse comando faz:**
1. ✅ Cria a service account no Firebase
2. ✅ Adiciona automaticamente o secret `FIREBASE_SERVICE_ACCOUNT` no GitHub
3. ✅ Cria os workflows necessários
4. ✅ Você só precisa autorizar no navegador

**Passo a passo:**
```bash
# 1. Execute o comando
npx firebase init hosting:github

# 2. Perguntas que aparecerão:
# - For which GitHub repository? → seu-usuario/sealhub
# - Set up the workflow to run a build script? → Yes
# - What script? → npm ci && npm run build
# - Set up automatic deployment to your site's live channel? → Yes
# - What is the name of the GitHub branch? → main
# - Set up automatic deployment to preview channels? → Yes (opcional)

# 3. Autorize no navegador quando solicitado
# 4. Pronto! O secret será adicionado automaticamente
```

### Opção 2: Configuração Manual

Se preferir fazer manualmente:

#### 1. Gerar a Service Account

**Via Console Firebase:**
1. Acesse: https://console.firebase.google.com/project/sealhub-72985/settings/serviceaccounts/adminsdk
2. Clique em **"Generate new private key"**
3. Clique em **"Generate key"** para confirmar
4. Um arquivo JSON será baixado (ex: `sealhub-72985-firebase-adminsdk-xxxxx.json`)
5. **GUARDE ESSE ARQUIVO COM SEGURANÇA!**

#### 2. Adicionar o Secret no GitHub

1. Abra o arquivo JSON baixado
2. Copie **TODO O CONTEÚDO** do arquivo
3. Acesse: https://github.com/seu-usuario/sealhub/settings/secrets/actions
4. Clique em **"New repository secret"**
5. Configure:
   - **Name**: `FIREBASE_SERVICE_ACCOUNT`
   - **Value**: Cole todo o conteúdo do arquivo JSON
   - Exemplo do conteúdo:
   ```json
   {
     "type": "service_account",
     "project_id": "sealhub-72985",
     "private_key_id": "abc123...",
     "private_key": "-----BEGIN PRIVATE KEY-----\n...",
     "client_email": "firebase-adminsdk-xxxxx@sealhub-72985.iam.gserviceaccount.com",
     ...
   }
   ```
6. Clique em **"Add secret"**

#### 3. Adicionar Variáveis de Ambiente

Você também precisa adicionar as variáveis `VITE_*` como secrets:

Para cada variável abaixo, repita o processo:
- Settings > Secrets and variables > Actions > New repository secret

**Secrets necessários:**

| Nome do Secret | Onde Encontrar |
|----------------|----------------|
| `VITE_FIREBASE_API_KEY` | Firebase Console > Project Settings > Your apps |
| `VITE_FIREBASE_AUTH_DOMAIN` | `sealhub-72985.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `sealhub-72985` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `sealhub-72985.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase Console > Project Settings |
| `VITE_FIREBASE_APP_ID` | Firebase Console > Project Settings |
| `VITE_FIREBASE_MEASUREMENT_ID` | Firebase Console > Project Settings (Analytics) |

**Como encontrar essas informações:**
1. Acesse: https://console.firebase.google.com/project/sealhub-72985/settings/general
2. Vá em "Your apps" ou "Seus apps"
3. Clique no app web (ícone `</>`)
4. Copie os valores da configuração

Ou copie do seu arquivo `.env` local (mas **NUNCA** commite o `.env`!)

## 🔄 Após Configurar

1. **Verificar secrets adicionados:**
   - Acesse: https://github.com/seu-usuario/sealhub/settings/secrets/actions
   - Deve ter:
     - ✅ `FIREBASE_SERVICE_ACCOUNT`
     - ✅ `VITE_FIREBASE_API_KEY`
     - ✅ `VITE_FIREBASE_AUTH_DOMAIN`
     - ✅ `VITE_FIREBASE_PROJECT_ID`
     - ✅ `VITE_FIREBASE_STORAGE_BUCKET`
     - ✅ `VITE_FIREBASE_MESSAGING_SENDER_ID`
     - ✅ `VITE_FIREBASE_APP_ID`
     - ✅ `VITE_FIREBASE_MEASUREMENT_ID`

2. **Re-executar o workflow:**
   - Vá em: Actions > Deploy to Firebase Hosting
   - Clique em "Re-run all jobs"
   - Ou faça um novo push:
   ```bash
   git commit --allow-empty -m "Trigger deploy após configurar secrets"
   git push origin main
   ```

## ✅ Checklist Final

- [ ] Service account criada
- [ ] Secret `FIREBASE_SERVICE_ACCOUNT` adicionado no GitHub
- [ ] Todos os secrets `VITE_*` adicionados
- [ ] Workflow re-executado
- [ ] Deploy bem-sucedido ✨

## 🎯 Teste Rápido

Após adicionar os secrets, você pode testar:

```bash
# Fazer um commit vazio para trigger
git commit --allow-empty -m "Test deploy"
git push origin main
```

Depois acompanhe em: https://github.com/seu-usuario/sealhub/actions

## 🆘 Ainda com Problemas?

### Verificar se os secrets foram adicionados corretamente:

1. Settings > Secrets and variables > Actions
2. Você deve ver os nomes dos secrets (não os valores)
3. Se falta algum, adicione

### Verificar permissões do workflow:

1. Settings > Actions > General
2. Em "Workflow permissions":
   - ✅ Selecione "Read and write permissions"
3. Save

### Testar localmente:

```bash
# Verificar se o build funciona
npm run build

# Deve criar a pasta dist/ sem erros
ls dist/
```

## 📚 Links Úteis

- [Service Accounts](https://console.firebase.google.com/project/sealhub-72985/settings/serviceaccounts/adminsdk)
- [Firebase Project Settings](https://console.firebase.google.com/project/sealhub-72985/settings/general)
- [GitHub Secrets](https://github.com/seu-usuario/sealhub/settings/secrets/actions)
- [GitHub Actions Runs](https://github.com/seu-usuario/sealhub/actions)

---

**💡 Dica:** Use a Opção 1 (comando automático) para evitar erros manuais!


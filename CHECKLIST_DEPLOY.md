# ✅ Checklist de Deploy - GitHub Actions

Use este checklist para configurar o deploy automático no Firebase via GitHub Actions.

## 📋 Checklist de Configuração

### 1️⃣ Pré-requisitos
- [ ] Projeto criado no Firebase (sealhub-72985)
- [ ] Repositório no GitHub
- [ ] Firebase Tools instalado localmente (`npm install`)

### 2️⃣ Gerar Service Account do Firebase ⚠️ CRÍTICO

**⚡ Opção A: Automático (MUITO MAIS FÁCIL!)**

Execute este comando que faz TUDO automaticamente:

```bash
npx firebase init hosting:github
```

- [ ] Execute o comando acima
- [ ] Responda as perguntas:
  - Repository: `seu-usuario/sealhub`
  - Build script: `npm ci && npm run build`
  - Deploy to live on main: `Yes`
  - PR previews: `Yes` (opcional)
- [ ] Autorize no navegador quando solicitado
- [ ] ✨ O secret será adicionado AUTOMATICAMENTE no GitHub!

**Se usar a Opção A, PULE para o passo 4️⃣**

---

**🔧 Opção B: Manual (mais trabalhoso)**

- [ ] Acesse: https://console.firebase.google.com/project/sealhub-72985/settings/serviceaccounts/adminsdk
- [ ] Clique: **Generate new private key**
- [ ] Confirme: **Generate key**
- [ ] Salve o arquivo JSON baixado
- [ ] **IMPORTANTE**: Copie TODO o conteúdo do JSON (não só parte dele!)

### 3️⃣ Configurar Secrets no GitHub ⚠️ OBRIGATÓRIO

**⚠️ Se usou a Opção A (automático), este secret já foi adicionado! Pule este passo.**

#### Service Account (OBRIGATÓRIO)
- [ ] Acesse: https://github.com/seu-usuario/sealhub/settings/secrets/actions
- [ ] Clique: **New repository secret**
- [ ] Configure:
  - **Name**: `FIREBASE_SERVICE_ACCOUNT`
  - **Value**: Cole **TODO** o conteúdo do arquivo JSON
  - ⚠️ Cole o JSON completo, incluindo as chaves `{...}`
  - ⚠️ Deve começar com `{"type":"service_account",...}`
- [ ] Clique: **Add secret**
- [ ] **VERIFIQUE**: O secret deve aparecer na lista com o nome `FIREBASE_SERVICE_ACCOUNT`

#### Variáveis de Ambiente

Adicione cada variável como secret:

- [ ] `VITE_FIREBASE_API_KEY`
- [ ] `VITE_FIREBASE_AUTH_DOMAIN`
- [ ] `VITE_FIREBASE_PROJECT_ID`
- [ ] `VITE_FIREBASE_STORAGE_BUCKET`
- [ ] `VITE_FIREBASE_MESSAGING_SENDER_ID`
- [ ] `VITE_FIREBASE_APP_ID`
- [ ] `VITE_FIREBASE_MEASUREMENT_ID`

**Como adicionar:**
1. Settings > Secrets and variables > Actions
2. New repository secret
3. Name: nome da variável
4. Value: valor da variável
5. Add secret

**Onde encontrar os valores:**
- Firebase Console: https://console.firebase.google.com/project/sealhub-72985/settings/general
- Ou copie do seu arquivo `.env` local

### 4️⃣ Configurar Permissões

- [ ] Settings > **Actions** > **General**
- [ ] Workflow permissions:
  - ✅ **Read and write permissions**
- [ ] Save

### 5️⃣ Verificar Arquivos no Repositório

- [ ] `.github/workflows/deploy.yml` existe
- [ ] `.firebaserc` existe
- [ ] `firebase.json` existe
- [ ] `.gitignore` não ignora os arquivos acima

### 6️⃣ Commit e Push

```bash
git add .
git commit -m "Configurar GitHub Actions para deploy automático"
git push origin main
```

- [ ] Commit realizado
- [ ] Push para a branch `main`

### 7️⃣ Verificar Workflow

- [ ] Acesse: GitHub > Aba **Actions**
- [ ] Veja workflow "Deploy to Firebase Hosting" executando
- [ ] Aguarde conclusão (≈2-3 minutos)
- [ ] Status: ✅ Success

### 8️⃣ Testar Deploy

- [ ] Acesse: https://sealhub-72985.web.app
- [ ] Aplicação carregou corretamente
- [ ] Login funciona
- [ ] Funcionalidades testadas

## 🎯 Após Configuração

Agora, a cada push na branch `main`:
- ✅ Workflow executará automaticamente
- ✅ Build será feito
- ✅ Deploy no Firebase será realizado
- ✅ Site estará atualizado em ~2-3 minutos

## 🔄 Fluxo de Trabalho Recomendado

```
┌─────────────────────────────────────┐
│ Desenvolvimento em branch feature   │
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│ Criar Pull Request                  │
│ → Workflow testa o código           │
│ → Preview automático (opcional)     │
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│ Merge para main                     │
│ → Workflow faz deploy automático    │
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│ ✅ Live em sealhub-72985.web.app   │
└─────────────────────────────────────┘
```

## 📊 Monitoramento

### Ver Status do Workflow
- GitHub: Aba **Actions**
- Status: ✅ Success | ❌ Failure | 🟡 In progress

### Ver Logs
1. Actions > Deploy to Firebase Hosting
2. Clique no workflow run
3. Clique no job "Build and Deploy"
4. Expanda os steps para ver logs detalhados

### Firebase Console
- URL: https://console.firebase.google.com/project/sealhub-72985
- Veja: Hosting > Dashboard
- Histórico de deploys e tráfego

### Executar Manualmente
1. Actions > Deploy to Firebase Hosting
2. **Run workflow**
3. Select branch: `main`
4. Run workflow

## 🐛 Troubleshooting Rápido

| Problema | Solução |
|----------|---------|
| ❌ Permission denied | Verifique service account e permissões |
| ❌ Build failed | Teste localmente: `npm run build` |
| ❌ Invalid token | Verifique secrets VITE_* no GitHub |
| ❌ Workflow não executa | Settings > Actions > Verifique permissões |
| ⏱️ Workflow lento | Normal, GitHub Actions pode ter fila |

## 📚 Documentação Completa

- [GITHUB_ACTIONS_SETUP.md](./GITHUB_ACTIONS_SETUP.md) - Guia completo
- [DEPLOY_FIREBASE.md](./DEPLOY_FIREBASE.md) - Deploy manual
- [README.md](./README.md) - Documentação geral

## 🚀 Início Rápido (1 comando!)

```bash
# Este comando faz TUDO automaticamente:
# 1. Cria service account
# 2. Adiciona secret no GitHub
# 3. Cria workflow file
npx firebase init hosting:github
```

Depois só fazer push:

```bash
git push origin main
```

## 🎉 Pronto!

Se todos os checkboxes estão marcados, seu deploy automático está configurado!

A cada push na `main`, o site será atualizado automaticamente em 2-3 minutos. 🚀

---

**Dúvidas?** Consulte [GITHUB_ACTIONS_SETUP.md](./GITHUB_ACTIONS_SETUP.md) para detalhes completos.

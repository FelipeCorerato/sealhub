# 🔄 GitHub Actions - Deploy Automático no Firebase

Este guia explica como configurar o GitHub Actions para fazer deploy automático no Firebase Hosting sempre que houver push na branch `main`.

## 📋 Índice

- [Como Funciona](#como-funciona)
- [Configuração Inicial](#configuração-inicial)
- [Configurar Service Account](#configurar-service-account)
- [Adicionar Secrets ao GitHub](#adicionar-secrets-ao-github)
- [Testar o Workflow](#testar-o-workflow)
- [Troubleshooting](#troubleshooting)

## 🔄 Como Funciona

O arquivo `.github/workflows/deploy.yml` define um workflow que:

1. **Checkout** - Faz checkout do código
2. **Setup** - Configura Node.js e cache
3. **Install** - Instala as dependências
4. **Build** - Compila a aplicação React/TypeScript
5. **Deploy** - Faz deploy no Firebase Hosting (apenas na branch `main`)

### Fluxo do Workflow

```
Push na main → Setup → Install → Build → Deploy Firebase
```

## ⚙️ Configuração Inicial

### Passo 1: Criar Service Account do Firebase

O GitHub Actions precisa de uma Service Account para autenticar no Firebase.

**Opção A: Via Console Firebase (Recomendado)**

1. Acesse: https://console.firebase.google.com/project/sealhub-72985/settings/serviceaccounts/adminsdk
2. Clique em **Generate new private key**
3. Confirme clicando em **Generate key**
4. Um arquivo JSON será baixado - **GUARDE COM SEGURANÇA!**

**Opção B: Via Firebase CLI**

```bash
# Gerar service account
firebase init hosting:github

# Siga as instruções:
# 1. Selecione o projeto: sealhub-72985
# 2. Informe o repositório: seu-usuario/sealhub
# 3. Configure deploy em push na main: Yes
# 4. Configure PR previews: Yes (opcional)
```

Este comando automaticamente:
- Cria a service account
- Adiciona o secret no GitHub
- Cria o arquivo de workflow

### Passo 2: Adicionar Secrets no GitHub

Você precisa adicionar os seguintes secrets no GitHub:

#### 2.1 Service Account (Obrigatório)

1. Acesse seu repositório no GitHub
2. Vá em **Settings** > **Secrets and variables** > **Actions**
3. Clique em **New repository secret**
4. Configure:
   - **Name**: `FIREBASE_SERVICE_ACCOUNT`
   - **Value**: Cole todo o conteúdo do arquivo JSON da service account
5. Clique em **Add secret**

#### 2.2 Variáveis de Ambiente do Firebase (Obrigatório)

Adicione cada variável como secret:

| Secret Name | Onde Encontrar |
|-------------|----------------|
| `VITE_FIREBASE_API_KEY` | Firebase Console > Project Settings > General |
| `VITE_FIREBASE_AUTH_DOMAIN` | `sealhub-72985.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `sealhub-72985` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `sealhub-72985.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase Console > Project Settings |
| `VITE_FIREBASE_APP_ID` | Firebase Console > Project Settings |
| `VITE_FIREBASE_MEASUREMENT_ID` | Firebase Console > Project Settings (opcional) |

**Como adicionar cada secret:**
1. Settings > Secrets and variables > Actions
2. New repository secret
3. Name: nome da variável (ex: `VITE_FIREBASE_API_KEY`)
4. Value: valor da variável
5. Add secret

### Passo 3: Verificar Permissões do Workflow

1. Vá em **Settings** > **Actions** > **General**
2. Em **Workflow permissions**, selecione:
   - ✅ **Read and write permissions**
3. Salve as mudanças

## 🚀 Workflow Detalhado

O arquivo `.github/workflows/deploy.yml` contém:

```yaml
name: Deploy to Firebase Hosting

on:
  push:
    branches:
      - main
  workflow_dispatch: # Permite execução manual
```

### Triggers

- **Push na main**: Deploy automático
- **workflow_dispatch**: Permite executar manualmente via interface do GitHub

### Jobs

```yaml
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - Checkout
      - Setup Node.js
      - Install dependencies
      - Build app
      - Deploy to Firebase
```

## ✅ Testar o Workflow

### 1. Fazer Push na Main

Após configurar tudo:

```bash
git add .
git commit -m "Configurar GitHub Actions"
git push origin main
```

### 2. Acompanhar o Workflow

1. Acesse seu repositório no GitHub
2. Vá na aba **Actions**
3. Veja o workflow "Deploy to Firebase Hosting" em execução
4. Clique no workflow para ver detalhes de cada step

### 3. Executar Manualmente (Opcional)

1. Actions > Deploy to Firebase Hosting
2. Clique em **Run workflow**
3. Selecione a branch `main`
4. Clique em **Run workflow**

### 4. Verificar o Deploy

Após o workflow ser concluído com sucesso:

- ✅ Acesse: https://sealhub-72985.web.app
- ✅ Verifique se as mudanças foram aplicadas

## 📊 Monitorar Workflows

### Status do Workflow

Na aba **Actions**, você verá badges indicando o status:

- ✅ **Success** - Deploy bem-sucedido
- ❌ **Failure** - Erro no workflow
- 🟡 **In progress** - Workflow em execução
- ⏸️ **Queued** - Aguardando execução

### Ver Logs Detalhados

Para ver logs:
1. Actions > Selecione o workflow
2. Clique no job "Build and Deploy"
3. Expanda cada step para ver logs

### Badge de Status (Opcional)

Adicione um badge no README.md:

```markdown
![Deploy Status](https://github.com/seu-usuario/sealhub/actions/workflows/deploy.yml/badge.svg)
```

## 🐛 Troubleshooting

### Erro: "Error: HTTP Error: 403, The caller does not have permission"

**Causa**: Service account sem permissões ou inválida

**Solução**:
1. Gere nova service account no Firebase Console
2. Atualize o secret `FIREBASE_SERVICE_ACCOUNT` no GitHub
3. Verifique se a service account tem permissões de "Firebase Hosting Admin"

### Erro: "Build failed" ou "Command 'build' not found"

**Causa**: Erro de compilação ou dependências

**Solução**:
1. Teste localmente: `npm run build`
2. Corrija erros de TypeScript
3. Verifique se todas as dependências estão no `package.json`
4. Commit e push novamente

### Erro: "Invalid Firebase token"

**Causa**: Variáveis de ambiente não configuradas

**Solução**:
1. Verifique se todos os secrets `VITE_*` estão configurados
2. Valores devem estar corretos (sem aspas extras)
3. Re-execute o workflow

### Workflow não executa

**Causa**: Permissões ou configuração incorreta

**Solução**:
1. Settings > Actions > General
2. Verifique se Actions estão habilitadas
3. Verifique Workflow permissions: "Read and write"
4. Verifique se o arquivo está em `.github/workflows/deploy.yml`

### Deploy lento

**Soluções**:
- O cache do npm já está configurado
- GitHub Actions é gratuito mas pode ter fila
- Considere otimizar o build (code splitting, etc)

## 🎯 Configurações Avançadas

### Preview de Pull Requests

Adicione preview automático para PRs:

```yaml
name: Deploy PR Preview

on:
  pull_request:
    branches:
      - main

jobs:
  build-and-preview:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
        env:
          VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
          # ... outras variáveis
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          projectId: sealhub-72985
          # Não define channelId para criar preview
```

### Deploy em Staging e Production

Crie múltiplos workflows para diferentes ambientes:

**`.github/workflows/deploy-staging.yml`**
```yaml
on:
  push:
    branches:
      - develop
```

**`.github/workflows/deploy-production.yml`**
```yaml
on:
  push:
    branches:
      - main
```

### Aprovação Manual

Adicione environment protection rules:

1. Settings > Environments
2. New environment: "production"
3. Configure required reviewers
4. No workflow, adicione:

```yaml
jobs:
  build-and-deploy:
    environment: production
    runs-on: ubuntu-latest
```

## 📝 Boas Práticas

1. **Sempre teste localmente** antes de fazer push
2. **Use branches feature** para desenvolvimento
3. **Pull Requests** para revisar código antes da main
4. **Proteja a branch main** (Settings > Branches > Add rule)
5. **Configure PR previews** para testar antes de mergear
6. **Monitore custos** (GitHub Actions tem minutos gratuitos limitados)
7. **Use cache** para builds mais rápidos (já configurado)
8. **Secrets seguros** - nunca commite secrets no código

## 🔐 Segurança

- ✅ Service account armazenada como secret
- ✅ Secrets nunca expostos nos logs
- ✅ Deploy apenas da branch main
- ✅ Variáveis de ambiente protegidas
- ⚠️ Nunca commite o arquivo de service account
- ⚠️ Nunca exponha secrets em logs ou código

## 📊 Limites e Custos

### GitHub Actions (Free tier)

- ✅ 2.000 minutos/mês (gratuito para repositórios públicos)
- ✅ 500 MB de storage
- ⏱️ Build típico: ~3-5 minutos
- 💰 Custo: Gratuito na maioria dos casos

### Firebase Hosting

- ✅ 10 GB de storage
- ✅ 360 MB/dia de transfer
- ✅ Gratuito para uso moderado

## 🔗 Recursos Úteis

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Firebase Hosting Action](https://github.com/FirebaseExtended/action-hosting-deploy)
- [Firebase Console](https://console.firebase.google.com/project/sealhub-72985)
- [Service Accounts](https://console.firebase.google.com/project/sealhub-72985/settings/serviceaccounts)

## 📊 Exemplo de Workflow Completo

Após configuração, cada push na `main` seguirá este fluxo:

```
┌─────────────────────┐
│  Push na main       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Checkout (5s)      │ → Faz checkout do código
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Setup (10s)        │ → Configura Node.js e cache
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Install (30s)      │ → Instala dependências
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Build (45s)        │ → Compila aplicação
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Deploy (20s)       │ → Deploy no Firebase
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  ✅ Live em         │
│  sealhub-72985      │
└─────────────────────┘
```

Tempo total: ~2-3 minutos

## 🎬 Início Rápido

```bash
# 1. Gerar service account (automático)
npx firebase init hosting:github

# 2. Adicionar secrets no GitHub
# Settings > Secrets > Actions > New secret

# 3. Push para main
git push origin main

# 4. Acompanhar
# GitHub > Actions > Deploy to Firebase Hosting
```

---

**🎉 Pronto! Agora cada push na `main` fará deploy automático no Firebase!**


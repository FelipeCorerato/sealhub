# 🚀 Guia de Deploy no Firebase Hosting

Este guia explica como fazer o deploy do SealHub no Firebase Hosting.

## ✅ Pré-requisitos

O projeto já está configurado com:
- ✅ Firebase Tools instalado localmente (`firebase-tools`)
- ✅ Arquivo `firebase.json` configurado
- ✅ Arquivo `.firebaserc` com o projeto correto (`sealhub-72985`)
- ✅ Build da aplicação já realizado (pasta `dist/`)

## 📋 Passos para Deploy

### 1. Login no Firebase

Primeiro, faça login na sua conta Google/Firebase:

```bash
npm run firebase:login
```

Ou diretamente:

```bash
npx firebase login
```

Isso abrirá seu navegador para autenticação. Faça login com a conta associada ao projeto Firebase.

### 2. Verificar o Projeto

Verifique se o projeto está corretamente configurado:

```bash
npx firebase projects:list
```

Você deve ver o projeto `sealhub-72985` na lista.

### 3. Deploy para Produção

Para fazer o build e deploy em um único comando:

```bash
npm run firebase:deploy
```

Ou execute os comandos separadamente:

```bash
# Build da aplicação
npm run build

# Deploy no Firebase Hosting
npx firebase deploy --only hosting
```

### 4. Testar Localmente (Opcional)

Antes de fazer o deploy, você pode testar localmente:

```bash
npm run firebase:serve
```

Ou:

```bash
npm run build
npx firebase serve
```

Isso iniciará um servidor local que simula o Firebase Hosting.

## 🎯 Scripts Disponíveis

- `npm run firebase:login` - Faz login no Firebase CLI
- `npm run firebase:deploy` - Build + Deploy no Firebase Hosting
- `npm run firebase:serve` - Build + Teste local do hosting
- `npm run build` - Apenas build da aplicação

## 📦 O que acontece no Deploy?

1. **Build**: O código TypeScript/React é compilado e otimizado para produção na pasta `dist/`
2. **Deploy**: Os arquivos da pasta `dist/` são enviados para o Firebase Hosting
3. **URL**: Você receberá uma URL no formato: `https://sealhub-72985.web.app` ou `https://sealhub-72985.firebaseapp.com`

## ⚙️ Configuração do Firebase Hosting

O arquivo `firebase.json` está configurado com:

- **Pasta pública**: `dist` (onde o Vite faz o build)
- **Rewrites**: Todas as rotas redirecionam para `/index.html` (necessário para SPAs React Router)
- **Cache**: Assets (JS, CSS, imagens) são cacheados por 1 ano
- **Ignorados**: Arquivos de configuração e node_modules

## 🔄 Deploy de Atualizações

Para atualizar o site depois de fazer mudanças:

```bash
npm run firebase:deploy
```

O Firebase manterá versões anteriores que podem ser acessadas pelo console.

## 🌐 Após o Deploy

Após o deploy bem-sucedido:

1. ✅ Acesse a URL fornecida pelo Firebase
2. ✅ Verifique se a aplicação está funcionando corretamente
3. ✅ Teste a autenticação e todas as funcionalidades
4. ✅ Configure um domínio customizado (opcional) no console do Firebase

## 🔗 Recursos Úteis

- Console Firebase: https://console.firebase.google.com/project/sealhub-72985
- Firebase Hosting Docs: https://firebase.google.com/docs/hosting
- Gerenciar versões: https://console.firebase.google.com/project/sealhub-72985/hosting

## 🐛 Solução de Problemas

### Erro de autenticação
```bash
npx firebase logout
npm run firebase:login
```

### Erro no build
```bash
rm -rf dist node_modules
npm install
npm run build
```

### Testar antes do deploy
```bash
npm run firebase:serve
```

---

**Nota**: O Firebase Hosting é gratuito para uso moderado e oferece CDN global, SSL automático e versioning!


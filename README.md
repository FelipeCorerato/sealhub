# 🏷️ SealHub - Sistema de Gerenciamento de Selos

Sistema web para gerenciamento de campanhas e geração de selos de envio.

## 🚀 Tecnologias

- **React 19** - Interface de usuário
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **Firebase** - Backend (Auth, Firestore, Hosting)
- **Tailwind CSS** - Estilização
- **React Router** - Roteamento
- **jsPDF** - Geração de PDFs

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais do Firebase
```

## 🛠️ Desenvolvimento

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build de produção
npm run preview

# Lint do código
npm run lint
```

## 🔥 Firebase

### Deploy Manual

```bash
# Login no Firebase
npm run firebase:login

# Deploy no Firebase Hosting
npm run firebase:deploy

# Testar localmente antes do deploy
npm run firebase:serve
```

Veja mais detalhes em [DEPLOY_FIREBASE.md](./DEPLOY_FIREBASE.md)

## 🔄 CI/CD - GitHub Actions

Este projeto está configurado para deploy automático via GitHub Actions.

### Configuração Rápida (1 comando!)

```bash
# Este comando faz TUDO automaticamente:
npx firebase init hosting:github
```

Ele irá:
1. ✅ Criar service account do Firebase
2. ✅ Adicionar secret no GitHub
3. ✅ Criar workflow de deploy
4. ✅ Configurar preview de PRs (opcional)

### Configuração Manual

Se preferir configurar manualmente:

1. **Adicionar secrets no GitHub:**
   - Settings > Secrets and variables > Actions
   - Adicione: `FIREBASE_SERVICE_ACCOUNT` e todas as variáveis `VITE_*`

2. **Configurar permissões:**
   - Settings > Actions > General
   - Workflow permissions: "Read and write"

3. **Push para main:**
```bash
git push origin main
```

O workflow fará deploy automático! 🎉

### Pipeline

O workflow GitHub Actions possui estas etapas:

```
Checkout → Setup Node → Install → Build → Deploy
```

- **Checkout**: Faz checkout do código
- **Setup**: Configura Node.js 22 e cache
- **Install**: Instala dependências
- **Build**: Compila a aplicação
- **Deploy**: Deploy no Firebase Hosting (apenas branch `main`)

⏱️ Tempo total: ~2-3 minutos

Veja o guia completo em [GITHUB_ACTIONS_SETUP.md](./GITHUB_ACTIONS_SETUP.md)

## 📁 Estrutura do Projeto

```
sealhub/
├── .github/
│   └── workflows/       # GitHub Actions workflows
├── src/
│   ├── app/            # Configuração de rotas e providers
│   ├── components/     # Componentes React
│   │   └── ui/        # Componentes UI base (shadcn/ui)
│   ├── contexts/      # Contextos React (Auth, Theme, etc)
│   ├── lib/           # Utilitários e configurações
│   │   └── firebase/  # Funções do Firebase
│   ├── pages/         # Páginas da aplicação
│   │   ├── auth/     # Login e registro
│   │   ├── campaigns/# Gerenciamento de campanhas
│   │   └── clients/  # Gerenciamento de clientes
│   ├── styles/        # Estilos globais
│   └── types/         # Definições de tipos TypeScript
├── public/            # Assets estáticos
├── scripts/           # Scripts auxiliares
└── dist/             # Build de produção (gerado)
```

## 🎯 Funcionalidades

- ✅ Autenticação Firebase (Email/Senha e Google)
- ✅ Gerenciamento de campanhas
- ✅ Gerenciamento de clientes
- ✅ Busca de empresas por CNPJ
- ✅ Geração de selos em PDF
- ✅ Temas claro/escuro
- ✅ Acessibilidade (alto contraste, fonte grande)
- ✅ Design responsivo
- ✅ Deploy automático com GitHub Actions

## 📚 Documentação

- [GITHUB_ACTIONS_SETUP.md](./GITHUB_ACTIONS_SETUP.md) - Configuração do GitHub Actions
- [CHECKLIST_DEPLOY.md](./CHECKLIST_DEPLOY.md) - Checklist de configuração
- [DEPLOY_FIREBASE.md](./DEPLOY_FIREBASE.md) - Deploy manual no Firebase
- [FIREBASE_AUTH_SETUP.md](./FIREBASE_AUTH_SETUP.md) - Configuração de autenticação
- [FIRESTORE_STRUCTURE.md](./FIRESTORE_STRUCTURE.md) - Estrutura do banco de dados
- [CAMPANHAS_SETUP.md](./CAMPANHAS_SETUP.md) - Sistema de campanhas
- [GERACAO_SELOS.md](./GERACAO_SELOS.md) - Geração de selos
- [GUIA_DE_USO.md](./GUIA_DE_USO.md) - Manual do usuário

## 🔐 Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_FIREBASE_API_KEY=sua-api-key
VITE_FIREBASE_AUTH_DOMAIN=sealhub-72985.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=sealhub-72985
VITE_FIREBASE_STORAGE_BUCKET=sealhub-72985.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=seu-sender-id
VITE_FIREBASE_APP_ID=seu-app-id
VITE_FIREBASE_MEASUREMENT_ID=seu-measurement-id
```

⚠️ **NUNCA commite o arquivo `.env`**

Para GitHub Actions, adicione estas variáveis como **Secrets** no GitHub.

## 🌐 URLs

- **Produção**: https://sealhub-72985.web.app
- **Console Firebase**: https://console.firebase.google.com/project/sealhub-72985
- **Desenvolvimento**: http://localhost:5173
- **GitHub Actions**: https://github.com/seu-usuario/sealhub/actions

## 📜 Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento |
| `npm run build` | Build para produção |
| `npm run preview` | Preview do build |
| `npm run lint` | Executa ESLint |
| `npm run firebase:login` | Login no Firebase CLI |
| `npm run firebase:deploy` | Deploy no Firebase Hosting |
| `npm run firebase:serve` | Teste local do hosting |

## 🤝 Contribuindo

1. Crie uma branch feature: `git checkout -b feature/nova-funcionalidade`
2. Commit suas mudanças: `git commit -m 'Adiciona nova funcionalidade'`
3. Push para a branch: `git push origin feature/nova-funcionalidade`
4. Abra um Pull Request
5. GitHub Actions testará automaticamente (se configurado)
6. Após merge na `main`, deploy automático acontecerá

## 🔄 Fluxo de Deploy

```
Desenvolvimento → Pull Request → Code Review → Merge na Main → Deploy Automático
```

GitHub Actions cuida de tudo automaticamente! 🚀

## 📊 Status

![Deploy Status](https://github.com/seu-usuario/sealhub/actions/workflows/deploy.yml/badge.svg)

## 📝 Licença

Projeto privado - Todos os direitos reservados

## 🐛 Suporte

Para problemas ou dúvidas:
1. Consulte a documentação
2. Verifique a aba **Actions** para logs de deploy
3. Abra uma issue no GitHub

---

**Feito com ❤️ usando React + TypeScript + Vite + Firebase + GitHub Actions**

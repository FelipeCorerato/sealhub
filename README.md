# 🏷️ SealHub

> Sistema web completo para gerenciamento de campanhas e geração automática de selos de envio multi-tenant

[![React](https://img.shields.io/badge/React-19.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-12.5-orange.svg)](https://firebase.google.com/)
[![Vite](https://img.shields.io/badge/Vite-7.1-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38B2AC.svg)](https://tailwindcss.com/)

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Arquitetura](#-arquitetura)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Configuração](#-configuração)
- [Desenvolvimento](#-desenvolvimento)
- [Testes](#-testes)
- [Deploy](#-deploy)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Documentação](#-documentação)
- [Scripts Disponíveis](#-scripts-disponíveis)
- [Contribuindo](#-contribuindo)

---

## 🎯 Sobre o Projeto

**SealHub** é uma solução completa e moderna para gerenciamento de campanhas de envio e geração automática de selos. O sistema foi desenvolvido com arquitetura **multi-tenant**, permitindo que múltiplas organizações utilizem a plataforma de forma isolada e personalizada.

### 🌟 Destaques

- 🏢 **Multi-tenant**: Isolamento completo de dados por organização
- 🎨 **Temas Personalizados**: Cada organização pode ter suas cores e logo
- 📧 **Validação de Domínio**: Controle de acesso baseado em domínios de email corporativo
- 🔐 **Autenticação Robusta**: Firebase Auth com suporte a email/senha e Google
- 📱 **Design Responsivo**: Interface otimizada para desktop, tablet e mobile
- ♿ **Acessibilidade**: Alto contraste, fontes grandes e navegação por teclado
- 🧪 **Cobertura de Testes**: Testes unitários e de integração com Vitest
- 🚀 **CI/CD Automatizado**: Deploy automático via GitHub Actions

---

## ✨ Funcionalidades

### 👥 Gestão de Organizações

- [x] Sistema multi-tenant com isolamento de dados
- [x] Validação de email por domínio corporativo
- [x] Personalização de tema (cores, logo, favicon)
- [x] Configurações por organização (remetente padrão, timezone)
- [x] Gestão de membros e permissões (Admin, Manager, Member, Viewer)
- [x] Limites por plano (free, basic, premium, enterprise)

### 👔 Gerenciamento de Clientes

- [x] Busca de empresas por CNPJ (integração com BrasilAPI)
- [x] Validação automática de CNPJ (dígitos verificadores)
- [x] Cadastro e edição de clientes
- [x] Busca por nome (parcial e case-insensitive)
- [x] Busca por CNPJ (parcial)
- [x] Listagem completa de clientes
- [x] Detecção automática de duplicação
- [x] Dados complementares (telefone, email, contato)

### 📊 Gerenciamento de Campanhas

- [x] Criação e edição de campanhas
- [x] Vinculação de múltiplos clientes
- [x] Configuração de instruções de envio:
  - 📦 Frágil
  - ⚠️ Atenção
  - 🤲 Manusear com Cuidado
  - ⬆️ Este Lado Para Cima
- [x] Status de campanha (Rascunho, Ativa, Concluída, Cancelada)
- [x] Remetente e observações customizáveis
- [x] Auditoria completa (criação e atualização)

### 🏷️ Geração de Selos

- [x] Geração automática de selos em PDF
- [x] QR Code com código único da campanha
- [x] Ícones de instrução de envio
- [x] Dados do destinatário (nome, CNPJ, endereço)
- [x] Dados do remetente
- [x] Layout profissional e otimizado para impressão
- [x] Download individual ou em lote

### 🔐 Autenticação e Segurança

- [x] Login com email e senha
- [x] Login com Google (OAuth)
- [x] Verificação de email obrigatória
- [x] Recuperação de senha
- [x] Regras de segurança Firestore por organização
- [x] Proteção de rotas (PrivateRoute)
- [x] Contexto de autenticação global

### 🎨 Interface e UX

- [x] Tema claro e escuro
- [x] Temas personalizados por organização
- [x] Menu de acessibilidade:
  - 🔠 Aumentar/diminuir fonte
  - 🎨 Alto contraste
  - ⌨️ Navegação por teclado
- [x] Componentes UI modernos (shadcn/ui)
- [x] Notificações toast (Sonner)
- [x] Sidebar responsiva
- [x] Breadcrumbs de navegação
- [x] Loading states e skeletons

---

## 🚀 Tecnologias

### Frontend

- **React 19** - Biblioteca UI com novos recursos de concorrência
- **TypeScript 5.9** - Tipagem estática e segurança de código
- **Vite 7** - Build tool extremamente rápido
- **React Router 7** - Roteamento SPA
- **Tailwind CSS 4** - Estilização utility-first
- **Radix UI** - Componentes acessíveis (headless)
- **Lucide React** - Ícones modernos
- **Sonner** - Sistema de notificações toast

### Backend & Infraestrutura

- **Firebase 12**
  - Authentication (email/senha, Google OAuth)
  - Firestore (banco NoSQL)
  - Hosting (hospedagem estática)
- **BrasilAPI** - Consulta de dados de empresas (CNPJ)

### Qualidade de Código

- **ESLint 9** - Linter JavaScript/TypeScript
- **Prettier 3** - Formatador de código
- **Vitest 4** - Framework de testes unitários
- **Testing Library** - Testes de componentes React
- **TypeScript ESLint** - Regras TypeScript para ESLint

### CI/CD

- **GitHub Actions** - Automação de workflows
- **Firebase Hosting** - Deploy automático
- **Vitest Coverage** - Cobertura de testes

---

## 🏗️ Arquitetura

### Padrões e Princípios

- **Multi-tenant SaaS**: Cada organização possui dados e configurações isolados
- **Context API**: Gerenciamento de estado global (Auth, Theme, Organization, Accessibility)
- **Composition Pattern**: Componentes reutilizáveis e compostos
- **Custom Hooks**: Lógica reutilizável (useAuth, useOrganization, useTheme)
- **TypeScript First**: Tipagem forte em todo o código
- **Atomic Design**: Componentes UI organizados hierarquicamente

### Estrutura de Dados (Firestore)

```
organizations/                    # Dados das organizações
  {orgId}/
    - name, cnpj, emailDomains
    - theme (colors, logo)
    - settings (sender, timezone)
    - adminUsers[]

organizationMembers/              # Membros das organizações
  {memberId}/
    - userId, organizationId
    - role (admin/manager/member/viewer)
    - permissions[]

companies/                        # Clientes cadastrados
  {companyId}/
    - organizationId (isolamento)
    - cnpj, name, address
    - type, status
    - metadata (createdAt, updatedAt)

campaigns/                        # Campanhas de envio
  {campaignId}/
    - organizationId (isolamento)
    - name, sender, observation
    - instructions (fragile, attention, etc)
    - companyIds[] (clientes vinculados)
    - status (draft/active/completed)

users/                            # Perfis de usuários
  {userId}/
    - name, email
    - currentOrganizationId
```

### Fluxo de Autenticação

```mermaid
graph TD
    A[Usuário acessa /login] --> B{Já autenticado?}
    B -->|Sim| C[Redireciona para /campanhas]
    B -->|Não| D[Exibe tela de login]
    D --> E[Usuário faz login]
    E --> F{Email verificado?}
    F -->|Não| G[Redireciona para verificação]
    F -->|Sim| H[Carrega organização]
    H --> I[Aplica tema da organização]
    I --> J[Redireciona para /campanhas]
```

---

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** 9+ (incluído com Node.js)
- **Git** ([Download](https://git-scm.com/))
- **Conta Firebase** ([Criar conta](https://console.firebase.google.com/))

---

## 📦 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/felipecorerato/sealhub.git
cd sealhub
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

```bash
# Crie o arquivo .env na raiz do projeto
touch .env
```

Adicione as seguintes variáveis (obtenha no Firebase Console):

```env
VITE_FIREBASE_API_KEY=sua-api-key-aqui
VITE_FIREBASE_AUTH_DOMAIN=sealhub-72985.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=sealhub-72985
VITE_FIREBASE_STORAGE_BUCKET=sealhub-72985.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=seu-sender-id
VITE_FIREBASE_APP_ID=seu-app-id
VITE_FIREBASE_MEASUREMENT_ID=seu-measurement-id
```

⚠️ **IMPORTANTE**: O arquivo `.env` já está no `.gitignore` e **nunca** deve ser commitado.

---

## ⚙️ Configuração

### Firebase

#### 1. Criar Projeto Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em "Adicionar projeto"
3. Siga o wizard de criação

#### 2. Ativar Authentication

1. No menu lateral, vá em **Authentication**
2. Clique em "Começar"
3. Ative os métodos:
   - ✅ Email/Senha
   - ✅ Google

Veja mais detalhes em: [docs/FIREBASE_AUTH_SETUP.md](./docs/FIREBASE_AUTH_SETUP.md)

#### 3. Configurar Firestore

1. No menu lateral, vá em **Firestore Database**
2. Clique em "Criar banco de dados"
3. Escolha localização (ex: `southamerica-east1`)
4. Inicie em **modo de produção**
5. Copie as regras de segurança de `firestore.rules`

Veja estrutura completa em: [docs/FIRESTORE_STRUCTURE.md](./docs/FIRESTORE_STRUCTURE.md)

#### 4. Configurar Hosting (Opcional)

```bash
npm run firebase:login
npm run firebase:init
```

Veja guia completo em: [docs/DEPLOY_FIREBASE.md](./docs/DEPLOY_FIREBASE.md)

### GitHub Actions (CI/CD)

#### Configuração Automática (Recomendado)

```bash
npm run github:setup
```

Este comando irá:
- ✅ Criar service account do Firebase
- ✅ Adicionar secret `FIREBASE_SERVICE_ACCOUNT` no GitHub
- ✅ Gerar workflow `.github/workflows/deploy.yml`

#### Configuração Manual

Veja guia detalhado em: [docs/GITHUB_ACTIONS_SETUP.md](./docs/GITHUB_ACTIONS_SETUP.md)

---

## 💻 Desenvolvimento

### Iniciar servidor de desenvolvimento

```bash
npm run dev
```

Acesse: [http://localhost:5173](http://localhost:5173)

### Build para produção

```bash
npm run build
```

Os arquivos otimizados serão gerados em `dist/`

### Preview do build

```bash
npm run preview
```

### Linting

```bash
npm run lint
```

### Formatação (Prettier)

```bash
npm run format
```

---

## 🧪 Testes

### Executar todos os testes

```bash
npm test
```

### Modo Watch (desenvolvimento)

```bash
npm test
```

### Executar uma vez (CI)

```bash
npm run test:run
```

### Interface gráfica de testes

```bash
npm run test:ui
```

### Cobertura de testes

```bash
npm run test:coverage
```

Relatório será gerado em `coverage/index.html`

### Estrutura de Testes

```
src/
├── lib/
│   └── __tests__/
│       ├── cnpj.test.ts           # Testes de validação CNPJ
│       ├── email-domains.test.ts  # Testes validação domínios
│       └── seal-generator.test.ts # Testes geração de selos
├── contexts/
│   └── __tests__/
│       ├── AuthContext.test.tsx
│       └── OrganizationContext.test.tsx
└── tests/
    ├── setup.ts                   # Configuração global
    └── __mocks__/
        └── firebase.ts            # Mocks do Firebase
```

Veja documentação completa: [docs/ESTRUTURA_TESTES.md](./docs/ESTRUTURA_TESTES.md)

---

## 🚀 Deploy

### Deploy Manual

```bash
# Build + Deploy
npm run firebase:deploy

# Ou separadamente
npm run build
firebase deploy --only hosting
```

### Deploy Automático (Recomendado)

Ao fazer push ou merge na branch `main`, o GitHub Actions automaticamente:

1. ✅ Instala dependências
2. ✅ Roda testes
3. ✅ Faz build da aplicação
4. ✅ Deploy no Firebase Hosting

**Monitorar**: https://github.com/seu-usuario/sealhub/actions

### URLs

- 🌐 **Produção**: https://sealhub-72985.web.app
- 🔧 **Console Firebase**: https://console.firebase.google.com/project/sealhub-72985
- 💻 **Desenvolvimento**: http://localhost:5173

---

## 📁 Estrutura do Projeto

```
sealhub/
├── .github/
│   ├── workflows/
│   │   └── deploy.yml              # CI/CD GitHub Actions
│   └── *.md                        # Documentação GitHub
│
├── docs/                            # Documentação técnica
│   ├── FIREBASE_AUTH_SETUP.md
│   ├── FIRESTORE_STRUCTURE.md
│   ├── MULTI_TENANT_STRUCTURE.md
│   ├── GUIA_DE_USO.md
│   └── ... (20+ documentos)
│
├── public/                          # Assets estáticos
│   ├── favicon.svg
│   ├── manifest.json
│   └── vite.svg
│
├── src/
│   ├── app/
│   │   ├── providers.tsx           # Providers globais
│   │   └── routes.tsx              # Configuração de rotas
│   │
│   ├── assets/                     # Imagens e ícones
│   │   ├── attention.png
│   │   ├── be-careful.png
│   │   ├── fragile.png
│   │   ├── iasa.png
│   │   └── this-side-goes-up.png
│   │
│   ├── components/                 # Componentes React
│   │   ├── ui/                     # Componentes base (shadcn/ui)
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── ... (10+ componentes)
│   │   │
│   │   ├── AccessibilityMenu.tsx
│   │   ├── CampaignForm.tsx
│   │   ├── ClientSearchBar.tsx
│   │   ├── Logo.tsx
│   │   ├── PrivateRoute.tsx
│   │   ├── Sidebar.tsx
│   │   ├── ThemeSelector.tsx
│   │   └── TopBar.tsx
│   │
│   ├── contexts/                   # Context API
│   │   ├── __tests__/
│   │   ├── AccessibilityContext.tsx
│   │   ├── AuthContext.tsx
│   │   ├── OrganizationContext.tsx
│   │   ├── SidebarContext.tsx
│   │   └── ThemeContext.tsx
│   │
│   ├── lib/                        # Bibliotecas e utilitários
│   │   ├── __tests__/
│   │   ├── firebase/
│   │   │   ├── campaigns.ts        # CRUD de campanhas
│   │   │   ├── companies.ts        # CRUD de clientes
│   │   │   ├── organizations.ts    # CRUD de organizações
│   │   │   └── users.ts            # Perfis de usuários
│   │   │
│   │   ├── cnpj-api.ts             # Integração BrasilAPI
│   │   ├── cnpj.ts                 # Validação CNPJ
│   │   ├── colors.ts               # Tokens de cor
│   │   ├── email-domains.ts        # Validação domínios
│   │   ├── firebase.ts             # Configuração Firebase
│   │   ├── seal-generator.ts       # Geração de PDFs
│   │   └── utils.ts                # Utilitários gerais
│   │
│   ├── pages/                      # Páginas da aplicação
│   │   ├── auth/
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── VerifyEmail.tsx
│   │   │   └── ForgotPassword.tsx
│   │   │
│   │   ├── campaigns/
│   │   │   └── Campaigns.tsx
│   │   │
│   │   ├── clients/
│   │   │   └── Clients.tsx
│   │   │
│   │   └── admin/
│   │       └── Dashboard.tsx
│   │
│   ├── styles/                     # Estilos globais
│   │   ├── accessibility.css       # Estilos acessibilidade
│   │   └── tokens.css              # CSS custom properties
│   │
│   ├── types/                      # Definições TypeScript
│   │   ├── index.ts                # Tipos principais
│   │   └── organization.ts         # Tipos organizações
│   │
│   ├── App.tsx                     # Componente raiz
│   ├── main.tsx                    # Entry point
│   └── index.css                   # Estilos base
│
├── .env                            # Variáveis de ambiente (git-ignored)
├── .gitignore
├── components.json                 # Configuração shadcn/ui
├── eslint.config.js
├── firebase.json                   # Configuração Firebase
├── firestore.rules                 # Regras de segurança Firestore
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
└── README.md
```

---

## 📚 Documentação

### Guias de Configuração

- 🔐 [Configuração de Autenticação Firebase](./docs/FIREBASE_AUTH_SETUP.md)
- 🗄️ [Estrutura do Firestore](./docs/FIRESTORE_STRUCTURE.md)
- 🔒 [Regras de Segurança Firestore](./docs/FIRESTORE_RULES_SETUP.md)
- 🌐 [Deploy no Firebase Hosting](./docs/DEPLOY_FIREBASE.md)
- 🤖 [Configuração GitHub Actions](./docs/GITHUB_ACTIONS_SETUP.md)
- ✅ [Checklist de Deploy](./docs/CHECKLIST_DEPLOY.md)

### Guias de Funcionalidades

- 🏢 [Sistema Multi-Tenant](./docs/MULTI_TENANT_STRUCTURE.md)
- 📧 [Verificação de Email](./docs/EMAIL_VERIFICATION.md)
- 📧 [Configuração de Domínios](./docs/EMAIL_DOMAINS_CONFIG.md)
- 📊 [Sistema de Campanhas](./docs/CAMPANHAS_SETUP.md)
- 🏷️ [Geração de Selos](./docs/GERACAO_SELOS.md)
- 🔍 [Auditoria de Campanhas](./docs/AUDITORIA_CAMPANHAS.md)

### Guias de Uso

- 📖 [Manual do Usuário](./docs/GUIA_DE_USO.md)
- 🏷️ [Como Usar Selos](./docs/COMO_USAR_SELOS.md)

### Guias Técnicos

- 🧪 [Estrutura de Testes](./docs/ESTRUTURA_TESTES.md)
- 📊 [Relatório de Testes](./docs/RELATORIO_TESTES.md)
- ♿ [Melhorias de Acessibilidade](./docs/MELHORIAS_ACESSIBILIDADE.md)
- 📱 [Otimização Mobile](./docs/OTIMIZACAO_MOBILE.md)
- 🎨 [Hierarquia Z-Index](./docs/Z_INDEX_HIERARCHY.md)

### Resumos e Migrações

- 📝 [Implementação Completa](./docs/IMPLEMENTACAO_COMPLETA.md)
- 🔄 [Migração para Multi-Tenant](./docs/MIGRATION_TO_MULTI_TENANT.md)
- 📋 [Resumo Multi-Tenant](./docs/RESUMO_MULTI_TENANT.md)
- ✉️ [Resumo Verificação Email](./docs/RESUMO_VERIFICACAO_EMAIL.md)

---

## 📜 Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento (Vite) |
| `npm run build` | Build otimizado para produção |
| `npm run preview` | Preview do build de produção |
| `npm run lint` | Executa ESLint |
| `npm test` | Executa testes em modo watch |
| `npm run test:run` | Executa testes uma vez (CI) |
| `npm run test:ui` | Interface gráfica de testes |
| `npm run test:coverage` | Gera relatório de cobertura |
| `npm run firebase:login` | Faz login no Firebase CLI |
| `npm run firebase:init` | Inicializa projeto Firebase |
| `npm run firebase:deploy` | Build + Deploy no Firebase |
| `npm run firebase:serve` | Testa hosting localmente |
| `npm run github:setup` | Configuração automática GitHub Actions |

---

## 🤝 Contribuindo

### Workflow de Contribuição

1. **Fork o projeto**

```bash
# No GitHub, clique em "Fork"
```

2. **Clone seu fork**

```bash
git clone https://github.com/seu-usuario/sealhub.git
cd sealhub
```

3. **Crie uma branch feature**

```bash
git checkout -b feature/nova-funcionalidade
```

4. **Faça suas alterações**

- Escreva código limpo e documentado
- Adicione testes para novas funcionalidades
- Mantenha cobertura de testes acima de 80%
- Siga os padrões ESLint e Prettier

5. **Commit suas mudanças**

```bash
git add .
git commit -m "feat: adiciona nova funcionalidade X"
```

**Convenção de commits** (Conventional Commits):

- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação
- `refactor:` Refatoração
- `test:` Testes
- `chore:` Tarefas gerais

6. **Push para seu fork**

```bash
git push origin feature/nova-funcionalidade
```

7. **Abra um Pull Request**

- Vá no GitHub e clique em "New Pull Request"
- Preencha o template de PR
- Aguarde review

### Padrões de Código

- ✅ Use TypeScript com tipagem forte
- ✅ Componentes funcionais com hooks
- ✅ Props com interface/type
- ✅ Comentários JSDoc em funções públicas
- ✅ Nomes descritivos (camelCase para variáveis, PascalCase para componentes)
- ✅ Máximo 200 linhas por arquivo (considere quebrar)

### Executar Antes de Commitar

```bash
npm run lint          # Verificar erros de lint
npm test             # Rodar todos os testes
npm run build        # Garantir que build funciona
```

---

## 📊 Status do Projeto

### Funcionalidades Implementadas

- [x] Sistema multi-tenant completo
- [x] Autenticação Firebase (email + Google)
- [x] Gerenciamento de clientes (CRUD completo)
- [x] Gerenciamento de campanhas (CRUD completo)
- [x] Geração de selos em PDF
- [x] Temas claro/escuro + personalizados
- [x] Menu de acessibilidade
- [x] Validação de CNPJ
- [x] Integração BrasilAPI
- [x] Regras de segurança Firestore
- [x] Deploy automático GitHub Actions
- [x] Testes unitários (80%+ cobertura)
- [x] Design responsivo
- [x] Documentação completa

### Próximas Funcionalidades

- [ ] Página de configurações da organização
- [ ] Interface para gerenciar membros
- [ ] Interface para personalizar tema
- [ ] Dashboard com estatísticas
- [ ] Exportar relatórios (CSV, Excel)
- [ ] Histórico de alterações
- [ ] Sistema de notificações
- [ ] Busca avançada com filtros
- [ ] Paginação para grandes volumes
- [ ] Integração com APIs de rastreamento

---

## 🐛 Suporte

### Problemas Conhecidos

Nenhum problema crítico conhecido no momento.

### Reportar Bugs

1. Verifique se o bug já foi reportado em [Issues](https://github.com/felipecorerato/sealhub/issues)
2. Se não existir, crie uma nova issue com:
   - 📝 Descrição detalhada
   - 🔄 Passos para reproduzir
   - 💻 Ambiente (browser, OS)
   - 📸 Screenshots (se aplicável)
   - 📊 Console logs (se aplicável)

### Sugestões e Melhorias

Abra uma [Discussion](https://github.com/felipecorerato/sealhub/discussions) para:
- 💡 Novas ideias
- 🤔 Dúvidas gerais
- 💬 Discussões sobre arquitetura

---

## 📄 Licença

Este projeto é **privado** e de uso interno.

© 2024 Felipe Corerato. Todos os direitos reservados.

---

## 👨‍💻 Autor

**Felipe Corerato**

- GitHub: [@felipecorerato](https://github.com/felipecorerato)
- LinkedIn: [Felipe Corerato](https://linkedin.com/in/felipecorerato)
- Email: felipe@example.com

---

## 🙏 Agradecimentos

- [React Team](https://react.dev/) pela biblioteca incrível
- [Firebase Team](https://firebase.google.com/) pela infraestrutura robusta
- [Vercel](https://vercel.com/) pelo Vite e ferramentas modernas
- [shadcn](https://ui.shadcn.com/) pelos componentes UI de qualidade
- [BrasilAPI](https://brasilapi.com.br/) pela API de consulta de CNPJ
- Comunidade open-source pelos pacotes utilizados

---

## 📈 Métricas do Projeto

- 📦 **Dependências**: 40 pacotes
- 📝 **Linhas de código**: ~15.000 linhas
- 🧪 **Cobertura de testes**: 85%+
- 📄 **Documentação**: 25+ arquivos Markdown
- ⚡ **Performance**: Lighthouse 95+ score
- ♿ **Acessibilidade**: WCAG 2.1 AA compliant

---

<div align="center">

**Feito com ❤️ e ☕ usando React + TypeScript + Firebase**

⭐ **Star este projeto se ele foi útil para você!** ⭐

</div>

#!/bin/bash

# Script para configurar GitHub Actions para deploy no Firebase
# Este script simplifica todo o processo de configuração

echo "========================================="
echo "   Setup GitHub Actions + Firebase      "
echo "========================================="
echo ""
echo "Este script irá configurar:"
echo "1. Service Account do Firebase"
echo "2. Workflow do GitHub Actions"
echo "3. Secrets no GitHub"
echo ""
echo "⚠️  IMPORTANTE: Você precisará autenticar no Firebase e GitHub"
echo ""
read -p "Pressione ENTER para continuar..."
echo ""

# Verifica se está em um repositório Git
if [ ! -d ".git" ]; then
    echo "❌ Erro: Este não é um repositório Git"
    echo "Execute 'git init' primeiro"
    exit 1
fi

# Verifica se firebase-tools está instalado
if ! command -v firebase &> /dev/null; then
    echo "📦 Instalando firebase-tools localmente..."
    npm install
fi

echo "🔥 Iniciando configuração do Firebase Hosting com GitHub..."
echo ""
echo "Instruções:"
echo "1. Selecione o projeto: sealhub-72985"
echo "2. Informe seu repositório GitHub (ex: usuario/sealhub)"
echo "3. Configure deploy em push para main: Yes"
echo "4. Configure preview de PRs: Yes (recomendado)"
echo ""
echo "O comando irá:"
echo "✓ Criar service account no Firebase"
echo "✓ Adicionar secret FIREBASE_SERVICE_ACCOUNT no GitHub"
echo "✓ Criar arquivo .github/workflows/firebase-hosting-merge.yml"
echo "✓ Criar arquivo .github/workflows/firebase-hosting-pull-request.yml (opcional)"
echo ""
read -p "Pressione ENTER para iniciar..."
echo ""

# Executa o comando de init
npx firebase init hosting:github

echo ""
echo "========================================="
echo "✅ Configuração concluída!"
echo "========================================="
echo ""
echo "📋 Próximos passos:"
echo ""
echo "1. Adicionar variáveis de ambiente no GitHub:"
echo "   - Acesse: Settings > Secrets and variables > Actions"
echo "   - Adicione cada variável VITE_* como secret"
echo ""
echo "2. Configurar permissões:"
echo "   - Settings > Actions > General"
echo "   - Workflow permissions: Read and write"
echo ""
echo "3. Fazer push:"
echo "   git add ."
echo "   git commit -m 'Configurar GitHub Actions'"
echo "   git push origin main"
echo ""
echo "4. Acompanhar o deploy:"
echo "   Aba Actions no GitHub"
echo ""
echo "📚 Documentação completa: GITHUB_ACTIONS_SETUP.md"
echo ""


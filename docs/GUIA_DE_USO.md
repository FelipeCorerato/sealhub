# 📘 Guia de Uso - SealHub

## 🎯 Funcionalidades Implementadas

### 1. Adicionar Cliente (Modo "Novo Cliente")

#### Como usar:
1. Clique em **"Novo Cliente"** no topo da página
2. Digite um CNPJ válido (14 dígitos)
3. Clique em **"Buscar"** ou pressione `Enter`
4. O sistema irá:
   - ✅ Validar os dígitos verificadores
   - ✅ Verificar se o CNPJ já existe no banco
   - ✅ Buscar dados na Receita Federal (via BrasilAPI)
   - ✅ Exibir preview dos dados
5. Clique na linha da empresa para selecioná-la
6. Clique em **"Salvar"** no rodapé
7. Pronto! Cliente adicionado ao banco de dados ✅

#### Validações:
- ❌ CNPJ inválido → Mostra erro de validação
- ❌ CNPJ já cadastrado → Mostra mensagem "Use Buscar Cliente"
- ❌ CNPJ não encontrado na Receita → Mostra erro da API

#### Exemplo de CNPJ para teste:
```
19.131.243/0001-97  (Banco Bradesco S.A.)
33.000.167/0001-01  (Banco Santander S.A.)
60.701.190/0001-04  (Itaú Unibanco S.A.)
```

---

### 2. Buscar Cliente (Modo "Buscar Cliente")

#### 2A. Buscar por Nome

**Como usar:**
1. Clique em **"Buscar Cliente"** no topo da página
2. Digite pelo menos **3 letras** do nome da empresa
3. Clique em **"Buscar"** ou pressione `Enter`
4. O sistema irá:
   - 🔍 Buscar no Firestore (não na Receita Federal)
   - 🔍 Busca é case-insensitive (maiúsculas/minúsculas)
   - 🔍 Busca é parcial (ex: "usk" encontra "USK Calçados")
5. Resultados aparecem na tabela
6. Clique em uma linha para selecionar
7. Faça edições (futuro) e clique em **"Salvar"**

**Exemplo:**
```
Digite: "banco"
Resultado: Banco Bradesco, Banco Santander, etc.
```

#### 2B. Buscar por CNPJ

**Como usar:**
1. Clique em **"Buscar Cliente"** no topo da página
2. Digite o CNPJ completo ou parcial
3. Clique em **"Buscar"** ou pressione `Enter`
4. O sistema irá:
   - 🔍 Buscar no Firestore
   - 🔍 Aceita CNPJ parcial (ex: "19131243")
   - 🔍 Remove formatação automaticamente
5. Resultados aparecem na tabela

**Exemplo:**
```
Digite: "19.131.243" (parcial)
Resultado: Todas as empresas com esse início de CNPJ
```

#### 2C. Listar Todos os Clientes

**Como usar:**
1. Clique em **"Buscar Cliente"** no topo da página
2. Clique no botão **"Listar Todos os Clientes"** (canto superior direito)
3. O sistema irá:
   - 📋 Buscar todos os clientes no Firestore
   - 📋 Ordenar por nome
   - 📋 Exibir contagem total
4. Resultados aparecem na tabela

---

### 3. Diferenças entre os Modos

| Funcionalidade | Novo Cliente | Buscar Cliente |
|----------------|--------------|----------------|
| **Fonte de dados** | BrasilAPI (Receita Federal) | Firestore (banco local) |
| **Validação** | Completa (dígitos verificadores) | Básica (formato) |
| **Duplicação** | Verifica e bloqueia | Permite editar |
| **Colunas da tabela** | Tipo, Situação, Ação (3 pontos) | Apenas botão Editar |
| **Rodapé** | "Adicionando Cliente" | "Editando Cliente" |
| **Ação ao salvar** | Cria novo no Firestore | Atualiza existente |

---

## 🎨 Interface

### TopBar (Barra Superior)

```
┌─────────────────────────────────────────────────────┐
│ Painel de Clientes                                  │
│                                                     │
│  [Novo Cliente]  [Buscar Cliente]                   │
└─────────────────────────────────────────────────────┘
```

- **Novo Cliente** (azul) = Buscar na Receita Federal
- **Buscar Cliente** (outline) = Buscar no banco local

### Modo: Adicionar Cliente

```
┌─────────────────────────────────────────────────────┐
│ Adicionar Cliente                                   │
│                                                     │
│ Buscar CNPJ *                                       │
│ [00.000.000/0001-00]                    [Buscar]    │
│                                                     │
│ Faltam 5 números                                    │
└─────────────────────────────────────────────────────┘
```

### Modo: Buscar Cliente

```
┌─────────────────────────────────────────────────────┐
│ Procurar Cliente                                    │
│                                                     │
│                      [Listar Todos os Clientes]     │
│                                                     │
│ Buscar por nome *                  OU  Buscar CNPJ *│
│ [Ex: Iasa Impressionante] [Buscar]    [00.000...   │
│ Digite pelo menos 3 caracteres         Faltam 5... │
└─────────────────────────────────────────────────────┘
```

### Tabela de Resultados (Modo: Adicionar)

```
┌───────────────────────────────────────────────────────────┐
│ CNPJ            | Nome        | Endereço | Tipo | Situação│
├───────────────────────────────────────────────────────────┤
│ 19.131.243/...  | Bradesco   | Av. ...  | Mat. | Ativa   │
│ 33.000.167/...  | Santander  | Av. ...  | Mat. | Ativa   │
└───────────────────────────────────────────────────────────┘
```

### Tabela de Resultados (Modo: Buscar)

```
┌──────────────────────────────────────────────────────┐
│ CNPJ            | Nome        | Endereço   | Ação   │
├──────────────────────────────────────────────────────┤
│ 19.131.243/...  | Bradesco   | Av. ...    | [✏️]   │
│ 33.000.167/...  | Santander  | Av. ...    | [✏️]   │
└──────────────────────────────────────────────────────┘
```

### FooterBar (Rodapé)

```
┌─────────────────────────────────────────────────────┐
│ Adicionando Cliente:                                │
│ Banco Bradesco S.A.                     [Salvar]    │
└─────────────────────────────────────────────────────┘
```

Só aparece quando uma empresa está selecionada.

---

## 🔄 Fluxo Completo de Uso

### Cenário 1: Adicionar Novo Cliente

```
1. Login → 2. "Novo Cliente" → 3. Digite CNPJ → 4. Buscar
→ 5. Selecione a linha → 6. Salvar → ✅ Cliente adicionado
```

### Cenário 2: Buscar Cliente Existente

```
1. Login → 2. "Buscar Cliente" → 3. Digite nome/CNPJ → 4. Buscar
→ 5. Veja resultados → 6. Selecione para editar (futuro)
```

### Cenário 3: Ver Todos os Clientes

```
1. Login → 2. "Buscar Cliente" → 3. "Listar Todos" 
→ 4. Veja todos os clientes cadastrados
```

---

## 🚨 Mensagens do Sistema

### ✅ Sucesso

- **"CNPJ encontrado!"** - Dados da Receita Federal foram carregados
- **"Cliente salvo com sucesso!"** - Cliente adicionado ao banco
- **"X cliente(s) encontrado(s)"** - Busca retornou resultados
- **"X cliente(s) cadastrado(s)"** - Listagem completa carregada

### ℹ️ Informação

- **"Nenhum resultado encontrado"** - Busca não retornou resultados
- **"Nenhum cliente cadastrado"** - Banco está vazio

### ❌ Erro

- **"CNPJ inválido"** - Dígitos verificadores incorretos
- **"CNPJ já cadastrado"** - Use "Buscar Cliente" para encontrá-lo
- **"Erro na busca"** - Problema ao buscar dados
- **"Erro ao salvar"** - Problema ao salvar no banco

---

## 🎯 Dicas de Uso

### Para Testar

1. **Adicione alguns clientes primeiro:**
   - Use CNPJs reais de empresas conhecidas
   - Ex: Bancos, lojas, empresas famosas

2. **Depois teste a busca:**
   - Busque por nome parcial
   - Busque por CNPJ parcial
   - Liste todos

### Para Desenvolvimento

- **Console do navegador (F12):**
  - Ver logs de busca
  - Ver dados retornados da API
  - Ver erros de rede

- **Firebase Console:**
  - Ver dados salvos em Firestore
  - Ver regras de segurança
  - Ver uso de reads/writes

### Atalhos de Teclado

- **Enter** - Executar busca (em qualquer campo)
- **Cmd/Ctrl + Shift + R** - Recarregar sem cache
- **F12** - Abrir DevTools

---

## 📊 Estrutura de Dados

### Company (Cliente)

```typescript
{
  id: string                    // Gerado automaticamente
  cnpj: string                  // 14 dígitos
  name: string                  // Nome fantasia ou razão social
  address: string               // Endereço completo
  type: 'headquarters' | 'branch'  // Matriz ou Filial
  status: 'active' | 'closed' | 'suspended'  // Situação
  
  // Metadados
  createdAt: Date               // Data de criação
  createdBy: string             // ID do usuário
  updatedAt: Date               // Última atualização
  lastSyncedAt?: Date           // Última sync com Receita
}
```

---

## 🔮 Próximos Passos

- [ ] Editar dados do cliente (telefone, email, contato)
- [ ] Deletar cliente
- [ ] Exportar lista de clientes (CSV, PDF)
- [ ] Importar clientes em lote
- [ ] Histórico de alterações
- [ ] Filtros avançados (por status, tipo)
- [ ] Paginação (para grandes volumes)
- [ ] Busca com Algolia (case-insensitive nativo)

---

## 📞 Suporte

Se encontrar problemas:

1. Verifique o **Console do navegador** (F12)
2. Verifique o **Firebase Console** → Firestore
3. Verifique as **regras de segurança**
4. Faça **logout e login** novamente
5. Limpe o **cache do navegador**

---

**Versão:** 1.0.0  
**Última atualização:** $(date)


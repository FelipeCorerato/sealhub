# Usando Organização no Frontend

## 🎯 Como Usar Dados da Organização nos Componentes

### Hook useOrganization

O hook `useOrganization()` te dá acesso a todos os dados da organização do usuário.

```typescript
import { useOrganization } from '@/contexts/OrganizationContext'

function MeuComponente() {
  const { organization, isAdmin, isLoading } = useOrganization()
  
  if (isLoading) {
    return <div>Carregando...</div>
  }
  
  if (!organization) {
    return <div>Sem organização</div>
  }
  
  return (
    <div>
      <h1>{organization.name}</h1>
      {/* Use os dados aqui */}
    </div>
  )
}
```

## 📊 Dados Disponíveis

### Informações Básicas

```typescript
organization.id              // "org_123"
organization.name           // "IASA Brasil"
organization.tradeName      // "IASA"
organization.cnpj           // "12.345.678/0001-90"
organization.description    // "Instituto de Auditoria..."
organization.status         // "active" | "inactive" | "suspended"
```

### Domínios de Email

```typescript
organization.emailDomains   // Array de domínios
// Exemplo:
[
  {
    domain: "@iasabrasil.com.br",
    active: true,
    addedAt: Date,
    addedBy: "user_id"
  }
]
```

### Tema/Branding

```typescript
organization.theme.primaryColor           // "#D97B35"
organization.theme.primaryHoverColor      // "#C16A2A"
organization.theme.lightBackgroundColor   // "#FFF5ED"
organization.theme.logoUrl               // "https://..." (opcional)
organization.theme.faviconUrl            // "https://..." (opcional)
```

### Configurações

```typescript
organization.settings.defaultSender       // "IASA Brasil"
organization.settings.defaultSignature    // "Att, Equipe IASA"
organization.settings.campaignCodePrefix  // "IASA"
organization.settings.timezone           // "America/Sao_Paulo"
organization.settings.language           // "pt-BR"
```

### Administração

```typescript
organization.adminUsers     // ["user_id_1", "user_id_2"]
organization.plan          // "free" | "basic" | "premium" | "enterprise"
organization.limits        // { maxUsers, maxCampaigns, maxCompanies }
```

### Verificação de Permissões

```typescript
isAdmin                    // true se usuário é admin da org
```

## 💡 Exemplos de Uso

### 1. Mostrar Nome da Empresa

```typescript
function Header() {
  const { organization } = useOrganization()
  
  return (
    <header>
      <h1>{organization?.name}</h1>
    </header>
  )
}
```

### 2. Usar Remetente Padrão

```typescript
function CampaignForm() {
  const { organization } = useOrganization()
  const [sender, setSender] = useState('')
  
  useEffect(() => {
    // Preencher com remetente padrão da organização
    if (organization?.settings.defaultSender) {
      setSender(organization.settings.defaultSender)
    }
  }, [organization])
  
  return (
    <input 
      value={sender}
      onChange={(e) => setSender(e.target.value)}
    />
  )
}
```

### 3. Mostrar Logo Personalizada

```typescript
function Logo() {
  const { organization } = useOrganization()
  
  if (organization?.theme.logoUrl) {
    return (
      <img 
        src={organization.theme.logoUrl} 
        alt={organization.name}
        className="h-8"
      />
    )
  }
  
  // Fallback para logo padrão
  return <DefaultLogo />
}
```

### 4. Usar Cor da Empresa

```typescript
function PrimaryButton({ children }: { children: React.ReactNode }) {
  const { organization } = useOrganization()
  
  return (
    <button
      style={{
        backgroundColor: organization?.theme.primaryColor || '#D97B35',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 
          organization?.theme.primaryHoverColor || '#C16A2A'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 
          organization?.theme.primaryColor || '#D97B35'
      }}
    >
      {children}
    </button>
  )
}
```

### 5. Verificar Permissões

```typescript
function AdminPanel() {
  const { isAdmin, organization } = useOrganization()
  
  if (!isAdmin) {
    return <div>Acesso negado</div>
  }
  
  return (
    <div>
      <h2>Painel Admin - {organization?.name}</h2>
      {/* Opções de administração */}
    </div>
  )
}
```

### 6. Prefixo de Código de Campanha

```typescript
function CampaignCodeGenerator() {
  const { organization } = useOrganization()
  
  const generateCode = () => {
    const prefix = organization?.settings.campaignCodePrefix || 'CAMP'
    const timestamp = Date.now()
    return `${prefix}-${timestamp}`
  }
  
  return (
    <div>
      <p>Código: {generateCode()}</p>
      {/* Exemplo: IASA-1234567890 */}
    </div>
  )
}
```

### 7. Filtrar Dados por Organização

```typescript
function CompaniesList() {
  const { organization } = useOrganization()
  const [companies, setCompanies] = useState([])
  
  useEffect(() => {
    if (organization) {
      // Buscar apenas companies da organização
      getCompanies(organization.id).then(setCompanies)
    }
  }, [organization])
  
  return (
    <div>
      <h2>Clientes - {organization?.name}</h2>
      <ul>
        {companies.map(company => (
          <li key={company.id}>{company.name}</li>
        ))}
      </ul>
    </div>
  )
}
```

### 8. Assinatura em Emails

```typescript
function EmailPreview() {
  const { organization } = useOrganization()
  
  return (
    <div className="email-preview">
      <p>Conteúdo do email...</p>
      <div className="signature">
        {organization?.settings.defaultSignature}
      </div>
    </div>
  )
}
```

### 9. Verificar Limites do Plano

```typescript
function CreateCampaignButton() {
  const { organization } = useOrganization()
  const [campaignCount, setCampaignCount] = useState(0)
  
  const canCreateCampaign = 
    !organization?.limits?.maxCampaigns ||
    campaignCount < organization.limits.maxCampaigns
  
  return (
    <button disabled={!canCreateCampaign}>
      {canCreateCampaign 
        ? 'Criar Campanha' 
        : `Limite atingido (${organization?.limits?.maxCampaigns})`
      }
    </button>
  )
}
```

### 10. Mostrar Informações da Org

```typescript
function OrganizationInfo() {
  const { organization, isAdmin } = useOrganization()
  
  return (
    <div className="org-info">
      <h2>{organization?.name}</h2>
      <p>{organization?.description}</p>
      
      <div className="details">
        <p>CNPJ: {organization?.cnpj}</p>
        <p>Plano: {organization?.plan}</p>
        <p>Domínios: {organization?.emailDomains.length}</p>
      </div>
      
      {isAdmin && (
        <button>Editar Organização</button>
      )}
    </div>
  )
}
```

## 🎨 Cores CSS (Aplicadas Automaticamente)

As cores da organização são aplicadas automaticamente como CSS variables:

```css
/* Já disponíveis globalmente */
var(--color-primary)           /* Cor primária da org */
var(--color-primary-hover)     /* Hover da cor primária */
var(--color-primary-light)     /* Fundo claro da org */
```

Use diretamente no CSS ou inline:

```typescript
<div style={{ backgroundColor: 'var(--color-primary)' }}>
  Conteúdo
</div>
```

## 🔄 Atualizar Organização

```typescript
function OrganizationSettings() {
  const { organization, refreshOrganization } = useOrganization()
  
  const handleSave = async () => {
    // Salvar alterações no Firestore
    await updateOrganization(organization.id, {
      name: 'Novo Nome'
    }, userId)
    
    // Recarregar dados
    await refreshOrganization()
  }
  
  return <button onClick={handleSave}>Salvar</button>
}
```

## ⚠️ Boas Práticas

### 1. Sempre Verificar se Existe

```typescript
// ✅ BOM
if (organization?.name) {
  return <h1>{organization.name}</h1>
}

// ❌ RUIM
return <h1>{organization.name}</h1> // Pode dar erro se null
```

### 2. Loading State

```typescript
// ✅ BOM
if (isLoading) {
  return <Spinner />
}

if (!organization) {
  return <div>Sem organização</div>
}

return <Content />
```

### 3. Valores Padrão

```typescript
// ✅ BOM
const sender = organization?.settings.defaultSender || 'Remetente Padrão'

// ✅ BOM
const color = organization?.theme.primaryColor || '#D97B35'
```

### 4. Memoização

```typescript
// ✅ BOM para cálculos pesados
const organizationName = useMemo(
  () => organization?.tradeName || organization?.name,
  [organization]
)
```

## 📱 Exemplo Completo: Sidebar Atualizada

```typescript
import { useOrganization } from '@/contexts/OrganizationContext'

function Sidebar() {
  const { organization, isAdmin } = useOrganization()
  
  return (
    <aside>
      {/* Logo + Nome da Empresa */}
      <div className="header">
        <Logo />
        {organization && (
          <p className="text-sm text-neutral-600">
            {organization.tradeName || organization.name}
          </p>
        )}
      </div>
      
      {/* Navegação */}
      <nav>
        <Link to="/clientes">Clientes</Link>
        <Link to="/campanhas">Campanhas</Link>
        {isAdmin && (
          <Link to="/configuracoes">Configurações</Link>
        )}
      </nav>
      
      {/* Footer */}
      <div className="footer">
        <p className="text-xs">
          Plano: {organization?.plan}
        </p>
      </div>
    </aside>
  )
}
```

## 🎯 Resumo

| Preciso de... | Use... |
|--------------|--------|
| Nome da empresa | `organization.name` |
| Nome comercial | `organization.tradeName` |
| Remetente padrão | `organization.settings.defaultSender` |
| Cor da empresa | `organization.theme.primaryColor` |
| Verificar se é admin | `isAdmin` |
| Recarregar dados | `refreshOrganization()` |
| Loading | `isLoading` |

---

**Tudo disponível através de um único hook!** 🎉


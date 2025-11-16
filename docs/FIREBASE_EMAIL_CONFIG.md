# Configuração de Email no Firebase

## 📧 Personalizar Templates de Email

### Acessar Templates

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto
3. Vá em **Authentication**
4. Clique na aba **Templates**

### Templates Disponíveis

O Firebase oferece templates para:

1. **Verificação de email** ✅ (estamos usando)
2. **Redefinição de senha**
3. **Alteração de email**
4. **SMS de verificação**

## 🎨 Personalização do Email de Verificação

### 1. Configurações Básicas

```
Nome do Remetente: VGSA - Gestão de Selos
Email de Resposta: noreply@seudominio.com (configurável)
```

### 2. Conteúdo Sugerido

**Assunto:**
```
Verifique seu email corporativo - VGSA
```

**Corpo do Email:**
```html
Olá %DISPLAY_NAME%,

Bem-vindo à plataforma VGSA de Gestão de Selos!

Para começar a usar o sistema, você precisa verificar seu email corporativo.

Por favor, clique no link abaixo para confirmar seu endereço de email:

%LINK%

Este link expirará em 3 dias.

Se você não criou esta conta, pode ignorar este email.

---
VGSA - Gestão de Selos
© 2025 Todos os direitos reservados
```

### 3. Variáveis Disponíveis

O Firebase oferece as seguintes variáveis:

- `%DISPLAY_NAME%` - Nome do usuário
- `%EMAIL%` - Email do usuário
- `%LINK%` - Link de verificação
- `%APP_NAME%` - Nome do aplicativo

## 🌐 Configurar URL de Redirecionamento

### No Firebase Console

1. Vá em **Authentication** → **Settings**
2. Seção **Authorized domains**
3. Adicione seus domínios:
   - `localhost` (desenvolvimento)
   - `seuhub.web.app` (Firebase Hosting)
   - `seudominio.com` (domínio personalizado)

### No Código

Atualize `/src/lib/firebase.ts`:

```typescript
import { getAuth } from 'firebase/auth'

export const auth = getAuth(app)

// Configurar idioma para português
auth.languageCode = 'pt-BR'

// Configurar URL para ações de email
export const actionCodeSettings = {
  url: import.meta.env.PROD 
    ? 'https://seudominio.com/email-verificado'
    : 'http://localhost:5173/email-verificado',
  handleCodeInApp: false,
}
```

E use no registro:

```typescript
await sendEmailVerification(user, actionCodeSettings)
```

## 🔧 Configurar SMTP Personalizado (Opcional)

Por padrão, o Firebase usa servidores próprios. Para usar SMTP personalizado:

### Usando Firebase Extensions

1. Instale a extensão [Trigger Email](https://extensions.dev/extensions/firebase/firestore-send-email)
2. Configure suas credenciais SMTP
3. Personalize completamente os emails

### Configuração SMTP

```javascript
// Configuração de exemplo
SMTP_CONNECTION_URI=smtps://email@empresa.com:senha@smtp.gmail.com:465
MAIL_FROM=noreply@empresa.com
```

## 📱 Configurar Email no Ambiente de Desenvolvimento

### Modo de Teste

Para testar sem enviar emails reais:

1. Firebase Console → **Authentication** → **Settings**
2. Seção **Email enumeration protection**
3. Adicione emails de teste

### Usar MailHog (Local)

Para interceptar emails localmente:

```bash
# Instalar MailHog
brew install mailhog

# Executar
mailhog

# Acessar: http://localhost:8025
```

## 🎯 Melhorias de Deliverability

### 1. SPF e DKIM

Configure registros DNS se usar domínio personalizado:

```dns
TXT @ "v=spf1 include:_spf.google.com ~all"
```

### 2. DMARC

```dns
TXT _dmarc "v=DMARC1; p=quarantine; rua=mailto:dmarc@seudominio.com"
```

### 3. Domínio Verificado

No Firebase Console:
1. **Authentication** → **Settings** → **Email**
2. Configure domínio personalizado
3. Verifique propriedade do domínio

## 📊 Monitoramento

### Firebase Console

Monitore em **Authentication**:
- Usuários com email verificado
- Usuários pendentes de verificação
- Taxa de verificação

### Google Analytics (Opcional)

```typescript
import { logEvent } from 'firebase/analytics'
import { analytics } from '@/lib/firebase'

// Ao enviar email
logEvent(analytics, 'email_verification_sent', {
  email: userEmail,
})

// Ao verificar email
logEvent(analytics, 'email_verified', {
  email: userEmail,
})
```

## 🚨 Troubleshooting

### Problema: Emails vão para spam

**Soluções:**
1. Configure SPF, DKIM, DMARC
2. Use domínio verificado
3. Evite palavras de spam no conteúdo
4. Mantenha baixa taxa de bounce

### Problema: Emails não chegam

**Verificações:**
1. Domínio está autorizado no Firebase?
2. Email existe e está ativo?
3. Limite de envios do Firebase atingido?
4. Verifique logs no Firebase Console

### Problema: Link de verificação não funciona

**Soluções:**
1. Verifique domínios autorizados
2. Certifique-se que URL está correta
3. Link pode ter expirado (3 dias)
4. Reenvie o email

## 🔐 Segurança

### Proteção contra Spam

O Firebase já implementa:
- Rate limiting automático
- Detecção de bots
- Proteção contra enumeração de emails

### Proteção Adicional

```typescript
// Limitar reenvios no frontend
const [lastSent, setLastSent] = useState<Date | null>(null)

const canResend = () => {
  if (!lastSent) return true
  const diffMinutes = (Date.now() - lastSent.getTime()) / 60000
  return diffMinutes >= 5 // Mínimo 5 minutos entre reenvios
}
```

## 📚 Recursos

- [Firebase Email Templates](https://firebase.google.com/docs/auth/custom-email-handler)
- [Email Best Practices](https://firebase.google.com/docs/auth/admin/email-templates)
- [SMTP Configuration](https://extensions.dev/extensions/firebase/firestore-send-email)

## ✅ Checklist de Configuração

- [ ] Personalizar template de verificação no Firebase Console
- [ ] Configurar nome do remetente
- [ ] Adicionar domínios autorizados
- [ ] Configurar idioma português no código
- [ ] Testar envio de email
- [ ] Verificar pasta de spam
- [ ] Configurar SPF/DKIM (se domínio personalizado)
- [ ] Monitorar taxa de entrega
- [ ] Configurar analytics (opcional)
- [ ] Documentar processo para equipe


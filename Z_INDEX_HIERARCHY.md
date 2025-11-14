# Hierarquia de Z-Index

Este documento descreve a hierarquia de z-index utilizada na aplicação para evitar conflitos de sobreposição entre elementos.

## 🎨 Tokens CSS (Design System)

Todos os valores de z-index são definidos como **tokens CSS** no arquivo `src/styles/tokens.css`:

```css
/* Z-index Hierarchy - Organized layers for proper stacking */
--z-base: 0;
--z-sidebar: 10;
--z-topbar: 20;
--z-content: 30;
--z-footer: 40;
--z-floating-button: 40;        /* Same level as footer */
--z-modal: 50;                  /* Modals, sheets, dialogs */
--z-accessibility-menu: 70;     /* Accessibility menu when open */
--z-toast: 80;                  /* Always on top */
```

**Vantagens dos tokens:**
- ✅ **Semântico**: Nomes descritivos ao invés de números mágicos
- ✅ **Manutenibilidade**: Alterar em um único lugar
- ✅ **Consistência**: Valores padronizados em toda a aplicação
- ✅ **Design System**: Segue padrão de design tokens

## 📊 Camadas Organizadas

```
┌─────────────────────────────────────┐
│  Toasts (z-index: 80)              │  ← Sempre visível no topo
├─────────────────────────────────────┤
│  Accessibility Menu (z-index: 70)  │  ← Menu + Overlay (quando aberto)
├─────────────────────────────────────┤
│  Modals/Sheets (z-index: 50)       │  ← Modais e drawers
├─────────────────────────────────────┤
│  Footer Bar (z-index: 40)          │  ← Barra inferior
│  Accessibility Button (z-index: 40)│  ← Botão flutuante (mesmo nível)
├─────────────────────────────────────┤
│  Content (z-index: 30)             │  ← Conteúdo principal
├─────────────────────────────────────┤
│  Top Bar (z-index: 20)             │  ← Barra superior
├─────────────────────────────────────┤
│  Sidebar (z-index: 10)             │  ← Menu lateral
├─────────────────────────────────────┤
│  Base (z-index: 0)                 │  ← Elementos básicos
└─────────────────────────────────────┘
```

## 🎯 Valores Definidos

### Elementos de Interface

| Elemento | Token CSS | Valor | Local | Descrição |
|----------|-----------|-------|-------|-----------|
| **Toasts** | `--z-toast` | 80 | `src/app/providers.tsx` | Notificações (Sonner) - **top-right**, sempre visíveis |
| **Accessibility Menu** | `--z-accessibility-menu` | 70 | `src/styles/accessibility.css` | Menu e overlay de acessibilidade (quando aberto) |
| **Modals/Sheets** | `--z-modal` | 50 | `src/components/ui/sheet.tsx` | Modais e drawers (Radix UI) |
| **Footer Bar** | `--z-footer` | 40 | `src/components/FooterBar.tsx` | Barra de ação inferior |
| **Accessibility Button** | `--z-floating-button` | 40 | `src/styles/accessibility.css` | Botão flutuante - fica atrás de modais |

## 🔧 Comportamentos Especiais

### Toasts (Notificações)
- **Token**: `var(--z-toast)`
- **Valor**: 80
- **Posição**: `top-right` (canto superior direito)
- **Motivo**: Evita conflito com o floating button no bottom-right
- **UX**: Padrão moderno seguido por GitHub, Vercel, e outras plataformas

### Botão de Acessibilidade
- **Token**: `var(--z-floating-button)`
- **Valor**: 40 (mesmo nível do Footer, **fica atrás de modais**)
- **Posição padrão**: `bottom: 2rem`
- **Com Footer visível**: `bottom: 7rem` (ajuste automático)
- Detecta a presença do Footer via MutationObserver
- **Comportamento**: Quando um modal está aberto, o botão fica por baixo para não atrapalhar a visualização

### Menu de Acessibilidade
- **Token**: `var(--z-accessibility-menu)`
- **Valor**: 70
- **Posição padrão**: `bottom: 6rem`
- **Com Footer visível**: `bottom: 11rem` (ajuste automático)
- Sincronizado com o botão flutuante

### Modals/Sheets
- **Token**: `var(--z-modal)`
- **Valor**: 50
- Usado por todos os componentes modais (Sheet, Dialog, etc.)

### Footer Bar
- **Token**: `var(--z-footer)`
- **Valor**: 40
- Aparece dinamicamente ao selecionar cliente
- Garante que fique acima do conteúdo mas abaixo de modais

## 📝 Regras de Uso

1. **SEMPRE use tokens CSS** ao invés de valores numéricos diretos
2. **Nunca use z-index acima de 80** sem atualizar o sistema de tokens
3. **Use valores múltiplos de 10** para facilitar inserção de novos elementos
4. **Documente qualquer novo token** adicionado ao sistema
5. **Mantenha a hierarquia lógica**: elementos mais "globais" têm z-index maior

### ✅ Exemplos Corretos

```css
/* CSS */
.meu-elemento {
  z-index: var(--z-modal);
}
```

```jsx
/* React/TSX */
<div style={{ zIndex: 'var(--z-footer)' }}>...</div>
```

### ❌ Exemplos Incorretos

```css
/* Não faça isso - valor hardcoded */
.meu-elemento {
  z-index: 50;
}
```

```jsx
/* Não faça isso - número mágico */
<div style={{ zIndex: 40 }}>...</div>
```

## 🚀 Como Adicionar Novo Elemento

1. Identifique onde ele se encaixa na hierarquia visual
2. Escolha um z-index adequado (use múltiplos de 10)
3. **Adicione o token em `src/styles/tokens.css`**
4. Use o token no seu componente com `var(--z-nome-do-token)`
5. Adicione neste documento
6. Teste conflitos com outros elementos
7. Atualize a tabela acima

## 🧪 Testes

Ao modificar z-index, teste os seguintes cenários:

- [ ] Toast aparece sobre tudo
- [ ] Menu de acessibilidade não cobre toasts
- [ ] Modal de temas fica sobre o footer
- [ ] Footer não cobre o botão de acessibilidade
- [ ] Overlay do menu cobre tudo exceto o próprio menu
- [ ] Botão de acessibilidade se reposiciona com footer visível

## 📚 Referências

- **Radix UI Dialog**: z-50 (padrão)
- **Sonner Toasts**: z-80 (customizado)
- **Floating Elements**: z-60+ (acessibilidade)

---

**Última atualização**: 2025-11-14
**Autor**: Sistema de z-index organizado e documentado


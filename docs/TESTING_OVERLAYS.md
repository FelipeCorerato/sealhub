# 🧪 Guia de Testes - Sobreposição de Elementos

Este guia ajuda a testar a hierarquia de z-index e verificar se os elementos estão se comportando corretamente.

## 📋 Cenários de Teste

### ✅ Cenário 1: Toast Sem Conflito com Elementos
**Objetivo**: Verificar que toasts aparecem no top-right sem conflitar

**Passos**:
1. Abra o menu de acessibilidade (botão flutuante no canto inferior direito)
2. Com o menu aberto, realize uma ação que gere um toast (ex: salvar cliente)
3. ✓ O toast deve aparecer no **canto superior direito**
4. ✓ O toast NÃO deve cobrir o menu de acessibilidade
5. ✓ O toast NÃO deve cobrir o botão flutuante
6. ✓ Ambos os elementos permanecem totalmente visíveis

---

### ✅ Cenário 2: Modal de Temas sobre Footer
**Objetivo**: Verificar que o modal de temas fica acima do footer

**Passos**:
1. Vá para a página de Clientes
2. Selecione um cliente para editar (footer aparece na parte inferior)
3. Abra o seletor de temas (ícone de paleta no topo)
4. ✓ O modal deve aparecer ACIMA do footer
5. ✓ O footer não deve sobrepor o modal

---

### ✅ Cenário 3: Botão de Acessibilidade com Footer
**Objetivo**: Verificar que o botão se reposiciona quando o footer aparece

**Passos**:
1. Vá para a página de Clientes
2. Observe a posição inicial do botão de acessibilidade (canto inferior direito)
3. Selecione um cliente (footer aparece)
4. ✓ O botão deve SUBIR automaticamente
5. ✓ O botão não deve ficar coberto pelo footer
6. Desselecione o cliente (footer desaparece)
7. ✓ O botão deve VOLTAR à posição original

**Posições esperadas**:
- Sem footer: `bottom: 2rem`
- Com footer: `bottom: 7rem`

---

### ✅ Cenário 4: Menu de Acessibilidade com Footer
**Objetivo**: Verificar que o menu se reposiciona junto com o botão

**Passos**:
1. Vá para a página de Clientes
2. Selecione um cliente (footer aparece)
3. Abra o menu de acessibilidade
4. ✓ O menu deve aparecer ACIMA do footer
5. ✓ O menu não deve ficar coberto
6. ✓ A distância entre botão e menu deve ser consistente

**Posições esperadas**:
- Sem footer: `bottom: 6rem`
- Com footer: `bottom: 11rem`

---

### ✅ Cenário 5: Overlay do Menu
**Objetivo**: Verificar que o overlay cobre tudo exceto o menu e toasts

**Passos**:
1. Abra o menu de acessibilidade
2. ✓ O overlay (fundo escuro) deve cobrir todo o conteúdo
3. ✓ O menu deve estar SOBRE o overlay
4. Gere um toast (qualquer ação)
5. ✓ O toast deve aparecer SOBRE o overlay
6. Clique no overlay (fora do menu)
7. ✓ O menu deve fechar

---

### ✅ Cenário 6: Botão Atrás de Modais
**Objetivo**: Verificar que o botão fica atrás de modais sem atrapalhar

**Passos**:
1. Observe o botão de acessibilidade no canto inferior direito
2. Abra o seletor de temas (ícone de paleta)
3. ✓ O modal deve aparecer SOBRE o botão
4. ✓ O botão deve ficar parcialmente ou totalmente coberto
5. ✓ Isso evita distração visual durante uso do modal
6. Feche o modal
7. ✓ O botão deve voltar a ficar visível

**Comportamento esperado**:
- Modal (z-50) > Botão (z-40)
- O usuário foca no modal sem interferência visual

---

### ✅ Cenário 7: Múltiplos Elementos Simultaneamente
**Objetivo**: Teste de stress com todos os elementos visíveis

**Passos**:
1. Vá para a página de Clientes
2. Selecione um cliente (footer aparece)
3. Abra o menu de acessibilidade
4. Gere um toast
5. Abra o seletor de temas

**Ordem esperada (de cima para baixo)**:
1. 🥇 Toast (z-80) - **top-right**, sem conflitos
2. 🥈 Menu de Acessibilidade (z-70) - bottom-right, quando aberto
3. 🥉 Modal de Temas (z-50) - centro da tela
4. 🏅 Footer (z-40) - bottom
5. 🏅 Botão de Acessibilidade (z-40) - bottom-right, **atrás de modais**
6. 📄 Conteúdo (z-0)

**Nota**: Toasts e botão de acessibilidade ocupam **áreas diferentes** da tela, evitando qualquer conflito visual.

---

## 🐛 Problemas Conhecidos e Soluções

### Problema: Botão não reposiciona quando footer aparece
**Solução**: Verifique o console do navegador. O MutationObserver deve estar detectando mudanças no DOM.

### Problema: Toast fica atrás de algum elemento
**Solução**: Verifique se o z-index 80 está sendo aplicado no `providers.tsx`

### Problema: Modal não abre sobre o footer
**Solução**: Verifique se o z-index 50 está aplicado no componente Sheet (Radix UI)

---

## 🔍 Ferramentas de Debug

### Chrome DevTools
1. Abra DevTools (F12)
2. Vá para a aba **Elements**
3. Selecione o elemento problemático
4. Na aba **Computed**, procure por `z-index`
5. Verifique se o valor está correto

### Console Commands

```javascript
// Verificar z-index de todos os elementos fixos/absolutos
document.querySelectorAll('[style*="z-index"], .accessibility-floating-button, .accessibility-menu').forEach(el => {
  console.log(el.className, window.getComputedStyle(el).zIndex)
})

// Verificar se footer está visível
console.log('Footer visível:', !!document.querySelector('.fixed.bottom-0'))

// Forçar verificação do footer no AccessibilityMenu
window.dispatchEvent(new Event('resize'))
```

---

## ✨ Checklist Final

Antes de considerar os testes completos, verifique:

- [ ] Toasts aparecem no **top-right** sem conflitos
- [ ] Toasts não cobrem o botão de acessibilidade (estão em áreas diferentes)
- [ ] Menu de acessibilidade não cobre toasts (estão em áreas diferentes)
- [ ] Modal de temas fica sobre o footer
- [ ] **Botão de acessibilidade fica ATRÁS de modais (não atrapalha)**
- [ ] Footer não cobre o botão de acessibilidade
- [ ] Botão se reposiciona automaticamente com footer
- [ ] Menu se reposiciona automaticamente com footer
- [ ] Overlay cobre todo o conteúdo mas não o menu
- [ ] Todos os elementos são clicáveis quando esperado
- [ ] Não há elementos "presos" atrás de outros (exceto botão atrás de modal)
- [ ] Transições são suaves e sem flickering

---

## 📞 Suporte

Se encontrar problemas não listados aqui:
1. Verifique o arquivo `Z_INDEX_HIERARCHY.md`
2. Consulte os valores no `src/styles/accessibility.css`
3. Revise a lógica no `src/components/AccessibilityMenu.tsx`

**Última atualização**: 2025-11-14


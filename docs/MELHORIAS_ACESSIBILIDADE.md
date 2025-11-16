# Melhorias de Acessibilidade - Modal Responsivo

## Problema Identificado

O modal de acessibilidade tinha dimensões fixas (em pixels) que causavam problemas quando o usuário aumentava o tamanho da fonte. O conteúdo quebrava de forma inadequada e ficava difícil de ler.

## Melhorias Implementadas

### 1. **Unidades Relativas**
- Substituídas unidades fixas (`px`) por unidades relativas (`em`, `rem`)
- Isso permite que todos os elementos escalonem proporcionalmente com o tamanho da fonte

### 2. **Layout Flexível**
- **Modal**: Agora usa `min-width` e `max-width` com `calc()` para adaptar-se melhor
  - `min-width: min(22.5rem, calc(100vw - 4rem))`
  - `max-width: min(28rem, calc(100vw - 4rem))`
  - Altura máxima também é relativa: `max-height: min(37.5rem, calc(100vh - 10rem))`

- **Flexbox**: O modal usa `display: flex` com `flex-direction: column`
  - Header fixo no topo (`flex-shrink: 0`)
  - Conteúdo com scroll (`flex: 1`, `overflow-y: auto`)

### 3. **Quebra de Texto Inteligente**
- Adicionado `overflow-wrap: break-word` e `word-break: break-word`
- Textos longos agora quebram adequadamente sem sair dos limites

### 4. **Alinhamento Melhorado**
- Ícones alinhados ao topo (`align-items: flex-start`) em vez do centro
- Isso previne problemas quando o texto cresce e ocupa múltiplas linhas
- Ícones têm dimensões fixas (`width: 1.25rem; height: 1.25rem`) para consistência

### 5. **Scrollbar Personalizado**
- Scrollbar visível e estilizado para ambos os modos (claro e escuro)
- Cores suaves que não interferem na experiência
- Suporte para Firefox (`scrollbar-width: thin`)

### 6. **Responsividade Mobile**
- Modal ocupa largura total em telas pequenas (`width: auto`)
- Paddings reduzidos proporcionalmente
- Melhor uso do espaço disponível

### 7. **Line Height**
- Adicionado `line-height: 1.4` em todos os textos
- Melhora a legibilidade, especialmente em fontes maiores

## Tamanhos de Fonte Suportados

O modal agora funciona perfeitamente com todos os tamanhos de fonte:
- **12px**: Mínimo
- **16px**: Padrão
- **20px**: Médio
- **24px**: Máximo

## Testes Recomendados

1. ✅ Abrir o modal com fonte padrão (16px)
2. ✅ Aumentar a fonte para 20px - verificar que o conteúdo se reorganiza
3. ✅ Aumentar para 24px (máximo) - verificar que tudo ainda é legível
4. ✅ Testar em modo escuro
5. ✅ Testar em alto contraste
6. ✅ Testar em dispositivos móveis
7. ✅ Verificar scroll quando necessário

## Comportamento Esperado

### Com Fonte Padrão (16px)
- Modal compacto e centrado
- Todo conteúdo visível sem scroll

### Com Fonte Aumentada (20-24px)
- Modal expande para acomodar texto maior
- Layout se ajusta automaticamente
- Scroll aparece se necessário
- Textos não quebram de forma estranha
- Ícones mantêm posição adequada

## Compatibilidade

- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile (iOS/Android)

## Código Modificado

- `src/styles/accessibility.css`: Estilos do modal de acessibilidade
  - `.accessibility-menu`
  - `.accessibility-menu-header`
  - `.accessibility-menu-content`
  - `.accessibility-menu-item`
  - `.accessibility-menu-item-text`
  - `.accessibility-font-button`
  - Scrollbar customizado
  - Media queries responsivas


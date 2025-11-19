import { useState, useEffect, useRef } from 'react'
import { useAccessibility } from '../contexts/AccessibilityContext'
import {
  Moon,
  Sun,
  Contrast,
  Type,
  Minus,
  Plus,
  RotateCcw,
  X,
} from 'lucide-react'

function AccessibilityIcon({ size = '1.75em' }: { size?: string | number }) {
  const sizeValue = typeof size === 'number' ? `${size}px` : size
  return (
    <svg
      width={sizeValue}
      height={sizeValue}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ fontSize: 'inherit' }}
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none" />
      {/* Figura humana estilizada - cabeça, corpo, braços e pernas */}
      <path
        d="M12 7.5C12.8284 7.5 13.5 6.82843 13.5 6C13.5 5.17157 12.8284 4.5 12 4.5C11.1716 4.5 10.5 5.17157 10.5 6C10.5 6.82843 11.1716 7.5 12 7.5Z"
        fill="currentColor"
      />
      <path
        d="M8.5 9.5C8.5 9.5 9.5 10.5 12 10.5C14.5 10.5 15.5 9.5 15.5 9.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M12 10.5V16"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M12 16L10 18.5M12 16L14 18.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}

export function AccessibilityMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const [hasFooter, setHasFooter] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const triggerButtonRef = useRef<HTMLButtonElement>(null)
  const {
    isDarkMode,
    isHighContrast,
    fontSize,
    toggleDarkMode,
    toggleHighContrast,
    increaseFontSize,
    decreaseFontSize,
    resetAccessibility,
  } = useAccessibility()

  // Detecta se há um footer visível na página
  useEffect(() => {
    const checkFooter = () => {
      const footer = document.querySelector('footer, [class*="FooterBar"], .fixed.bottom-0')
      const hasVisibleFooter = footer && window.getComputedStyle(footer).display !== 'none'
      setHasFooter(!!hasVisibleFooter)
    }

    // Verifica inicialmente
    checkFooter()

    // Observa mudanças no DOM
    const observer = new MutationObserver(checkFooter)
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style']
    })

    // Verifica também ao redimensionar
    window.addEventListener('resize', checkFooter)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', checkFooter)
    }
  }, [])

  // Função para obter todos os elementos focáveis dentro do menu
  const getFocusableElements = (container: HTMLElement): HTMLElement[] => {
    const focusableSelectors = [
      'button:not([disabled])',
      'a[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ')

    return Array.from(container.querySelectorAll(focusableSelectors)) as HTMLElement[]
  }

  // Focus trap: mantém o foco dentro do modal quando aberto
  useEffect(() => {
    if (!isOpen || !menuRef.current) return

    const menu = menuRef.current
    
    // Função auxiliar para obter elementos focáveis atualizados
    const getCurrentFocusableElements = () => getFocusableElements(menu)

    // Foca no primeiro elemento quando o menu abre (com pequeno delay para garantir DOM atualizado)
    const focusFirstElement = () => {
      const focusableElements = getCurrentFocusableElements()
      if (focusableElements.length > 0) {
        focusableElements[0].focus()
      }
    }

    // Pequeno delay para garantir que o DOM foi renderizado
    const timeoutId = setTimeout(focusFirstElement, 0)

    // Handler para capturar Tab e Shift+Tab
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      const focusableElements = getCurrentFocusableElements()
      if (focusableElements.length === 0) return

      const currentFocus = document.activeElement as HTMLElement
      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      // Verifica se o foco está dentro do menu
      if (!menu.contains(currentFocus)) {
        e.preventDefault()
        firstElement.focus()
        return
      }

      const currentIndex = focusableElements.indexOf(currentFocus)

      // Se não encontrou o elemento atual, foca no primeiro
      if (currentIndex === -1) {
        e.preventDefault()
        firstElement.focus()
        return
      }

      // Tab (avançar)
      if (!e.shiftKey) {
        // Se está no último elemento, volta para o primeiro
        if (currentIndex === focusableElements.length - 1) {
          e.preventDefault()
          firstElement.focus()
        }
      }
      // Shift+Tab (voltar)
      else {
        // Se está no primeiro elemento, vai para o último
        if (currentIndex === 0) {
          e.preventDefault()
          lastElement.focus()
        }
      }
    }

    // Adiciona o listener
    document.addEventListener('keydown', handleKeyDown, true)

    // Previne que elementos fora do menu recebam foco
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement
      
      // Permite foco no botão trigger quando o menu está fechando
      if (target === triggerButtonRef.current) {
        return
      }

      // Se o foco saiu do menu, redireciona para dentro
      if (!menu.contains(target)) {
        const focusableElements = getCurrentFocusableElements()
        if (focusableElements.length > 0) {
          // Usa requestAnimationFrame para garantir que o foco seja aplicado após o evento
          requestAnimationFrame(() => {
            focusableElements[0].focus()
          })
        }
      }
    }

    document.addEventListener('focusin', handleFocusIn, true)

    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener('keydown', handleKeyDown, true)
      document.removeEventListener('focusin', handleFocusIn, true)
    }
  }, [isOpen])

  const toggleMenu = () => {
    setIsOpen(prev => {
      const willOpen = !prev
      
      // Se está fechando, devolve o foco para o botão que abriu
      if (!willOpen && triggerButtonRef.current) {
        // Usa setTimeout para garantir que o estado foi atualizado
        setTimeout(() => {
          triggerButtonRef.current?.focus()
        }, 0)
      }
      
      return willOpen
    })
  }

  const handleReset = () => {
    resetAccessibility()
  }

  // Calcula a posição do menu baseado na presença do footer
  const menuStyle = {
    bottom: hasFooter ? '11rem' : '6rem',
  }

  return (
    <>
      {/* Floating Button */}
      <button
        ref={triggerButtonRef}
        onClick={toggleMenu}
        className="accessibility-floating-button"
        aria-label="Menu de Acessibilidade"
        title="Menu de Acessibilidade"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        <AccessibilityIcon size="2em" />
      </button>

      {/* Menu Panel */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="accessibility-overlay"
            onClick={toggleMenu}
            aria-hidden="true"
            tabIndex={-1}
          />

          {/* Menu */}
          <div
            ref={menuRef}
            className="accessibility-menu"
            style={menuStyle}
            role="dialog"
            aria-modal="true"
            aria-labelledby="accessibility-menu-title"
          >
            {/* Header */}
            <div className="accessibility-menu-header">
              <div className="accessibility-menu-title">
                <AccessibilityIcon size="1.5em" />
                <h2 id="accessibility-menu-title">Acessibilidade</h2>
              </div>
              <button
                onClick={toggleMenu}
                className="accessibility-close-button"
                aria-label="Fechar menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Menu Items */}
            <div className="accessibility-menu-content">
              {/* Dark Mode */}
              <button
                onClick={toggleDarkMode}
                className={`accessibility-menu-item ${isDarkMode ? 'active' : ''}`}
                aria-pressed={isDarkMode}
              >
                <div className="accessibility-menu-item-icon">
                  {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
                </div>
                <div className="accessibility-menu-item-text">
                  <span className="accessibility-menu-item-label">
                    {isDarkMode ? 'Modo Claro' : 'Modo Escuro'}
                  </span>
                  <span className="accessibility-menu-item-description">
                    {isDarkMode ? 'Ativar tema claro' : 'Ativar tema escuro'}
                  </span>
                </div>
              </button>

              {/* High Contrast */}
              <button
                onClick={toggleHighContrast}
                className={`accessibility-menu-item ${isHighContrast ? 'active' : ''}`}
                aria-pressed={isHighContrast}
              >
                <div className="accessibility-menu-item-icon">
                  <Contrast size={20} />
                </div>
                <div className="accessibility-menu-item-text">
                  <span className="accessibility-menu-item-label">
                    Alto Contraste
                  </span>
                  <span className="accessibility-menu-item-description">
                    {isHighContrast ? 'Desativar' : 'Ativar'} modo de alto contraste
                  </span>
                </div>
              </button>

              {/* Font Size Control */}
              <div className="accessibility-menu-section">
                <div className="accessibility-menu-item-icon">
                  <Type size={20} />
                </div>
                <div className="accessibility-menu-item-text">
                  <span className="accessibility-menu-item-label">
                    Tamanho da Fonte
                  </span>
                  <span className="accessibility-menu-item-description">
                    Tamanho atual: {fontSize}px
                  </span>
                </div>
              </div>

              {/* Font Size Buttons */}
              <div className="accessibility-font-controls">
                <button
                  onClick={decreaseFontSize}
                  className="accessibility-font-button"
                  aria-label="Diminuir fonte"
                  disabled={fontSize <= 12}
                >
                  <Minus size={16} />
                  <span>Diminuir</span>
                </button>
                <button
                  onClick={increaseFontSize}
                  className="accessibility-font-button"
                  aria-label="Aumentar fonte"
                  disabled={fontSize >= 24}
                >
                  <Plus size={16} />
                  <span>Aumentar</span>
                </button>
              </div>

              {/* Reset */}
              <button
                onClick={handleReset}
                className="accessibility-menu-item reset"
              >
                <div className="accessibility-menu-item-icon">
                  <RotateCcw size={20} />
                </div>
                <div className="accessibility-menu-item-text">
                  <span className="accessibility-menu-item-label">
                    Redefinir Configurações
                  </span>
                  <span className="accessibility-menu-item-description">
                    Restaurar padrões de acessibilidade
                  </span>
                </div>
              </button>
            </div>
          </div>
        </>
      )}
    </>
  )
}


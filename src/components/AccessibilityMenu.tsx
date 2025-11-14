import { useState, useEffect } from 'react'
import { useAccessibility } from '../contexts/AccessibilityContext'
import {
  Moon,
  Sun,
  Contrast,
  Type,
  Minus,
  Plus,
  RotateCcw,
  Accessibility,
  X,
} from 'lucide-react'

export function AccessibilityMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const [hasFooter, setHasFooter] = useState(false)
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

  const toggleMenu = () => {
    setIsOpen(prev => !prev)
  }

  const handleReset = () => {
    resetAccessibility()
  }

  // Calcula a posição do botão baseado na presença do footer
  const buttonStyle = {
    bottom: hasFooter ? '7rem' : '2rem',
  }

  const menuStyle = {
    bottom: hasFooter ? '11rem' : '6rem',
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={toggleMenu}
        className="accessibility-floating-button"
        style={buttonStyle}
        aria-label="Menu de Acessibilidade"
        title="Menu de Acessibilidade"
      >
        <Accessibility size={24} />
      </button>

      {/* Menu Panel */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="accessibility-overlay"
            onClick={toggleMenu}
            aria-hidden="true"
          />

          {/* Menu */}
          <div className="accessibility-menu" style={menuStyle}>
            {/* Header */}
            <div className="accessibility-menu-header">
              <div className="accessibility-menu-title">
                <Accessibility size={20} />
                <h2>Acessibilidade</h2>
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


import { useState } from 'react'
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

  const toggleMenu = () => {
    setIsOpen(prev => !prev)
  }

  const handleReset = () => {
    resetAccessibility()
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={toggleMenu}
        className="accessibility-floating-button"
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
          <div className="accessibility-menu">
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


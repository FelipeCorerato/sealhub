/**
 * Utilitários para manipulação de cores
 */

/**
 * Converte hex para RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

/**
 * Converte RGB para hex
 */
function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((x) => {
    const hex = Math.round(x).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')
}

/**
 * Escurece uma cor hex em uma porcentagem
 * @param hex - Cor em formato hexadecimal (#RRGGBB)
 * @param percent - Porcentagem para escurecer (0-100)
 */
export function darkenColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex

  const factor = (100 - percent) / 100
  return rgbToHex(rgb.r * factor, rgb.g * factor, rgb.b * factor)
}

/**
 * Clareia uma cor hex em uma porcentagem
 * @param hex - Cor em formato hexadecimal (#RRGGBB)
 * @param percent - Porcentagem para clarear (0-100)
 */
export function lightenColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex

  const factor = percent / 100
  return rgbToHex(
    rgb.r + (255 - rgb.r) * factor,
    rgb.g + (255 - rgb.g) * factor,
    rgb.b + (255 - rgb.b) * factor
  )
}

/**
 * Gera as cores do tema baseado na cor primária
 */
export function generateThemeColors(primaryColor: string) {
  return {
    primary: primaryColor,
    primaryHover: darkenColor(primaryColor, 15), // 15% mais escuro
    primaryLight: lightenColor(primaryColor, 88), // 88% mais claro
  }
}


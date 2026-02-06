/**
 * Parse a hex color string to RGB values.
 * Supports formats: #RGB, #RRGGBB
 */
export function hexToRgb(
  hex: string,
): { r: number; g: number; b: number } | null {
  const match = hex.match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!match) return null;
  const cleaned = match[1];
  if (cleaned.length === 3) {
    return {
      r: parseInt(cleaned[0] + cleaned[0], 16),
      g: parseInt(cleaned[1] + cleaned[1], 16),
      b: parseInt(cleaned[2] + cleaned[2], 16),
    };
  }
  return {
    r: parseInt(cleaned.substring(0, 2), 16),
    g: parseInt(cleaned.substring(2, 4), 16),
    b: parseInt(cleaned.substring(4, 6), 16),
  };
}

/**
 * Darken an RGB color by a given factor (0–1).
 */
function darken(
  rgb: { r: number; g: number; b: number },
  amount: number,
): { r: number; g: number; b: number } {
  const factor = 1 - amount;
  return {
    r: Math.round(rgb.r * factor),
    g: Math.round(rgb.g * factor),
    b: Math.round(rgb.b * factor),
  };
}

/**
 * Build inline style object for a colored tag chip.
 * Matches Flagsmith's dashboard style: light tinted background,
 * subtle border, and darkened text color.
 * Returns undefined if no color is provided.
 */
export function getTagChipStyle(
  color: string | undefined,
):
  | { backgroundColor: string; color: string; borderColor: string }
  | undefined {
  if (!color) return undefined;
  const rgb = hexToRgb(color);
  if (!rgb) return undefined;

  const textRgb = darken(rgb, 0.3);

  return {
    backgroundColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.08)`,
    color: `rgb(${textRgb.r}, ${textRgb.g}, ${textRgb.b})`,
    borderColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.24)`,
  };
}

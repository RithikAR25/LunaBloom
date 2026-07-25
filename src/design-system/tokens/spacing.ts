/**
 * LunaBloom Spacing Tokens
 * Base unit: 4pt. All values are multiples of 4.
 * See: docs/design/DESIGN.md
 */
export const spacing = {
  // Sanguine spacing scale
  base: 4,
  xs: 8,
  sm: 16,
  md: 24,
  lg: 40,
  xl: 64,
  containerMargin: 20,
  gutter: 16,

  // Legacy spacing (preserved)
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
} as const;

/** Standard screen horizontal padding */
export const SCREEN_HORIZONTAL_PADDING = spacing.containerMargin;

export type SpacingKey = keyof typeof spacing;

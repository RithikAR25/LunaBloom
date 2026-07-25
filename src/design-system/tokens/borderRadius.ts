/**
 * LunaBloom Border Radius Tokens
 * See: docs/design/DESIGN.md
 */
export const borderRadius = {
  // Sanguine radii
  xs: 4, // tags, chips
  sm: 8, // inputs, standard buttons
  md: 12,
  DEFAULT: 16, // large content cards and modals (1rem)
  lg: 16,
  xl: 24,
  '2xl': 32,
  full: 9999, // calendar dots, perfect circles
} as const;

export type BorderRadiusKey = keyof typeof borderRadius;

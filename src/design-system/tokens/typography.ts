/**
 * LunaBloom Typography Tokens
 * Font: Inter & Quicksand (loaded via expo-google-fonts)
 * See: docs/design/DESIGN.md
 */

export const fontFamily = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  headingRegular: 'Quicksand_400Regular',
  headingMedium: 'Quicksand_500Medium',
  headingSemiBold: 'Quicksand_600SemiBold',
  headingBold: 'Quicksand_700Bold',
} as const;

/** Font sizes in sp (scale-independent pixels — respects system font size) */
export const fontSize = {
  // Sanguine sizes
  headlineLg: 32,
  headlineLgMobile: 28,
  headlineMd: 24,
  headlineSm: 20,
  bodyLg: 18,
  bodyMd: 16,
  labelMd: 14,
  caption: 12,
  tabLabel: 11,
  
  // Legacy sizes (preserved for existing UI during transition)
  display: 34,
  heading1: 28,
  heading2: 22,
  heading3: 18,
  body: 15,
  label: 13,
  micro: 10,
} as const;

/** Line heights as multipliers */
export const lineHeight = {
  tight: 1.2,
  snug: 1.3,
  normal: 1.4,
  relaxed: 1.55,
  loose: 1.6,
} as const;

/** Letter spacing in points */
export const letterSpacing = {
  tight: -0.5,
  normal: 0,
  button: 0.2,
  medium: 0.3,
  wide: 0.5,
  wider: 0.8,
  pin: 4,
} as const;

export type FontSizeKey = keyof typeof fontSize;
export type FontFamilyKey = keyof typeof fontFamily;

/**
 * LunaBloom Typography Tokens
 * Font: Inter (loaded via expo-google-fonts)
 * See: docs/07_Design_System.md — Section 3: Typography
 */

export const fontFamily = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

/** Font sizes in sp (scale-independent pixels — respects system font size) */
export const fontSize = {
  display: 34,
  heading1: 28,
  heading2: 22,
  heading3: 18,
  body: 15,
  label: 13,
  caption: 12,
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
  wide: 0.5,
} as const;

export type FontSizeKey = keyof typeof fontSize;
export type FontFamilyKey = keyof typeof fontFamily;

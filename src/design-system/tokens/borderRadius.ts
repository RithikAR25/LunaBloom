/**
 * LunaBloom Border Radius Tokens
 * See: docs/07_Design_System.md — Section 5: Border Radius
 */
export const borderRadius = {
  /** 4pt — tags, chips */
  xs: 4,
  /** 8pt — inputs, small buttons */
  sm: 8,
  /** 12pt — cards */
  md: 12,
  /** 16pt — large cards */
  lg: 16,
  /** 24pt — bottom sheet corners */
  xl: 24,
  /** 32pt — pill-shaped elements */
  '2xl': 32,
  /** 9999pt — circular */
  full: 9999,
} as const;

export type BorderRadiusKey = keyof typeof borderRadius;

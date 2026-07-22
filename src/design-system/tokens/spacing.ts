/**
 * LunaBloom Spacing Tokens
 * Base unit: 4pt. All values are multiples of 4.
 * See: docs/07_Design_System.md — Section 4: Spacing Scale
 */
export const spacing = {
  /** 4pt */
  1: 4,
  /** 8pt */
  2: 8,
  /** 12pt */
  3: 12,
  /** 16pt — standard component padding */
  4: 16,
  /** 20pt */
  5: 20,
  /** 24pt — card padding */
  6: 24,
  /** 32pt */
  8: 32,
  /** 40pt — screen top padding */
  10: 40,
  /** 48pt */
  12: 48,
  /** 64pt */
  16: 64,
  /** 80pt — above tab bar padding */
  20: 80,
} as const;

/** Standard screen horizontal padding */
export const SCREEN_HORIZONTAL_PADDING = spacing[4];

export type SpacingKey = keyof typeof spacing;

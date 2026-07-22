/**
 * LunaBloom Motion & Animation Tokens
 * All animations use React Native Reanimated 3 (UI thread).
 * See: docs/07_Design_System.md — Section 8: Motion & Animation
 */
export const duration = {
  /** 100ms — toggle states, checkbox */
  instant: 100,
  /** 200ms — button press, micro-interactions */
  fast: 200,
  /** 300ms — screen transitions, card entrances */
  normal: 300,
  /** 500ms — feature reveals */
  slow: 500,
  /** 800ms — loading skeletons, progress bars */
  slowest: 800,
} as const;

/** Icon sizes in points */
export const iconSize = {
  /** 14pt — inline text icons */
  xs: 14,
  /** 18pt — button icons, list items */
  sm: 18,
  /** 22pt — tab navigation */
  md: 22,
  /** 28pt — feature icons */
  lg: 28,
  /** 40pt — illustration-grade icons */
  xl: 40,
} as const;

export type DurationKey = keyof typeof duration;
export type IconSizeKey = keyof typeof iconSize;

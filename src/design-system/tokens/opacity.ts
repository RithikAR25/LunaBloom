/**
 * LunaBloom Opacity Tokens
 */
export const opacity = {
  hover: 0.08,
  focus: 0.12,
  active: 0.12,
  disabled: 0.38,
  soft: 0.04,
} as const;

export type OpacityKey = keyof typeof opacity;

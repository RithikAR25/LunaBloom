/**
 * LunaBloom Z-Index Tokens
 */
export const zIndex = {
  base: 0,
  card: 10,
  floating: 20,
  modal: 30,
  toast: 40,
  tooltip: 50,
} as const;

export type ZIndexKey = keyof typeof zIndex;

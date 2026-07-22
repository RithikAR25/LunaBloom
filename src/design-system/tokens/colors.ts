/**
 * LunaBloom Color Tokens
 *
 * All colors are defined here. No color value may be hardcoded anywhere else in the app.
 * Components must reference these tokens via the active theme object.
 *
 * See: docs/07_Design_System.md — Section 2: Color Palette
 */

export const palette = {
  // Brand
  purple300: '#C4B5FD',
  purple400: '#A78BFA',
  purple600: '#7C3AED',
  purple700: '#6D28D9',

  // Secondary (teal)
  teal400: '#2DD4BF',
  teal600: '#0D9488',

  // Accent (amber)
  amber400: '#FCD34D',
  amber500: '#F59E0B',
  amber600: '#D97706',

  // Phase — Menstrual (rose)
  rose300: '#FDA4AF',
  rose400: '#F472B6',
  rose700: '#BE185D',

  // Phase — Follicular (green)
  green400: '#4ADE80',
  green700: '#15803D',

  // Phase — Ovulatory (amber) — uses amber scale above

  // Phase — Luteal (purple) — uses purple scale above

  // Neutral
  slate50: '#F8FAFC',
  slate100: '#F1F5F9',
  slate200: '#E2E8F0',
  slate300: '#CBD5E1',
  slate400: '#94A3B8',
  slate500: '#64748B',
  slate600: '#475569',
  slate700: '#334155',
  slate800: '#1E293B',
  slate900: '#0F172A',

  // Dark mode surfaces
  darkBg: '#0C0C14',
  darkSurface: '#16162A',
  darkSurfaceElevated: '#1E1E35',
  darkBorder: '#2A2A45',
  darkBorderSubtle: '#1A1A30',

  // Semantic
  green500: '#22C55E',
  yellow500: '#F59E0B',
  red500: '#EF4444',
  blue500: '#3B82F6',

  // Pure
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

export type PaletteKey = keyof typeof palette;

/**
 * LunaBloom Color Tokens
 *
 * All colors are defined here. No color value may be hardcoded anywhere else in the app.
 * Components must reference these tokens via the active theme object.
 *
 * See: docs/07_Design_System.md — Section 2: Color Palette
 */

export const palette = {
  // Sanguine Vitality Brand
  sanguinePrimary: '#550000',            //#550000',
  sanguineOnPrimary: '#ffffff',
  sanguinePrimaryContainer: '#76160d',
  sanguineOnPrimaryContainer: '#ff816e',
  sanguineSecondary: '#855145',
  sanguineOnSecondary: '#ffffff',
  sanguineSecondaryContainer: '#feb9a9',
  sanguineOnSecondaryContainer: '#7a473b',
  sanguineTertiary: '#2d2520',
  sanguineOnTertiary: '#ffffff',
  sanguineTertiaryContainer: '#443a34',
  sanguineOnTertiaryContainer: '#b2a49c',

  // Sanguine Surfaces
  sanguineSurface: '#faf9f6',
  sanguineSurfaceDim: '#dbdad7',
  sanguineSurfaceBright: '#faf9f6',
  sanguineSurfaceContainerLowest: '#ffffff',
  sanguineSurfaceContainerLow: '#f4f3f1',
  sanguineSurfaceContainer: '#efeeeb',
  sanguineSurfaceContainerHigh: '#e9e8e5',
  sanguineSurfaceContainerHighest: '#e3e2e0',
  sanguineOnSurface: '#1a1c1a',
  sanguineOnSurfaceVariant: '#57423e',
  sanguineInverseSurface: '#2f312f',
  sanguineInverseOnSurface: '#f2f1ee',
  sanguineOutline: '#8b716d',
  sanguineOutlineVariant: '#dec0bb',

  // Existing Brand
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

  // Dark mode surfaces (Sanguine adapted)
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

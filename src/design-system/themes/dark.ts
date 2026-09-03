import { palette } from '../tokens/colors';
import type { Theme } from './light';

/**
 * LunaBloom Dark Theme
 * Satisfies the same Theme type as lightTheme — swaps surface and text colors.
 */
export const darkTheme: Theme = {
  colors: {
    brand: {
      primary: palette.sanguineOnPrimaryContainer, // #ff816e (lighter for contrast)
      secondary: palette.sanguineSecondaryContainer, // #feb9a9
      accent: palette.sanguineTertiaryContainer, // #443a34
      onPrimaryContainer: palette.sanguinePrimaryContainer, // Darker background for contrast with light text
      secondaryContainer: palette.sanguineSecondary2, // Deep secondary mapping
    },
    phase: {
      menstrual: palette.rose700,
      follicular: palette.green700,
      ovulatory: palette.amber600,
      luteal: palette.sanguineOutlineVariant,
      predicted: palette.slate600,
    },
    background: palette.darkBg, // #0C0C14
    surface: palette.darkSurface, // #16162A
    surfaceElevated: palette.darkSurfaceElevated, // #1E1E35
    border: palette.darkBorder,
    borderSubtle: palette.darkBorderSubtle,
    text: {
      primary: palette.sanguineSurface,
      secondary: palette.slate400,
      tertiary: palette.slate600,
      inverse: palette.sanguineOnSurface,
      disabled: palette.slate700,
      link: palette.sanguineOnPrimaryContainer,
    },
    semantic: {
      success: palette.green500,
      warning: palette.yellow500,
      error: palette.red500,
      info: palette.blue500,
    },
    overlay: 'rgba(0,0,0,0.7)',
    overlaySubtle: 'rgba(255,255,255,0.15)',
    overlayMuted: 'rgba(255,255,255,0.05)',
    shadow: '#000',
    switchTrackOff: 'rgba(255,255,255,0.1)',
    onPrimaryOverlay: 'rgba(255,255,255,0.2)',
    onPrimarySubtle: 'rgba(255,255,255,0.7)',
    borderSubtleDark: 'rgba(255,255,255,0.05)',
    surfaceNeutral: 'rgba(150,150,150,0.2)',
  },
  isDark: true,
};

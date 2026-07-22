import { palette } from '../tokens/colors';
import type { Theme } from './light';

/**
 * LunaBloom Dark Theme
 * Satisfies the same Theme type as lightTheme — swaps surface and text colors.
 */
export const darkTheme: Theme = {
  colors: {
    brand: {
      primary: palette.purple400,
      secondary: palette.teal400,
      accent: palette.amber400,
    },
    phase: {
      menstrual: palette.rose400,
      follicular: palette.green400,
      ovulatory: palette.amber400,
      luteal: palette.purple400,
      predicted: palette.slate600,
    },
    background: palette.darkBg,
    surface: palette.darkSurface,
    surfaceElevated: palette.darkSurfaceElevated,
    border: palette.darkBorder,
    borderSubtle: palette.darkBorderSubtle,
    text: {
      primary: palette.slate50,
      secondary: palette.slate400,
      tertiary: palette.slate600,
      inverse: palette.slate900,
      disabled: palette.slate700,
      link: palette.purple400,
    },
    semantic: {
      success: palette.green500,
      warning: palette.yellow500,
      error: palette.red500,
      info: palette.blue500,
    },
    overlay: 'rgba(0,0,0,0.7)',
  },
  isDark: true,
};

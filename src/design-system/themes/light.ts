import { palette } from '../tokens/colors';

/** The shape of a LunaBloom theme object. */
export interface Theme {
  colors: {
    brand: {
      primary: string;
      secondary: string;
      accent: string;
    };
    phase: {
      menstrual: string;
      follicular: string;
      ovulatory: string;
      luteal: string;
      predicted: string;
    };
    background: string;
    surface: string;
    surfaceElevated: string;
    border: string;
    borderSubtle: string;
    text: {
      primary: string;
      secondary: string;
      tertiary: string;
      inverse: string;
      disabled: string;
      link: string;
    };
    semantic: {
      success: string;
      warning: string;
      error: string;
      info: string;
    };
    overlay: string;
  };
  isDark: boolean;
}

/**
 * LunaBloom Light Theme
 * Components consume this object via useTheme() — never import palette directly.
 */
export const lightTheme: Theme = {
  colors: {
    brand: {
      primary: palette.purple600,
      secondary: palette.teal600,
      accent: palette.amber600,
    },
    phase: {
      menstrual: palette.rose700,
      follicular: palette.green700,
      ovulatory: palette.amber600,
      luteal: palette.purple600,
      predicted: palette.slate400,
    },
    background: palette.slate50,
    surface: palette.white,
    surfaceElevated: palette.white,
    border: palette.slate200,
    borderSubtle: palette.slate100,
    text: {
      primary: palette.slate900,
      secondary: palette.slate600,
      tertiary: palette.slate400,
      inverse: palette.white,
      disabled: palette.slate300,
      link: palette.purple600,
    },
    semantic: {
      success: palette.green500,
      warning: palette.yellow500,
      error: palette.red500,
      info: palette.blue500,
    },
    overlay: 'rgba(0,0,0,0.4)',
  },
  isDark: false,
};

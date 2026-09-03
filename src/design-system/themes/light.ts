import { palette } from '../tokens/colors';

/** The shape of a LunaBloom theme object. */
export interface Theme {
  colors: {
    brand: {
      primary: string;
      secondary: string;
      accent: string;
      onPrimaryContainer: string;
      secondaryContainer: string;
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
    overlaySubtle: string;
    overlayMuted: string;
    shadow: string;
    switchTrackOff: string;
    onPrimaryOverlay: string;
    onPrimarySubtle: string;
    borderSubtleDark: string;
    surfaceNeutral: string;
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
      primary: palette.sanguinePrimary,
      secondary: palette.sanguinePrimaryContainer,
      accent: palette.sanguineTertiary,
      onPrimaryContainer: palette.sanguineOnPrimaryContainer,
      secondaryContainer: palette.sanguineSecondaryContainer,
    },
    phase: {
      // Maintaining functional colors for phases, but slightly more muted where possible
      menstrual: palette.sanguinePrimaryContainer,
      follicular: palette.green700,
      ovulatory: palette.amber600,
      luteal: palette.sanguineOutline,
      predicted: palette.slate400,
    },
    background: palette.sanguineSurface, // #faf9f6 - warm white
    surface: palette.sanguineSurfaceContainerLowest, // #ffffff
    surfaceElevated: palette.sanguineSurfaceContainerLow, // #f4f3f1
    border: palette.sanguineOutline,
    borderSubtle: palette.sanguineOutlineVariant,
    text: {
      primary: palette.sanguineOnSurface,
      secondary: palette.sanguineOnSurfaceVariant,
      tertiary: palette.slate500,
      inverse: palette.sanguineInverseOnSurface,
      disabled: palette.slate300,
      link: palette.sanguinePrimary,
    },
    semantic: {
      success: palette.green500,
      warning: palette.yellow500,
      error: palette.red500,
      info: palette.blue500,
    },
    overlay: 'rgba(87, 66, 62, 0.4)', // sanguineOnSurfaceVariant with opacity
    overlaySubtle: 'rgba(0,0,0,0.15)',
    overlayMuted: 'rgba(0,0,0,0.05)',
    shadow: '#000',
    switchTrackOff: 'rgba(0,0,0,0.1)',
    onPrimaryOverlay: 'rgba(255,255,255,0.2)',
    onPrimarySubtle: 'rgba(255,255,255,0.7)',
    borderSubtleDark: 'rgba(255,255,255,0.05)',
    surfaceNeutral: 'rgba(150,150,150,0.2)',
  },
  isDark: false,
};

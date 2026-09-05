/**
 * LunaBloom Design System — Main Entry Point
 * Import from here, not from individual token files.
 *
 * Usage:
 *   import { spacing, borderRadius, lightTheme } from '@/design-system';
 *   import { useTheme } from '@/presentation/hooks/useTheme';
 */

export { palette } from './tokens/colors';
export { fontFamily, fontSize, lineHeight, letterSpacing } from './tokens/typography';
export { spacing, SCREEN_HORIZONTAL_PADDING } from './tokens/spacing';
export { borderRadius } from './tokens/borderRadius';
export { elevation } from './tokens/elevation';
export { opacity } from './tokens/opacity';
export { zIndex } from './tokens/zIndex';
export { duration, iconSize } from './tokens/motion';
export { lightTheme } from './themes/light';
export { darkTheme } from './themes/dark';
export type { Theme } from './themes/light';

export {
  BASE_WIDTH,
  BASE_HEIGHT,
  SCALE_CAP,
  computeScaleFactors,
  createStaticScaleFactors,
  useScaling,
} from './scaling';
export type { ScaleFactors } from './scaling';

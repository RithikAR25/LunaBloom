/**
 * LunaBloom Elevation Tokens
 * See: docs/design/DESIGN.md — Tonal Layers and Ambient Depth
 */
import { palette } from './colors';

export const elevation = {
  level0: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  level1: {
    // Mostly handled via background fills or 1px borders
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 1,
  },
  level2: {
    // Active/Floating modals/buttons
    shadowColor: palette.sanguinePrimary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
    elevation: 4,
  },
} as const;

export type ElevationKey = keyof typeof elevation;

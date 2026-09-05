/**
 * LunaBloom Responsive Scaling Utility
 *
 * Design-system benchmark: Pixel 10 in portrait mode.
 * All scaling is relative to this reference viewport.
 *
 * Architecture notes:
 * - computeScaleFactors() and createStaticScaleFactors() are pure / side-effect-free.
 *   They have NO React dependency and can be used anywhere (tests, utils, StyleSheet.create).
 * - useScaling() is the sole React hook in this file. It wraps the pure computation
 *   with useWindowDimensions + useMemo and must only be called inside a component
 *   or custom hook (Rules of Hooks apply).
 *
 * Scaling rules (design-system policy):
 * - Horizontal scale: capped at SCALE_CAP (1.2). Wide/large-screen devices scale
 *   UI elements up to 20% above baseline, no more.
 * - Vertical scale: intentionally uncapped. The app is portrait-locked
 *   (app.json "orientation": "portrait"), so very tall devices simply receive
 *   taller layouts, which is acceptable for a scrollable UI.
 * - Orientation normalisation: min(w, h) => portrait width, max(w, h) => portrait height.
 *   This makes computeScaleFactors deterministic regardless of which axis is passed
 *   first, and keeps the pure function testable in any orientation.
 *   At runtime the app is portrait-locked, so this normalisation is a robustness
 *   measure, not a runtime feature.
 */

// React imports are at the top of the file per ESLint import/first rule.
// The pure section of this module (computeScaleFactors, createStaticScaleFactors)
// does NOT use these imports — they are only consumed by the useScaling() hook.
import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

// ─── Baseline constants ───────────────────────────────────────────────────────

/**
 * Design-system benchmark width (dp) for the Pixel 10 in portrait mode.
 * This is the declared project baseline, not a universal hardware specification.
 */
export const BASE_WIDTH = 412;

/**
 * Design-system benchmark height (dp) for the Pixel 10 in portrait mode.
 * This is the declared project baseline, not a universal hardware specification.
 */
export const BASE_HEIGHT = 917;

/**
 * Maximum multiplier for HORIZONTAL scaling only.
 *
 * Design-system rule:
 *   - scale() is capped at 1.2x so that wide-screen phones and large-screen
 *     Android devices do not produce disproportionately large UI elements.
 *   - verticalScale() is intentionally uncapped (see file-level comment).
 */
export const SCALE_CAP = 1.2;

// ─── Types ────────────────────────────────────────────────────────────────────

export type ScaleFactors = {
  /**
   * Horizontal scale. Maps a baseline size to a device-appropriate size.
   * The underlying scale factor is capped at SCALE_CAP (1.2).
   * Suitable for widths, icon sizes, and font sizes.
   */
  scale: (size: number) => number;

  /**
   * Vertical scale. Maps a baseline size to a device-appropriate size.
   * The underlying scale factor is uncapped (design-system policy).
   * Suitable for heights and vertical padding/margin.
   */
  verticalScale: (size: number) => number;

  /**
   * Moderate (blended) scale. Interpolates between the baseline size and the
   * full horizontal scale result.
   *
   * factor is clamped to [0, 1]:
   *   - 0   => always returns `size` unchanged (no scaling)
   *   - 0.5 => midpoint between baseline and full horizontal scale (default)
   *   - 1   => identical to scale(size)
   *
   * Values outside [0, 1] are clamped; the API does not extrapolate.
   * Suitable for spacing and line heights that should scale conservatively.
   */
  moderateScale: (size: number, factor?: number) => number;
};

// ─── Pure helper ──────────────────────────────────────────────────────────────

/**
 * Returns true if v is a finite positive number usable as a dp dimension.
 */
function isValidDimension(v: number): boolean {
  return Number.isFinite(v) && v > 0;
}

// ─── Core pure function ───────────────────────────────────────────────────────

/**
 * Computes scaling factors for any (width, height) pair.
 *
 * Input contract:
 *   - width and height must be finite positive numbers (dp).
 *   - Invalid values (0, negative, NaN, Infinity) cause BOTH scale factors
 *     to fall back to 1.0 so the function never returns NaN or throws.
 *
 * Orientation normalisation:
 *   - portrait_w = min(width, height)
 *   - portrait_h = max(width, height)
 *   - Therefore: computeScaleFactors(W, H) produces identical ScaleFactors
 *     to computeScaleFactors(H, W) for any W and H.
 */
export function computeScaleFactors(width: number, height: number): ScaleFactors {
  const wValid = isValidDimension(width);
  const hValid = isValidDimension(height);

  const hScale =
    wValid && hValid
      ? Math.min(Math.min(width, height) / BASE_WIDTH, SCALE_CAP)
      : 1.0;

  const vScale =
    wValid && hValid
      ? Math.max(width, height) / BASE_HEIGHT
      : 1.0;

  const scale = (size: number): number => Math.round(size * hScale);

  const verticalScale = (size: number): number => Math.round(size * vScale);

  const moderateScale = (size: number, factor: number = 0.5): number => {
    const clampedFactor = Math.min(1, Math.max(0, factor));
    return size + (scale(size) - size) * clampedFactor;
  };

  return { scale, verticalScale, moderateScale };
}

// ─── Static (snapshot) helper ─────────────────────────────────────────────────

/**
 * Returns a ScaleFactors snapshot computed from the window dimensions
 * at the moment this function is called.
 *
 * IMPORTANT - This is NOT reactive:
 *   - The result is a one-time snapshot taken when this function executes.
 *     It will not update if the window is resized after this call.
 *   - Use useScaling() for reactive dimension tracking inside components.
 *
 * Suitable for: StyleSheet.create() calls and module-level constants
 * where a React hook cannot be called.
 */
export function createStaticScaleFactors(): ScaleFactors {
  // Deferred require so the pure section of this module has no top-level RN
  // import that would require a native environment at test time.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Dimensions } = require('react-native') as typeof import('react-native');
  const { width, height } = Dimensions.get('window');
  return computeScaleFactors(width, height);
}


/**
 * Returns a ScaleFactors object computed from the current window dimensions.
 *
 * Stability guarantee:
 *   A new ScaleFactors reference is only produced when the effective portrait
 *   width or portrait height changes. This is enforced via useMemo with
 *   [portraitW, portraitH] as explicit dependencies.
 *
 * Rules of Hooks: call only at the top level of a component or custom hook.
 */
export function useScaling(): ScaleFactors {
  const { width, height } = useWindowDimensions();

  // Derive portrait dimensions so useMemo deps are stable scalars,
  // mirroring the orientation-lock logic inside computeScaleFactors.
  const portraitW = Math.min(width, height);
  const portraitH = Math.max(width, height);

  return useMemo(
    () => computeScaleFactors(portraitW, portraitH),
    [portraitW, portraitH],
  );
}

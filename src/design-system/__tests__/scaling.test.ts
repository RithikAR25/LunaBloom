/**
 * Tests for src/design-system/scaling.ts
 *
 * These tests cover computeScaleFactors() only — the pure function.
 * useScaling() is a thin useMemo wrapper around it and is not tested here
 * (it requires a React environment; the pure function is the source of truth).
 */
import {
  BASE_WIDTH,
  BASE_HEIGHT,
  SCALE_CAP,
  computeScaleFactors,
} from '../scaling';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Extracts the raw horizontal scale factor by probing scale(100). */
function hScaleOf(w: number, h: number): number {
  return computeScaleFactors(w, h).scale(100) / 100;
}

/** Extracts the raw vertical scale factor by probing verticalScale(100). */
function vScaleOf(w: number, h: number): number {
  return computeScaleFactors(w, h).verticalScale(100) / 100;
}

// ─── Exact baseline ───────────────────────────────────────────────────────────

describe('exact baseline (412 x 917)', () => {
  const sf = computeScaleFactors(BASE_WIDTH, BASE_HEIGHT);

  it('scale(100) === 100', () => {
    expect(sf.scale(100)).toBe(100);
  });

  it('verticalScale(100) === 100', () => {
    expect(sf.verticalScale(100)).toBe(100);
  });

  it('moderateScale(100) === 100 at baseline (hScale = 1)', () => {
    // At baseline hScale = 1, so scale(100) = 100, delta = 0 regardless of factor
    expect(sf.moderateScale(100)).toBe(100);
  });
});

// ─── Small device ─────────────────────────────────────────────────────────────

describe('small device (360 x 800) — scales down', () => {
  const sf = computeScaleFactors(360, 800);

  it('hScale < 1 (portrait_w < BASE_WIDTH)', () => {
    expect(hScaleOf(360, 800)).toBeLessThan(1);
  });

  it('scale(100) < 100', () => {
    expect(sf.scale(100)).toBeLessThan(100);
  });

  it('vScale < 1 (portrait_h < BASE_HEIGHT)', () => {
    expect(vScaleOf(360, 800)).toBeLessThan(1);
  });
});

// ─── Wide phone — below cap ───────────────────────────────────────────────────

describe('wide phone (480 x 1000) — scales up, below cap', () => {
  const sf = computeScaleFactors(480, 1000);

  it('hScale > 1 and < SCALE_CAP', () => {
    const h = hScaleOf(480, 1000);
    expect(h).toBeGreaterThan(1);
    expect(h).toBeLessThan(SCALE_CAP);
  });

  it('scale(100) > 100 but < 120', () => {
    expect(sf.scale(100)).toBeGreaterThan(100);
    expect(sf.scale(100)).toBeLessThanOrEqual(120);
  });

  it('vScale is uncapped and reflects tall screen', () => {
    expect(vScaleOf(480, 1000)).toBeGreaterThan(1);
  });
});

// ─── At the cap: portrait_w = BASE_WIDTH * SCALE_CAP = 494.4 ──────────────────

describe('at the horizontal cap (494.4 x 1100)', () => {
  const exactCapW = BASE_WIDTH * SCALE_CAP; // 412 * 1.2 = 494.4
  const sf = computeScaleFactors(exactCapW, 1100);

  it('hScale is exactly SCALE_CAP (1.2)', () => {
    // hRaw = 494.4 / 412 = 1.2 exactly; clamped to 1.2 = 1.2
    expect(hScaleOf(exactCapW, 1100)).toBeCloseTo(1.2, 10);
  });

  it('scale(100) === 120', () => {
    expect(sf.scale(100)).toBe(120);
  });
});

// ─── Above the cap: clamping ──────────────────────────────────────────────────

describe('above the horizontal cap (600 x 1200) — clamped to 1.2', () => {
  const sf = computeScaleFactors(600, 1200);

  it('hScale is clamped to SCALE_CAP (1.2)', () => {
    expect(hScaleOf(600, 1200)).toBe(SCALE_CAP);
  });

  it('hScale <= SCALE_CAP invariant holds for every valid input', () => {
    // Property: horizontal scale must never exceed SCALE_CAP
    expect(hScaleOf(600, 1200)).toBeLessThanOrEqual(SCALE_CAP);
    expect(hScaleOf(2000, 4000)).toBeLessThanOrEqual(SCALE_CAP);
    expect(hScaleOf(480, 1000)).toBeLessThanOrEqual(SCALE_CAP);
    expect(hScaleOf(412, 917)).toBeLessThanOrEqual(SCALE_CAP);
  });

  it('scale(100) === 120', () => {
    expect(sf.scale(100)).toBe(120);
  });

  it('scale(200) === 240', () => {
    expect(sf.scale(200)).toBe(240);
  });

  it('vScale is uncapped (portrait_h / BASE_HEIGHT > 1.2)', () => {
    const v = vScaleOf(600, 1200);
    expect(v).toBeGreaterThan(SCALE_CAP);
  });
});

// ─── Orientation-lock invariant ───────────────────────────────────────────────

describe('orientation-lock invariant', () => {
  it('Pixel 10 axes swapped: (412, 917) === (917, 412)', () => {
    const portrait = computeScaleFactors(412, 917);
    const landscape = computeScaleFactors(917, 412);
    const probe = 100;
    expect(portrait.scale(probe)).toBe(landscape.scale(probe));
    expect(portrait.verticalScale(probe)).toBe(landscape.verticalScale(probe));
    expect(portrait.moderateScale(probe)).toBe(landscape.moderateScale(probe));
  });

  it('non-baseline device (480, 1000) === (1000, 480)', () => {
    const w = 480, h = 1000;
    const portrait = computeScaleFactors(w, h);
    const landscape = computeScaleFactors(h, w);
    const probe = 100;
    expect(portrait.scale(probe)).toBe(landscape.scale(probe));
    expect(portrait.verticalScale(probe)).toBe(landscape.verticalScale(probe));
    expect(portrait.moderateScale(probe)).toBe(landscape.moderateScale(probe));
    expect(portrait.moderateScale(probe, 0.3)).toBe(landscape.moderateScale(probe, 0.3));
  });

  it('arbitrary dimensions (W, H) produce same result as (H, W)', () => {
    const pairs: [number, number][] = [
      [360, 800], [300, 900], [600, 1200], [414, 896], [390, 844],
    ];
    for (const [w, h] of pairs) {
      const a = computeScaleFactors(w, h);
      const b = computeScaleFactors(h, w);
      expect(a.scale(100)).toBe(b.scale(100));
      expect(a.verticalScale(100)).toBe(b.verticalScale(100));
      expect(a.moderateScale(100)).toBe(b.moderateScale(100));
    }
  });
});

// ─── Square dimensions ────────────────────────────────────────────────────────

describe('square dimensions (412 x 412)', () => {
  const sf = computeScaleFactors(412, 412);

  it('portrait_w === portrait_h === 412', () => {
    // hScale = 412/412 = 1.0; vScale = 412/917 ≈ 0.449
    expect(sf.scale(100)).toBe(100);
    expect(sf.verticalScale(100)).toBe(Math.round((412 / BASE_HEIGHT) * 100));
  });
});

// ─── Very small dimensions ────────────────────────────────────────────────────

describe('very small device (100 x 200)', () => {
  const sf = computeScaleFactors(100, 200);

  it('does not crash and returns valid factors < 1', () => {
    expect(sf.scale(100)).toBeGreaterThan(0);
    expect(sf.scale(100)).toBeLessThan(100);
    expect(sf.verticalScale(100)).toBeGreaterThan(0);
  });
});

// ─── Very large dimensions ────────────────────────────────────────────────────

describe('very large device (1200 x 2400)', () => {
  const sf = computeScaleFactors(1200, 2400);

  it('hScale is clamped to SCALE_CAP', () => {
    expect(hScaleOf(1200, 2400)).toBe(SCALE_CAP);
    expect(sf.scale(100)).toBe(120);
  });

  it('vScale is uncapped and reflects very tall screen', () => {
    expect(vScaleOf(1200, 2400)).toBeGreaterThan(SCALE_CAP);
  });
});

// ─── Invalid / degenerate inputs ─────────────────────────────────────────────

describe('invalid inputs fall back to scale 1.0 for both axes', () => {
  const cases: [string, number, number][] = [
    ['(0, 0)', 0, 0],
    ['(0, 917)', 0, 917],
    ['(-100, 917)', -100, 917],
    ['(412, NaN)', 412, NaN],
    ['(412, Infinity)', 412, Infinity],
  ];

  for (const [label, w, h] of cases) {
    it(`${label}: scale(100) === 100 and verticalScale(100) === 100`, () => {
      const sf = computeScaleFactors(w, h);
      expect(sf.scale(100)).toBe(100);
      expect(sf.verticalScale(100)).toBe(100);
    });
  }
});

// ─── moderateScale factor contract ───────────────────────────────────────────

describe('moderateScale factor contract', () => {
  // Use a device where hScale = 1.2 exactly (capped) for deterministic math
  const exactCapW = BASE_WIDTH * SCALE_CAP; // 494.4
  const sf = computeScaleFactors(exactCapW, 1100);

  it('factor = 0 => returns size unchanged', () => {
    expect(sf.moderateScale(100, 0)).toBe(100);
  });

  it('factor = 0.5 => midpoint between size and scale(size)', () => {
    // scale(100) = 120; midpoint = 100 + (120 - 100) * 0.5 = 110
    expect(sf.moderateScale(100, 0.5)).toBe(110);
  });

  it('factor = 1 => equals scale(size)', () => {
    expect(sf.moderateScale(100, 1)).toBe(sf.scale(100));
  });

  it('factor > 1 is clamped to 1 (no extrapolation)', () => {
    expect(sf.moderateScale(100, 2)).toBe(sf.moderateScale(100, 1));
  });

  it('factor < 0 is clamped to 0 (no extrapolation)', () => {
    expect(sf.moderateScale(100, -1)).toBe(sf.moderateScale(100, 0));
  });

  it('default factor (no argument) = 0.5', () => {
    expect(sf.moderateScale(100)).toBe(sf.moderateScale(100, 0.5));
  });

  // Verify at baseline (hScale = 1): moderateScale is always size regardless of factor
  it('at baseline, moderateScale always returns size (hScale = 1 so no delta)', () => {
    const base = computeScaleFactors(BASE_WIDTH, BASE_HEIGHT);
    expect(base.moderateScale(100, 0)).toBe(100);
    expect(base.moderateScale(100, 0.5)).toBe(100);
    expect(base.moderateScale(100, 1)).toBe(100);
  });
});

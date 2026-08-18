export type TrendDirection = 'INCREASING' | 'DECREASING' | 'STABLE' | 'UNKNOWN';
export type CyclePhase = 'MENSTRUAL' | 'FOLLICULAR' | 'OVULATORY' | 'LUTEAL' | 'UNKNOWN';

export interface CycleStatistics {
  averageCycleLength: number | null;
  averagePeriodDuration: number | null;
  shortestCycle: number | null;
  longestCycle: number | null;
  cycleLengthTrend: TrendDirection;
  regularityScore: number | null; // 0-100
}

export interface SymptomFrequency {
  symptomId: string;
  count: number;
}

export interface PhaseSymptomTrends {
  phase: CyclePhase;
  topSymptoms: SymptomFrequency[];
}

export interface MoodFrequency {
  moodId: string;
  count: number;
}

export interface PhaseMoodTrends {
  phase: CyclePhase;
  topMoods: MoodFrequency[];
}

export interface WellbeingMetrics {
  averagePain: number | null;
  painSampleCount: number;
  averageEnergy: number | null;
  energySampleCount: number;
  averageSleep: number | null;
  sleepSampleCount: number;
}

export interface PhaseWellbeingTrends {
  phase: CyclePhase;
  metrics: WellbeingMetrics;
}

// ─── Patterns Tab Types ──────────────────────────────────────────────────────

/** One data point per completed cycle for the cycle-length-over-time chart. */
export interface CycleLengthDataPoint {
  /** 1-based ordinal (Cycle 1, Cycle 2, …) */
  cycleIndex: number;
  /** ISO date — used to derive the X-axis label (e.g. "Jul 2026") */
  startDate: string;
  cycleLengthDays: number;
}

/** One data point per completed cycle with a known durationDays. */
export interface PeriodDurationDataPoint {
  cycleIndex: number;
  startDate: string;
  durationDays: number;
}

/** Average pain per calendar month, ordered oldest → newest. */
export interface MonthlyPainDataPoint {
  /** 'YYYY-MM' — primary sort key */
  yearMonth: string;
  /** Human-readable label, e.g. "Aug 2026" */
  label: string;
  /** Rounded to 1 decimal place */
  averagePain: number;
  sampleCount: number;
}

/** Result bundle for all Patterns-tab aggregations. */
export interface PatternInsights {
  cycleLengthHistory: CycleLengthDataPoint[];
  periodDurationHistory: PeriodDurationDataPoint[];
  monthlyPainHistory: MonthlyPainDataPoint[];
  /** 1-based cycle day with the highest average energyLevel. null if insufficient data. */
  energyPeakCycleDay: number | null;
  /** Average energyLevel on the peak day (1 decimal place). null if insufficient data. */
  energyPeakAverage: number | null;
  /** Number of observations used for the energy peak. Shown in UI for transparency. */
  energyPeakSampleCount: number | null;
  /** 0–100 integer, capped. null if fewer than 3 completed cycles. */
  loggingConsistencyPercent: number | null;
}


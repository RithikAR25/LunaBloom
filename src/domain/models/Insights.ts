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

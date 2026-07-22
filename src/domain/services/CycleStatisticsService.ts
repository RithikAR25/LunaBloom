import type { CycleEntry } from '../models/Cycle';

export interface CycleStatistics {
  averageCycleLength: number;
  averagePeriodDuration: number;
  isIrregular: boolean;
  cycleLengths: number[];
  periodDurations: number[];
}

export interface PhaseDistribution {
  menstrual: number;
  follicular: number;
  ovulatory: number;
  luteal: number;
}

export class CycleStatisticsService {
  /**
   * Calculates averages and variability of cycle length and period duration
   */
  public getCycleStatistics(cycles: CycleEntry[]): CycleStatistics {
    const validCycles = cycles
      .filter((c) => c.cycleLengthDays !== undefined && c.cycleLengthDays !== null);

    const validDurations = cycles
      .filter((c) => c.durationDays !== undefined && c.durationDays !== null);

    const lengths = validCycles.map(c => c.cycleLengthDays!);
    const durations = validDurations.map(c => c.durationDays!);

    const averageCycleLength = lengths.length > 0 
      ? Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length) 
      : 28;

    const averagePeriodDuration = durations.length > 0 
      ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) 
      : 5;

    const mean = lengths.length > 0 ? lengths.reduce((a, b) => a + b, 0) / lengths.length : 28;
    const variance = lengths.length > 0 ? lengths.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / lengths.length : 0;
    const stdDev = Math.sqrt(variance);

    return {
      averageCycleLength,
      averagePeriodDuration,
      isIrregular: stdDev > 7,
      cycleLengths: lengths,
      periodDurations: durations,
    };
  }

  /**
   * Calculates the percentage of time spent in each phase over a given set of cycles
   */
  public getPhaseDistribution(cycles: CycleEntry[]): PhaseDistribution {
    const stats = this.getCycleStatistics(cycles);
    const avgCycle = stats.averageCycleLength;
    const avgPeriod = stats.averagePeriodDuration;

    // Typical approximations based on averages:
    // Menstrual = Period duration
    // Luteal = Usually 14 days (fixed)
    // Ovulatory = 4 days around ovulation
    // Follicular = Remaining days

    const luteal = 14;
    const ovulatory = 4;
    const menstrual = avgPeriod;
    const follicular = Math.max(0, avgCycle - luteal - ovulatory - menstrual);

    const total = avgCycle;
    return {
      menstrual: total > 0 ? Math.round((menstrual / total) * 100) : 0,
      follicular: total > 0 ? Math.round((follicular / total) * 100) : 0,
      ovulatory: total > 0 ? Math.round((ovulatory / total) * 100) : 0,
      luteal: total > 0 ? Math.round((luteal / total) * 100) : 0,
    };
  }
}

import type { CycleEntry } from '../models/Cycle';
import type { CycleStatistics, TrendDirection } from '../models/Insights';

export class CycleAnalysisService {
  /**
   * Calculates high-level statistics for historical cycles.
   * Only considers "completed" cycles (where cycleLengthDays is set).
   * If there are fewer than 3 completed cycles, trend is 'UNKNOWN' and some averages might be null.
   */
  public getStatistics(cycles: CycleEntry[]): CycleStatistics {
    const completedCycles = cycles.filter(c => c.cycleLengthDays !== null && c.endDate !== null);
    
    if (completedCycles.length === 0) {
      return {
        averageCycleLength: null,
        averagePeriodDuration: null,
        shortestCycle: null,
        longestCycle: null,
        cycleLengthTrend: 'UNKNOWN',
        regularityScore: null,
      };
    }

    const lengths = completedCycles.map(c => c.cycleLengthDays as number);
    const durations = completedCycles
      .filter(c => c.durationDays !== null)
      .map(c => c.durationDays as number);

    const averageCycleLength = Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length);
    const averagePeriodDuration = durations.length > 0 
      ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) 
      : null;
    
    const shortestCycle = Math.min(...lengths);
    const longestCycle = Math.max(...lengths);

    // Trend and Regularity require at least 3 completed cycles
    let cycleLengthTrend: TrendDirection = 'UNKNOWN';
    let regularityScore: number | null = null;

    if (completedCycles.length >= 3) {
      // Sort older to newer for trend analysis
      const sortedByDate = [...completedCycles].sort((a, b) => a.startDate.localeCompare(b.startDate));
      const recentLengths = sortedByDate.slice(-5).map(c => c.cycleLengthDays as number);
      
      cycleLengthTrend = this.calculateTrend(recentLengths);
      regularityScore = this.calculateRegularityScore(lengths);
    }

    return {
      averageCycleLength,
      averagePeriodDuration,
      shortestCycle,
      longestCycle,
      cycleLengthTrend,
      regularityScore,
    };
  }

  private calculateTrend(lengths: number[]): TrendDirection {
    if (lengths.length < 3) return 'UNKNOWN';

    // Simple linear regression slope
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    const n = lengths.length;

    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += lengths[i] as number;
      sumXY += i * (lengths[i] as number);
      sumX2 += i * i;
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

    // If slope > 1 day per cycle, it's increasing
    if (slope > 1) return 'INCREASING';
    // If slope < -1 day per cycle, it's decreasing
    if (slope < -1) return 'DECREASING';
    
    return 'STABLE';
  }

  private calculateRegularityScore(lengths: number[]): number {
    if (lengths.length < 3) return 0;

    const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    const variance = lengths.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / lengths.length;
    const stdDev = Math.sqrt(variance);

    // Score from 0 to 100.
    // 0 stdDev = 100 score. > 7 stdDev = 0 score.
    const score = Math.max(0, 100 - (stdDev * (100 / 7)));
    return Math.round(score);
  }
}

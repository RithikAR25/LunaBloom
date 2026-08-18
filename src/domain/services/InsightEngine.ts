import type { DailyLog } from '../models/DailyLog';
import type { CycleEntry } from '../models/Cycle';
import type { 
  PhaseSymptomTrends, 
  PhaseMoodTrends, 
  PhaseWellbeingTrends, 
  CyclePhase,
  PatternInsights,
  CycleLengthDataPoint,
  PeriodDurationDataPoint,
  MonthlyPainDataPoint
} from '../models/Insights';
import { formatDateShort, daysBetween, addDays } from '../../utils/dateUtils';
import { CyclePhaseService } from './CyclePhaseService';

export class InsightEngine {
  /**
   * Aggregates symptom frequencies by cycle phase.
   * Returns top 3 symptoms for each phase.
   */
  public getSymptomTrends(logs: DailyLog[], cycles: CycleEntry[], avgCycleLength = 28): PhaseSymptomTrends[] {
    const phases: CyclePhase[] = ['MENSTRUAL', 'FOLLICULAR', 'OVULATORY', 'LUTEAL', 'UNKNOWN'];
    const counts: Record<CyclePhase, Record<string, number>> = {
      MENSTRUAL: {}, FOLLICULAR: {}, OVULATORY: {}, LUTEAL: {}, UNKNOWN: {}
    };

    logs.forEach(log => {
      const phase = this.resolvePhaseForLog(log, cycles, avgCycleLength);
      log.symptoms.forEach(symp => {
        counts[phase][symp] = (counts[phase][symp] || 0) + 1;
      });
    });

    return phases.map(phase => {
      const phaseCounts = counts[phase] as Record<string, number>;
      const topSymptoms = Object.entries(phaseCounts)
        .map(([symptomId, count]) => ({ symptomId, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);
        
      return { phase, topSymptoms };
    });
  }

  /**
   * Aggregates mood frequencies by cycle phase.
   * Returns top 3 moods for each phase.
   */
  public getMoodTrends(logs: DailyLog[], cycles: CycleEntry[], avgCycleLength = 28): PhaseMoodTrends[] {
    const phases: CyclePhase[] = ['MENSTRUAL', 'FOLLICULAR', 'OVULATORY', 'LUTEAL', 'UNKNOWN'];
    const counts: Record<CyclePhase, Record<string, number>> = {
      MENSTRUAL: {}, FOLLICULAR: {}, OVULATORY: {}, LUTEAL: {}, UNKNOWN: {}
    };

    logs.forEach(log => {
      const phase = this.resolvePhaseForLog(log, cycles, avgCycleLength);
      log.moods.forEach(mood => {
        counts[phase][mood] = (counts[phase][mood] || 0) + 1;
      });
    });

    return phases.map(phase => {
      const phaseCounts = counts[phase] as Record<string, number>;
      const topMoods = Object.entries(phaseCounts)
        .map(([moodId, count]) => ({ moodId, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);
        
      return { phase, topMoods };
    });
  }

  /**
   * Averages pain, energy, and sleep by cycle phase, alongside sample counts.
   */
  public getWellbeingTrends(logs: DailyLog[], cycles: CycleEntry[], avgCycleLength = 28): PhaseWellbeingTrends[] {
    const phases: CyclePhase[] = ['MENSTRUAL', 'FOLLICULAR', 'OVULATORY', 'LUTEAL', 'UNKNOWN'];
    
    // Use accumulators
    const data: Record<CyclePhase, { painSum: number, painCount: number, energySum: number, energyCount: number, sleepSum: number, sleepCount: number }> = {
      MENSTRUAL: { painSum: 0, painCount: 0, energySum: 0, energyCount: 0, sleepSum: 0, sleepCount: 0 },
      FOLLICULAR: { painSum: 0, painCount: 0, energySum: 0, energyCount: 0, sleepSum: 0, sleepCount: 0 },
      OVULATORY: { painSum: 0, painCount: 0, energySum: 0, energyCount: 0, sleepSum: 0, sleepCount: 0 },
      LUTEAL: { painSum: 0, painCount: 0, energySum: 0, energyCount: 0, sleepSum: 0, sleepCount: 0 },
      UNKNOWN: { painSum: 0, painCount: 0, energySum: 0, energyCount: 0, sleepSum: 0, sleepCount: 0 },
    };

    logs.forEach(log => {
      const phase = this.resolvePhaseForLog(log, cycles, avgCycleLength);
      if (log.painLevel !== null) {
        data[phase].painSum += log.painLevel;
        data[phase].painCount += 1;
      }
      if (log.energyLevel !== null) {
        data[phase].energySum += log.energyLevel;
        data[phase].energyCount += 1;
      }
      if (log.sleepQuality !== null) {
        data[phase].sleepSum += log.sleepQuality;
        data[phase].sleepCount += 1;
      }
    });

    return phases.map(phase => {
      const d = data[phase]!;
      return {
        phase,
        metrics: {
          averagePain: d.painCount > 0 ? Number((d.painSum / d.painCount).toFixed(1)) : null,
          painSampleCount: d.painCount,
          averageEnergy: d.energyCount > 0 ? Number((d.energySum / d.energyCount).toFixed(1)) : null,
          energySampleCount: d.energyCount,
          averageSleep: d.sleepCount > 0 ? Number((d.sleepSum / d.sleepCount).toFixed(1)) : null,
          sleepSampleCount: d.sleepCount,
        }
      };
    });
  }

  private resolvePhaseForLog(log: DailyLog, cycles: CycleEntry[], avgCycleLength: number): CyclePhase {
    if (!log.cycleEntryId) {
      // Find the cycle that encompasses this date
      const cycle = cycles.find(c => log.date >= c.startDate && (c.endDate === null || log.date <= c.endDate));
      if (!cycle) return 'UNKNOWN';
      return CyclePhaseService.getPhaseForDate(log.date, cycle, avgCycleLength);
    }

    const cycle = cycles.find(c => c.id === log.cycleEntryId);
    if (!cycle) return 'UNKNOWN';
    return CyclePhaseService.getPhaseForDate(log.date, cycle, avgCycleLength);
  }

  /**
   * Aggregates longitudinal data for the Patterns tab.
   * - Uses only completed cycles (cycleLengthDays set, endDate set).
   * - Derives cycle day from cycle.startDate at aggregation time.
   * - Deduplicates log dates per cycle using a Set.
   * - Caps logging consistency at 100.
   */
  public getPatternInsights(logs: DailyLog[], cycles: CycleEntry[]): PatternInsights {
    const completedCycles = [...cycles]
      .filter(c => c.cycleLengthDays !== null && c.endDate !== null)
      .sort((a, b) => a.startDate.localeCompare(b.startDate));

    // 1. Cycle length history
    const cycleLengthHistory: CycleLengthDataPoint[] = completedCycles.map((c, i) => ({
      cycleIndex: i + 1,
      startDate: c.startDate,
      cycleLengthDays: c.cycleLengthDays as number,
    }));

    // 2. Period duration history
    const periodDurationHistory: PeriodDurationDataPoint[] = completedCycles
      .filter(c => c.durationDays !== null)
      .map((c, i) => ({
        cycleIndex: i + 1,
        startDate: c.startDate,
        durationDays: c.durationDays as number,
      }));

    // 3. Monthly pain — group by YYYY-MM
    const painByMonth: Record<string, { sum: number; count: number }> = {};
    logs.forEach(log => {
      if (log.painLevel !== null) {
        const ym = log.date.substring(0, 7);
        if (!painByMonth[ym]) painByMonth[ym] = { sum: 0, count: 0 };
        painByMonth[ym].sum += log.painLevel;
        painByMonth[ym].count += 1;
      }
    });
    const monthlyPainHistory: MonthlyPainDataPoint[] = Object.entries(painByMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([ym, { sum, count }]) => {
        const monthPart = formatDateShort(`${ym}-01`).split(' ')[0] ?? ym;
        const yearPart = ym.split('-')[0] ?? '';
        return {
          yearMonth: ym,
          label: `${monthPart} ${yearPart}`,
          averagePain: Number((sum / count).toFixed(1)),
          sampleCount: count,
        };
      });

    // 4. Energy peak day — re-derive cycleDay from cycle.startDate
    // Deterministic match: most recent cycle where startDate <= log.date
    const energyByDay: Record<number, { sum: number; count: number }> = {};
    logs.forEach(log => {
      if (log.energyLevel === null) return;
      
      // Select most recent completed cycle where log date falls within bounds
      // The cycle spans from startDate to (startDate + cycleLengthDays - 1)
      const matchedCycle = [...completedCycles]
        .sort((a, b) => b.startDate.localeCompare(a.startDate))
        .find(c => {
          const cycleEnd = addDays(c.startDate, (c.cycleLengthDays as number) - 1);
          return log.date >= c.startDate && log.date <= cycleEnd;
        });
        
      if (!matchedCycle) return;
      
      // daysBetween is 0-indexed; add 1 for 1-based cycle day
      const computedCycleDay = daysBetween(matchedCycle.startDate, log.date) + 1;
      if (!energyByDay[computedCycleDay]) energyByDay[computedCycleDay] = { sum: 0, count: 0 };
      energyByDay[computedCycleDay].sum += log.energyLevel;
      energyByDay[computedCycleDay].count += 1;
    });

    let energyPeakCycleDay: number | null = null;
    let energyPeakAverage: number | null = null;
    let energyPeakSampleCount: number | null = null;

    Object.entries(energyByDay).forEach(([dayStr, { sum, count }]) => {
      if (count >= 2) {
        const avg = sum / count;
        if (energyPeakAverage === null || avg > energyPeakAverage) {
          energyPeakAverage = Number(avg.toFixed(1));
          energyPeakCycleDay = Number(dayStr);
          energyPeakSampleCount = count;
        }
      }
    });

    // 5. Logging consistency — unique logged dates per cycle, capped at 100
    const recentCycles = completedCycles.slice(-3);
    let totalExpectedDays = 0;
    let totalLoggedDays = 0;

    recentCycles.forEach(cycle => {
      const length = cycle.cycleLengthDays as number;
      totalExpectedDays += length;
      
      const cycleEnd = addDays(cycle.startDate, length - 1);
      
      // Use a Set to count unique logged dates within this cycle's date range
      const loggedDatesInCycle = new Set<string>(
        logs
          .filter(l => l.date >= cycle.startDate && l.date <= cycleEnd)
          .map(l => l.date)
      );
      totalLoggedDays += loggedDatesInCycle.size;
    });

    const loggingConsistencyPercent = (recentCycles.length >= 3 && totalExpectedDays > 0)
      ? Math.min(100, Math.round((totalLoggedDays / totalExpectedDays) * 100))
      : null;

    return {
      cycleLengthHistory,
      periodDurationHistory,
      monthlyPainHistory,
      energyPeakCycleDay,
      energyPeakAverage,
      energyPeakSampleCount,
      loggingConsistencyPercent,
    };
  }
}

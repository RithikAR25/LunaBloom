import type { DailyLog } from '../models/DailyLog';
import type { CycleEntry } from '../models/Cycle';
import type { 
  PhaseSymptomTrends, 
  PhaseMoodTrends, 
  PhaseWellbeingTrends, 
  CyclePhase 
} from '../models/Insights';
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
}

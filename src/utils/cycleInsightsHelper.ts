import type { CycleEntry } from '../domain/models/Cycle';
import type { DailyLog } from '../domain/models/DailyLog';
import { addDays, daysBetween } from './dateUtils';

export interface CyclePhaseLengths {
  menstrual: number;
  follicular: number;
  ovulatory: number;
  luteal: number;
}

export interface CycleInsights {
  phaseLengths: CyclePhaseLengths;
  avgPain: number | null;
  avgEnergy: number | null;
  flowDays: {
    heavy: number[];
    medium: number[];
    light: number[];
    spotting: number[];
    very_heavy: number[];
  };
  totalLogsCount: number;
}

export function getFullCycleDateRange(
  cycle: CycleEntry,
  allCycles: CycleEntry[]
): { start: string; end: string | null; isCurrent: boolean } {
  // Sort chronologically ascending
  const chronCycles = [...allCycles].sort((a, b) => a.startDate.localeCompare(b.startDate));
  const currentIndex = chronCycles.findIndex(c => c.id === cycle.id);
  
  if (currentIndex === -1) {
    return { start: cycle.startDate, end: null, isCurrent: true };
  }
  
  const nextCycle = chronCycles[currentIndex + 1];
  
  if (nextCycle) {
    return {
      start: cycle.startDate,
      end: addDays(nextCycle.startDate, -1),
      isCurrent: false
    };
  } else {
    // Latest cycle with no subsequent cycle
    return {
      start: cycle.startDate,
      end: null,
      isCurrent: true
    };
  }
}

export function calculateCycleInsights(
  cycle: CycleEntry,
  logs: DailyLog[],
  globalAvgCycleLength: number
): CycleInsights {
  // --- Phase Length Calculation (matching CyclePhaseService.ts logic exactly) ---
  const periodDuration = cycle.durationDays ?? 5;
  const lengthToUse = cycle.cycleLengthDays ?? globalAvgCycleLength;
  
  const lutealStartDay = Math.max(lengthToUse - 13, periodDuration + 1);
  const ovulatoryStartDay = Math.max(lutealStartDay - 4, periodDuration + 1);
  
  const menstrual = periodDuration;
  const luteal = lengthToUse - lutealStartDay + 1;
  const ovulatory = lutealStartDay - ovulatoryStartDay;
  const follicular = Math.max(0, ovulatoryStartDay - periodDuration - 1);

  // --- Log Aggregation ---
  let painSum = 0;
  let painCount = 0;
  
  let energySum = 0;
  let energyCount = 0;
  
  const flowDays: CycleInsights['flowDays'] = {
    heavy: [],
    medium: [],
    light: [],
    spotting: [],
    very_heavy: [],
  };

  for (const log of logs) {
    if (log.painLevel != null) {
      painSum += log.painLevel;
      painCount++;
    }
    
    if (log.energyLevel != null) {
      energySum += log.energyLevel;
      energyCount++;
    }
    
    if (log.flowIntensity) {
      const flow = log.flowIntensity.toLowerCase();
      // Safely calculate the cycle day purely based on dates
      const cycleDay = daysBetween(cycle.startDate, log.date) + 1;
      
      if (flow === 'heavy') flowDays.heavy.push(cycleDay);
      else if (flow === 'medium') flowDays.medium.push(cycleDay);
      else if (flow === 'light') flowDays.light.push(cycleDay);
      else if (flow === 'spotting') flowDays.spotting.push(cycleDay);
      else if (flow === 'very_heavy') flowDays.very_heavy.push(cycleDay);
    }
  }
  
  // Sort all flow days ascending
  Object.values(flowDays).forEach(arr => arr.sort((a, b) => a - b));

  const avgPain = painCount > 0 ? Math.round((painSum / painCount) * 10) / 10 : null;
  const avgEnergy = energyCount > 0 ? Math.round((energySum / energyCount) * 10) / 10 : null;

  return {
    phaseLengths: {
      menstrual,
      follicular,
      ovulatory,
      luteal,
    },
    avgPain,
    avgEnergy,
    flowDays,
    totalLogsCount: logs.length,
  };
}

export type PhaseKey = 'menstrual' | 'follicular' | 'ovulatory' | 'luteal';

export function getPhaseForCycleDay(day: number, lengths: CyclePhaseLengths): PhaseKey {
  if (day <= lengths.menstrual) return 'menstrual';
  if (day <= lengths.menstrual + lengths.follicular) return 'follicular';
  if (day <= lengths.menstrual + lengths.follicular + lengths.ovulatory) return 'ovulatory';
  return 'luteal';
}

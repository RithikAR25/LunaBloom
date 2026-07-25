import type { CycleEntry } from '../models/Cycle';
import { addDays, todayISO } from '../../utils/dateUtils';

export type CyclePhase = 'MENSTRUAL' | 'FOLLICULAR' | 'OVULATORY' | 'LUTEAL';
export type FertilityStatus = 'fertile' | 'possible' | 'not_fertile' | 'unknown';

export interface PredictionResult {
  predictedStartDate: string;
  confidenceRange: { earliest: string; latest: string };
  confidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  confidenceScore: number;
  basedOnCycles: number;
  isIrregular: boolean;
  irregularityExplanation?: string;
}

export interface OvulationPrediction {
  predictedOvulationDate?: string;
  fertileWindowStart?: string;
  fertileWindowEnd?: string;
  confidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  fertilityStatus: FertilityStatus;
  explanation?: string;
}

export interface PhaseInfo {
  phase: CyclePhase;
  fertilityStatus: FertilityStatus;
  cycleDay: number | null;
  isPredictedMenstrual?: boolean;
}

/**
 * Core engine for medical-grade cycle predictions.
 * 
 * Confidence Model:
 * The prediction engine evaluates overall data quality rather than relying on 
 * simplistic calendar counting. Confidence is calculated using:
 * 1. Historical Count: More cycles = higher confidence.
 * 2. Variance & Standard Deviation: A high variance (irregular cycles) drops confidence.
 * 3. Average Cycle Length: Unusually short (<21 days) or long cycles trigger safety fallbacks.
 * 
 * Fertility Fallback:
 * If a cycle is deemed to have 'LOW' confidence, or if the average cycle length 
 * is biologically unlikely to support ovulation (<21 days), the engine will NOT 
 * predict a fertile window. It will safely degrade to `fertilityStatus = 'unknown'`.
 */
export class CyclePredictionService {
  public predictNextPeriod(cycles: CycleEntry[], fallbackAvgCycleLength = 28): PredictionResult {
    const validCycles = cycles
      .filter((c) => c.cycleLengthDays !== undefined && c.cycleLengthDays !== null && !c.isExcludedFromPredictions)
      .sort((a, b) => (a.startDate > b.startDate ? -1 : 1));

    if (validCycles.length === 0) {
      const lastCycle = cycles.sort((a, b) => (a.startDate > b.startDate ? -1 : 1))[0];
      const baseDate = lastCycle ? lastCycle.startDate : new Date().toISOString().split('T')[0] ?? '';
      const predicted = addDays(baseDate, fallbackAvgCycleLength);
      return {
        predictedStartDate: predicted,
        confidenceRange: {
          earliest: addDays(predicted, -3),
          latest: addDays(predicted, 3),
        },
        confidenceLevel: 'LOW',
        confidenceScore: 0.1,
        basedOnCycles: 0,
        isIrregular: false,
        irregularityExplanation: 'Not enough data to determine regularity',
      };
    }

    const n = validCycles.length;
    let weightedSum = 0;
    
    for (let index = 0; index < n; index++) {
      const i = n - index;
      const weight = (2 * i) / (n * (n + 1));
      weightedSum += weight * (validCycles[index]?.cycleLengthDays ?? fallbackAvgCycleLength);
    }

    const predictedLength = Math.round(weightedSum);
    
    const lengths = validCycles.map(c => c.cycleLengthDays ?? fallbackAvgCycleLength);
    const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    const variance = lengths.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / lengths.length;
    const stdDev = Math.sqrt(variance);

    const isIrregular = stdDev > 7;
    const mostRecentCycle = validCycles[0];
    const baseDate = mostRecentCycle?.startDate ?? new Date().toISOString().split('T')[0] ?? '';
    const predictedStartDate = addDays(baseDate, predictedLength);

    let confidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
    let confidenceScore = 0;

    if (n >= 3 && stdDev <= 3) {
      confidenceLevel = 'HIGH';
      confidenceScore = 0.9;
    } else if (n >= 2 && stdDev <= 7) {
      confidenceLevel = 'MEDIUM';
      confidenceScore = 0.6;
    } else {
      confidenceLevel = 'LOW';
      confidenceScore = 0.3;
    }

    const marginOfError = Math.max(Math.round(stdDev), 2);

    return {
      predictedStartDate,
      confidenceRange: {
        earliest: addDays(predictedStartDate, -marginOfError),
        latest: addDays(predictedStartDate, marginOfError),
      },
      confidenceLevel,
      confidenceScore,
      basedOnCycles: n,
      isIrregular,
      ...(isIrregular && { irregularityExplanation: 'Cycle length varies by more than 7 days on average' }),
    };
  }

  public predictOvulation(cycles: CycleEntry[], fallbackAvgCycleLength = 28): OvulationPrediction {
    const periodPrediction = this.predictNextPeriod(cycles, fallbackAvgCycleLength);
    
    // Evaluate data quality for fertility prediction
    const validCycles = cycles.filter(c => c.cycleLengthDays);
    const avgLength = validCycles.length > 0 
      ? validCycles.reduce((sum, c) => sum + (c.cycleLengthDays || 0), 0) / validCycles.length 
      : fallbackAvgCycleLength;

    if (periodPrediction.confidenceLevel === 'LOW' || avgLength < 21) {
       return {
         confidenceLevel: 'LOW',
         fertilityStatus: 'unknown',
         explanation: 'Insufficient data or cycle length is too short to accurately estimate fertility.'
       };
    }

    const predictedOvulationDate = addDays(periodPrediction.predictedStartDate, -14);
    const fertileWindowStart = addDays(predictedOvulationDate, -5);
    const fertileWindowEnd = predictedOvulationDate;

    return {
      predictedOvulationDate,
      fertileWindowStart,
      fertileWindowEnd,
      confidenceLevel: periodPrediction.confidenceLevel,
      fertilityStatus: 'possible'
    };
  }

  public getPhaseForDate(
    dateStr: string, 
    cycles: CycleEntry[], 
    fallbackAvgCycleLength = 28, 
    fallbackAvgPeriodDuration = 5
  ): PhaseInfo {
    const sortedCycles = [...cycles].sort((a,b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    
    // 1. Is this day a logged menstrual day?
    const isMenstrual = sortedCycles.some(c => {
      if (c.endDate) return dateStr >= c.startDate && dateStr <= c.endDate;
      return dateStr >= c.startDate && dateStr <= todayISO();
    });

    // 2. Find which cycle this date belongs to
    const cycleIndex = sortedCycles.findIndex(c => dateStr >= c.startDate);
    
    if (cycleIndex === -1) {
      // Date is before any logged cycles
      return { phase: 'FOLLICULAR', fertilityStatus: 'unknown', cycleDay: null };
    }

    const currentCycle = sortedCycles[cycleIndex]!;
    const nextChronologicalCycle = cycleIndex > 0 ? sortedCycles[cycleIndex - 1] : null;
    const cycleDay = Math.floor((new Date(dateStr).getTime() - new Date(currentCycle.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Calculate cycle length for this specific cycle
    let cycleLength = fallbackAvgCycleLength;
    let confidenceLevel: 'HIGH'|'MEDIUM'|'LOW' = 'LOW';

    if (nextChronologicalCycle) {
      cycleLength = Math.floor((new Date(nextChronologicalCycle.startDate).getTime() - new Date(currentCycle.startDate).getTime()) / (1000 * 60 * 60 * 24));
      confidenceLevel = 'HIGH'; // Historical cycles are perfectly known
    } else {
      if (currentCycle.cycleLengthDays) {
        cycleLength = currentCycle.cycleLengthDays;
      } else {
        const prediction = this.predictNextPeriod(cycles, fallbackAvgCycleLength);
        cycleLength = Math.floor((new Date(prediction.predictedStartDate).getTime() - new Date(currentCycle.startDate).getTime()) / (1000 * 60 * 60 * 24));
        confidenceLevel = prediction.confidenceLevel;
      }
    }

    // Determine basic phase (ignoring fertility for a moment)
    let phase: CyclePhase = 'FOLLICULAR';
    let isPredictedMenstrual = false;

    if (isMenstrual) {
      phase = 'MENSTRUAL';
    } else if (!nextChronologicalCycle && cycleDay > cycleLength && cycleDay <= cycleLength + (fallbackAvgPeriodDuration - 1)) {
      phase = 'MENSTRUAL';
      isPredictedMenstrual = true;
    } else {
      // It's not menstrual, so it's follicular, ovulatory, or luteal.
      const ovulationDay = cycleLength - 14; 
      const fertileStart = ovulationDay - 3;
      const fertileEnd = ovulationDay + 1;

      if (cycleDay < fertileStart) {
        phase = 'FOLLICULAR';
      } else if (cycleDay >= fertileStart && cycleDay <= fertileEnd) {
        phase = 'OVULATORY';
      } else {
        phase = 'LUTEAL';
      }
    }

    // Determine fertility status
    let fertilityStatus: FertilityStatus = 'not_fertile';
    
    // Evaluate data quality for fertility:
    const validCycles = cycles.filter(c => c.cycleLengthDays);
    const avgLength = validCycles.length > 0 ? validCycles.reduce((s, c) => s + (c.cycleLengthDays||0), 0)/validCycles.length : fallbackAvgCycleLength;
    
    if (confidenceLevel === 'LOW' || avgLength < 21 || cycleLength < 21) {
      fertilityStatus = 'unknown';
    } else {
      const ovulationDay = cycleLength - 14; 
      const fertileStart = ovulationDay - 3;
      const fertileEnd = ovulationDay + 1;

      if (cycleDay >= fertileStart && cycleDay <= fertileEnd) {
        fertilityStatus = cycleDay === ovulationDay ? 'fertile' : 'possible';
      }
    }

    return {
      phase,
      fertilityStatus,
      cycleDay,
      isPredictedMenstrual
    };
  }
}

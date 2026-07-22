import type { CycleEntry } from '../models/Cycle';
import { addDays } from '../../utils/dateUtils';

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
  predictedOvulationDate: string;
  fertileWindowStart: string;
  fertileWindowEnd: string;
  confidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW';
}

export class CyclePredictionService {
  /**
   * Predicts the next period start date using a weighted average of recent cycles.
   * Recent cycles get higher weight.
   */
  public predictNextPeriod(cycles: CycleEntry[], fallbackAvgCycleLength = 28): PredictionResult {
    const validCycles = cycles
      .filter((c) => c.cycleLengthDays !== undefined && c.cycleLengthDays !== null)
      .sort((a, b) => (a.startDate > b.startDate ? -1 : 1)); // newest first

    if (validCycles.length === 0) {
      // No valid cycles to base on, use fallback
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

    // N valid cycles
    const n = validCycles.length;
    let weightedSum = 0;
    
    // Weight formula: w_i = (2 * i) / (n * (n+1)) where i=position, n=total cycles
    // i=n for newest, i=1 for oldest
    for (let index = 0; index < n; index++) {
      const i = n - index; // newest is index 0 -> i=n
      const weight = (2 * i) / (n * (n + 1));
      weightedSum += weight * (validCycles[index]?.cycleLengthDays ?? fallbackAvgCycleLength);
    }

    const predictedLength = Math.round(weightedSum);
    
    // Detect irregularity
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
    
    // Luteal phase is usually 14 days, so ovulation is 14 days before next period
    const predictedOvulationDate = addDays(periodPrediction.predictedStartDate, -14);
    
    // Fertile window is typically 5 days before ovulation + day of ovulation
    const fertileWindowStart = addDays(predictedOvulationDate, -5);
    const fertileWindowEnd = predictedOvulationDate;

    return {
      predictedOvulationDate,
      fertileWindowStart,
      fertileWindowEnd,
      confidenceLevel: periodPrediction.confidenceLevel,
    };
  }
}

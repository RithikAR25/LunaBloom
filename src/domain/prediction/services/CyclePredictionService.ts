import type { CycleEntry } from '../../models/Cycle';
import { addDays } from '../../../utils/dateUtils';
import { PredictionConfig } from '../config/PredictionConfig';
import { ProjectedCycle } from '../models/ProjectedCycle';
import { PredictionConfidence } from '../models/TimelineEvent';

export interface PredictionResult {
  predictedStartDate: string;
  confidenceRange: { earliest: string; latest: string };
  confidenceLevel: PredictionConfidence;
  confidenceScore: number;
  basedOnCycles: number;
  isIrregular: boolean;
  irregularityExplanation?: string;
  explanation: string[];
  predictedCycleLength: number;
}

export interface OvulationPrediction {
  predictedOvulationDate?: string;
  fertileWindowStart?: string;
  fertileWindowEnd?: string;
  confidenceLevel: PredictionConfidence;
  fertilityStatus: 'fertile' | 'possible' | 'not_fertile' | 'unknown';
  explanation?: string;
}

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
        confidenceLevel: PredictionConfidence.LOW,
        confidenceScore: 0.1,
        basedOnCycles: 0,
        isIrregular: false,
        irregularityExplanation: 'Not enough data to determine regularity',
        explanation: ['More cycle history will improve predictions.'],
        predictedCycleLength: fallbackAvgCycleLength,
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

    let confidenceLevel = PredictionConfidence.LOW;
    let confidenceScore = 0;

    if (n >= 3 && stdDev <= 3) {
      confidenceLevel = PredictionConfidence.HIGH;
      confidenceScore = 0.9;
    } else if (n >= 2 && stdDev <= 7) {
      confidenceLevel = PredictionConfidence.MEDIUM;
      confidenceScore = 0.6;
    } else {
      confidenceLevel = PredictionConfidence.LOW;
      confidenceScore = 0.3;
    }

    const marginOfError = Math.max(Math.round(stdDev), 2);
    
    const explanation: string[] = [];
    if (n === 0) explanation.push('More cycle history will improve predictions.');
    else explanation.push(`Based on your last ${n} cycles.`);
    if (isIrregular) explanation.push('Your cycle length varies significantly.');

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
      explanation,
      predictedCycleLength: predictedLength,
    };
  }

  public predictOvulation(cycles: CycleEntry[], fallbackAvgCycleLength = 28): OvulationPrediction {
    const periodPrediction = this.predictNextPeriod(cycles, fallbackAvgCycleLength);
    
    const validCycles = cycles.filter(c => c.cycleLengthDays);
    const avgLength = validCycles.length > 0 
      ? validCycles.reduce((sum, c) => sum + (c.cycleLengthDays || 0), 0) / validCycles.length 
      : fallbackAvgCycleLength;

    if (periodPrediction.confidenceLevel === PredictionConfidence.LOW || avgLength < 21) {
       return {
         confidenceLevel: PredictionConfidence.LOW,
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

  public generateFutureCycles(
    lastLoggedCycle: CycleEntry | undefined,
    predictionResult: PredictionResult,
    predictedPeriodDuration: number = 5
  ): ProjectedCycle[] {
    const projectedCycles: ProjectedCycle[] = [];
    
    if (!lastLoggedCycle) return projectedCycles;

    let currentStart = addDays(lastLoggedCycle.startDate, predictionResult.predictedCycleLength);
    const baseConfidence = predictionResult.confidenceLevel;
    const predictedCycleLength = predictionResult.predictedCycleLength;

    const endOfPeriod = addDays(currentStart, predictedPeriodDuration - 1);
    
    const ovulationDay = predictedCycleLength - 14; 
    const predictedOvulationDate = addDays(currentStart, ovulationDay - 1);
    const fertileWindowStart = addDays(predictedOvulationDate, -3); 
    const fertileWindowEnd = addDays(predictedOvulationDate, 1);

    projectedCycles.push({
      predictedStartDate: currentStart,
      predictedEndDate: endOfPeriod,
      predictedCycleLength,
      predictedPeriodDuration,
      predictedOvulationDate,
      fertileWindowStart,
      fertileWindowEnd,
      confidence: baseConfidence,
      projectionNumber: 0
    });
    
    // The first item in projectedCycles actually starts on the same day as lastLoggedCycle!
    // Wait, in my previous implementation:
    // let currentStart = lastLoggedCycle.startDate;
    // projectedCycles.push({ predictedStartDate: currentStart })
    // Then currentStart = addDays(currentStart, predictedCycleLength)
    // 
    // This meant ProjectedCycle[0] was the CURRENT historical cycle.
    // That's wrong! generateFutureCycles should return FUTURE cycles.
    // Let me fix that.
    return projectedCycles;
  }
}

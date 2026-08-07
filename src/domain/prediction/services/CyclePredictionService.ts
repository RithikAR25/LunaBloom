import type { CycleEntry } from '../../models/Cycle';
import { addDays } from '../../../utils/dateUtils';
import { PredictionConfidence } from '../models/TimelineEvent';
import { CyclePrediction } from '../models/CyclePrediction';
import { CycleBiology } from '../models/CycleBiology';

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

export class CyclePredictionService {
  
  private calculateCycleBiology(startDate: string, cycleLength: number, periodDuration: number): CycleBiology {
    const periodStart = startDate;
    const periodEnd = addDays(periodStart, periodDuration - 1);
    
    // Ovulation is roughly 14 days BEFORE the next period starts
    const ovulationDay = cycleLength - 14; 
    const ovulationDate = addDays(startDate, ovulationDay - 1);
    
    // Fertile window is 5 days before ovulation up to the day of ovulation
    const fertileWindowStart = addDays(ovulationDate, -5); 
    const fertileWindowEnd = ovulationDate;

    // Follicular phase is from end of period to the day before ovulation
    const follicularStart = addDays(periodEnd, 1);
    const follicularEnd = addDays(ovulationDate, -1);

    // Luteal phase is from after ovulation to before next period
    const lutealStart = addDays(ovulationDate, 1);
    const lutealEnd = addDays(startDate, cycleLength - 1);

    return {
      periodStart,
      periodEnd,
      follicularStart,
      follicularEnd,
      fertileWindowStart,
      fertileWindowEnd,
      ovulationDate,
      lutealStart,
      lutealEnd
    };
  }

  public predictHistoricalCycle(startDate: string, cycleLengthDays: number, periodDuration: number): CycleBiology {
    return this.calculateCycleBiology(startDate, cycleLengthDays, periodDuration);
  }

  public predict(cycles: CycleEntry[], fallbackAvgCycleLength = 28, predictedPeriodDuration = 5): CyclePrediction | null {
    const validCycles = cycles
      .filter((c) => !c.isExcludedFromPredictions)
      .sort((a, b) => (a.startDate > b.startDate ? -1 : 1));

    if (validCycles.length === 0) {
      return null;
    }

    const lastLoggedCycle = validCycles[0]!;
    
    // Only use cycles with known lengths to calculate average
    const completedCycles = validCycles.filter(c => c.cycleLengthDays !== undefined && c.cycleLengthDays !== null);
    
    let predictedCycleLength = fallbackAvgCycleLength;
    let confidenceLevel = PredictionConfidence.LOW;
    const explanation: string[] = [];

    const n = completedCycles.length;

    if (n === 0) {
      explanation.push('More cycle history will improve predictions.');
    } else {
      let weightedSum = 0;
      for (let index = 0; index < n; index++) {
        const i = n - index;
        const weight = (2 * i) / (n * (n + 1));
        weightedSum += weight * (completedCycles[index]?.cycleLengthDays ?? fallbackAvgCycleLength);
      }

      predictedCycleLength = Math.round(weightedSum);
      
      const lengths = completedCycles.map(c => c.cycleLengthDays ?? fallbackAvgCycleLength);
      const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
      const variance = lengths.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / lengths.length;
      const stdDev = Math.sqrt(variance);

      const isIrregular = stdDev > 7;

      if (n >= 3 && stdDev <= 3) {
        confidenceLevel = PredictionConfidence.HIGH;
      } else if (n >= 2 && stdDev <= 7) {
        confidenceLevel = PredictionConfidence.MEDIUM;
      }

      explanation.push(`Based on your last ${n} cycles.`);
      if (isIrregular) explanation.push('Your cycle length varies significantly.');
    }

    const biology = this.calculateCycleBiology(lastLoggedCycle.startDate, predictedCycleLength, predictedPeriodDuration);

    const nextPeriodStart = addDays(lastLoggedCycle.startDate, predictedCycleLength);
    const nextPeriodEnd = addDays(nextPeriodStart, predictedPeriodDuration - 1);

    return {
      fertileWindowStart: biology.fertileWindowStart,
      fertileWindowEnd: biology.fertileWindowEnd,
      ovulationDate: biology.ovulationDate,
      nextPeriodStart,
      nextPeriodEnd,
      predictedCycleLength,
      predictedPeriodDuration,
      confidence: confidenceLevel,
      explanation
    };
  }

}

import type { CycleEntry } from '../../models/Cycle';
import { addDays } from '../../../utils/dateUtils';
import { PredictionConfidence } from '../models/TimelineEvent';
import { CyclePrediction } from '../models/CyclePrediction';
import { CycleBiology } from '../models/CycleBiology';
import { median, medianAbsoluteDeviation, continuousDecayWeight } from '../utils/statisticsUtils';

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
      const lengths = completedCycles.map(c => c.cycleLengthDays ?? fallbackAvgCycleLength);

      // Step 1 — Median and MAD for robust variability measurement
      const medianLength = median(lengths);
      const mad = medianAbsoluteDeviation(lengths, medianLength);

      // Step 2 — LWMA with Cauchy soft-outlier weighting
      // Each cycle gets a recency weight (LWMA) multiplied by a Cauchy outlier weight (MAD-based).
      // Anomalous cycles (stress, illness, travel) are downweighted rather than hard-excluded,
      // preserving all information while preventing one outlier from dominating the prediction.
      let weightedSum = 0;
      let totalWeight = 0;
      for (let index = 0; index < n; index++) {
        const i = n - index; // most recent cycle → i = n (highest recency weight)
        const recencyWeight = (2 * i) / (n * (n + 1));
        const length = completedCycles[index]?.cycleLengthDays ?? fallbackAvgCycleLength;
        const outlierWeight = continuousDecayWeight(Math.abs(length - medianLength), mad);
        const combined = recencyWeight * outlierWeight;
        weightedSum += combined * length;
        totalWeight += combined;
      }

      predictedCycleLength = Math.round(totalWeight > 0 ? weightedSum / totalWeight : medianLength);

      // Step 3 — Confidence from MAD (more robust than StdDev for skewed menstrual-cycle data)
      // MAD thresholds approximate the original StdDev thresholds under normal-ish distributions.
      const isIrregular = mad > 5;

      if (n >= 3 && mad <= 2) {
        confidenceLevel = PredictionConfidence.HIGH;
      } else if (n >= 2 && mad <= 5) {
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

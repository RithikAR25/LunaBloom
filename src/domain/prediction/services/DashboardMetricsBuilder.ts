import { PredictionConfidence } from '../models/TimelineEvent';
import { PredictionSummary } from '../models/PredictionSummary';
import { daysBetween } from '../../../utils/dateUtils';
import { CyclePrediction } from '../models/CyclePrediction';

export class DashboardMetricsBuilder {
  
  public build(referenceDate: string, prediction: CyclePrediction | null): PredictionSummary {
    if (!prediction) {
       return {
         predictedCycleLength: null,
         daysUntilNextPeriod: null,
         nextPeriodDate: null,
         confidence: PredictionConfidence.LOW
       };
    }

    const nextPeriodDate = prediction.nextPeriodStart;
    const daysUntilNextPeriod = referenceDate <= nextPeriodDate ? daysBetween(referenceDate, nextPeriodDate) : null;

    return {
      predictedCycleLength: prediction.predictedCycleLength,
      daysUntilNextPeriod,
      nextPeriodDate,
      confidence: prediction.confidence
    };
  }
}

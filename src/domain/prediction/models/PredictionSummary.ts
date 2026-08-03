import { PredictionConfidence } from './TimelineEvent';

export interface PredictionSummary {
  predictedCycleLength: number | null;
  daysUntilNextPeriod: number | null;
  nextPeriodDate: string | null;
  confidence: PredictionConfidence;
}

import { PredictionConfidence } from './TimelineEvent';

export interface CyclePrediction {
  fertileWindowStart: string;
  fertileWindowEnd: string;
  ovulationDate: string;
  nextPeriodStart: string;
  nextPeriodEnd: string;
  predictedCycleLength: number;
  predictedPeriodDuration: number;
  confidence: PredictionConfidence;
  explanation: string[];
}

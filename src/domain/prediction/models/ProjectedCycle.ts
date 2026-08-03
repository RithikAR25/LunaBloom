import { PredictionConfidence } from './TimelineEvent';

export interface ProjectedCycle {
  predictedStartDate: string;
  predictedEndDate: string; 
  predictedCycleLength: number;
  predictedPeriodDuration: number;
  predictedOvulationDate?: string;
  fertileWindowStart?: string;
  fertileWindowEnd?: string;
  confidence: PredictionConfidence;
  projectionNumber: number;
}

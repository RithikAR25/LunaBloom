import { PredictionConfidence } from './TimelineEvent';

export type CyclePhase = 'MENSTRUAL' | 'FOLLICULAR' | 'OVULATION' | 'LUTEAL';

export interface PhaseInterval {
  phase: CyclePhase;
  startDate: string;
  endDate: string;
  source: 'LOGGED' | 'RECONSTRUCTED' | 'PREDICTED';
  confidence?: PredictionConfidence;
}

export enum TimelineEventType {
  PERIOD = 'PERIOD',
  FERTILE_WINDOW = 'FERTILE_WINDOW',
  OVULATION = 'OVULATION',
}

export type TimelineEventSource = 'LOGGED' | 'RECONSTRUCTED' | 'PREDICTED';

export enum PredictionConfidence {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export interface TimelineEvent {
  id: string; 
  type: TimelineEventType;
  date: string;         // Start date (YYYY-MM-DD)
  duration: number;     // Days the event lasts
  source: TimelineEventSource;
  priority: number;     // Higher number = higher priority for conflict resolution
  confidence?: PredictionConfidence;
}

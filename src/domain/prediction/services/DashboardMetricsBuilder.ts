import { TimelineEvent, TimelineEventType, PredictionConfidence } from '../models/TimelineEvent';
import { PredictionSummary } from '../models/PredictionSummary';
import { daysBetween } from '../../../utils/dateUtils';
import { PredictionResult } from './CyclePredictionService';

export class DashboardMetricsBuilder {
  
  public build(events: TimelineEvent[], referenceDate: string, predictionResult?: PredictionResult | null): PredictionSummary {
    const sortedPeriods = events
      .filter(e => e.type === TimelineEventType.PERIOD)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Find the period that represents the start of the current cycle
    const lastPeriod = [...sortedPeriods].reverse().find(e => e.date <= referenceDate);
    
    // Find the period that represents the start of the NEXT cycle
    const nextPeriod = sortedPeriods.find(e => e.date > (lastPeriod ? lastPeriod.date : referenceDate));

    // Calculate length of the cycle the user is currently in (or predicted to be in)
    const predictedCycleLength = lastPeriod && nextPeriod 
      ? daysBetween(lastPeriod.date, nextPeriod.date) 
      : (predictionResult?.predictedCycleLength ?? null);

    const nextPeriodDate = nextPeriod ? nextPeriod.date : null;
    
    const daysUntilNextPeriod = nextPeriod && referenceDate <= nextPeriod.date 
      ? daysBetween(referenceDate, nextPeriod.date) 
      : null;

    // Use confidence from the next period event, or fallback to LOW
    const confidence = nextPeriod?.confidence ?? PredictionConfidence.LOW;

    return {
      predictedCycleLength,
      daysUntilNextPeriod,
      nextPeriodDate,
      confidence
    };
  }
}

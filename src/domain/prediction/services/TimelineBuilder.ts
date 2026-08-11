import { CycleEntry } from '../../models/Cycle';
import { CyclePrediction } from '../models/CyclePrediction';
import { PhaseInterval } from '../models/PhaseInterval';
import { TimelineEvent, TimelineEventType } from '../models/TimelineEvent';
import { daysBetween, addDays } from '../../../utils/dateUtils';
import { CyclePredictionService } from './CyclePredictionService';
import { CycleBiology } from '../models/CycleBiology';

export class TimelineBuilder {
  
  constructor(private predictionService: CyclePredictionService) {}

  public build(cycles: CycleEntry[], prediction: CyclePrediction | null, referenceDate: string, defaultPeriodDuration: number = 5): { events: TimelineEvent[], intervals: PhaseInterval[] } {
    const events: TimelineEvent[] = [];
    const intervals: PhaseInterval[] = [];
    
    const sortedCycles = [...cycles].sort((a, b) => (a.startDate > b.startDate ? -1 : 1));
    const latestCycle = sortedCycles[0];

    let isActiveCycle = false;
    let elapsedDays = 0;
    if (latestCycle && !latestCycle.endDate) {
      isActiveCycle = true;
      elapsedDays = daysBetween(latestCycle.startDate, referenceDate) + 1;
    }

    // 1. Map logged cycles to events and MENSTRUAL intervals, and reconstruct history
    cycles.forEach((c, index) => {
      let duration: number;
      if (c.endDate) {
        duration = daysBetween(c.startDate, c.endDate) + 1;
      } else if (c === latestCycle) {
        duration = Math.max(1, Math.min(elapsedDays, defaultPeriodDuration));
      } else {
        duration = 5; // Fallback for corrupted historical cycles missing endDate
      }
      const endDate = c.endDate || addDays(c.startDate, duration - 1);
      
      // LOGGED PERIOD
      events.push({
        id: `logged-period-${c.id || index}`,
        type: TimelineEventType.PERIOD,
        date: c.startDate,
        duration: duration,
        source: 'LOGGED',
        priority: 100 // Highest priority
      });

      intervals.push({
        phase: 'MENSTRUAL',
        startDate: c.startDate,
        endDate: endDate,
        source: 'LOGGED'
      });

      // If we have a completed historical cycle with known length, reconstruct its biology
      if (c.cycleLengthDays) {
        const biology = this.predictionService.predictHistoricalCycle(c.startDate, c.cycleLengthDays, duration);
        this.mapBiologyToTimeline(biology, events, intervals, 'RECONSTRUCTED');
      }
    });

    // 2. Map Prediction to events and subsequent intervals
    if (prediction && cycles.length > 0) {
      const canDrawFuturePredictions = !isActiveCycle || elapsedDays >= defaultPeriodDuration;
      
      if (canDrawFuturePredictions) {
        const lastLoggedCycle = latestCycle!;
        const duration = lastLoggedCycle.endDate ? daysBetween(lastLoggedCycle.startDate, lastLoggedCycle.endDate) + 1 : Math.max(1, Math.min(elapsedDays, defaultPeriodDuration));
        
        const biology = this.predictionService.predictHistoricalCycle(lastLoggedCycle.startDate, prediction.predictedCycleLength, duration);
        this.mapBiologyToTimeline(biology, events, intervals, 'PREDICTED', prediction.confidence);

        // And add the PREDICTED next period
        events.push({
          id: `predicted-period`,
          type: TimelineEventType.PERIOD,
          date: prediction.nextPeriodStart,
          duration: prediction.predictedPeriodDuration,
          source: 'PREDICTED',
          priority: 60, // Lowest period priority
          confidence: prediction.confidence
        });

        intervals.push({
          phase: 'MENSTRUAL',
          startDate: prediction.nextPeriodStart,
          endDate: prediction.nextPeriodEnd,
          source: 'PREDICTED',
          confidence: prediction.confidence
        });
      }
    }

    return {
      events: this.resolveConflicts(events),
      intervals
    };
  }

  private mapBiologyToTimeline(
    biology: CycleBiology, 
    events: TimelineEvent[], 
    intervals: PhaseInterval[], 
    source: 'RECONSTRUCTED' | 'PREDICTED',
    confidence?: any
  ) {
    // Events
    events.push({
      id: `${source.toLowerCase()}-fertile-${biology.periodStart}`,
      type: TimelineEventType.FERTILE_WINDOW,
      date: biology.fertileWindowStart,
      duration: daysBetween(biology.fertileWindowStart, biology.fertileWindowEnd) + 1,
      source: source,
      priority: source === 'RECONSTRUCTED' ? 85 : 55,
      confidence
    });

    events.push({
      id: `${source.toLowerCase()}-ovulation-${biology.periodStart}`,
      type: TimelineEventType.OVULATION,
      date: biology.ovulationDate,
      duration: 1,
      source: source,
      priority: source === 'RECONSTRUCTED' ? 95 : 65,
      confidence
    });

    // Intervals
    if (biology.follicularStart <= biology.follicularEnd) {
      intervals.push({
        phase: 'FOLLICULAR',
        startDate: biology.follicularStart,
        endDate: biology.follicularEnd,
        source: source,
        confidence
      });
    }

    // OVULATION (Put this before FERTILE so array.find matches it for the exact day)
    intervals.push({
      phase: 'OVULATION',
      startDate: biology.ovulationDate,
      endDate: biology.ovulationDate,
      source: source,
      confidence
    });

    // The fertile window is tracked as an Event (TimelineEventType.FERTILE_WINDOW), 
    // not a mutually exclusive PhaseInterval.

    if (biology.lutealStart <= biology.lutealEnd) {
      intervals.push({
        phase: 'LUTEAL',
        startDate: biology.lutealStart,
        endDate: biology.lutealEnd,
        source: source,
        confidence
      });
    }
  }

  private resolveConflicts(events: TimelineEvent[]): TimelineEvent[] {
    const getPriority = (source: string, type: TimelineEventType) => {
      if (type === TimelineEventType.PERIOD) {
        if (source === 'LOGGED') return 5;
        if (source === 'RECONSTRUCTED') return 4;
        return 2; // PREDICTED
      } else {
        if (source === 'RECONSTRUCTED') return 3;
        return 1; // PREDICTED
      }
    };

    return events.filter(event => {
      if (event.source === 'LOGGED') return true; 
      
      const eventEnd = addDays(event.date, event.duration - 1);
      const eventPriority = getPriority(event.source, event.type);
      
      const overlapsHigherPriority = events.some(other => {
        if (event === other) return false;
        if (event.type !== other.type) return false; // ONLY resolve conflicts between events of the same type
        
        const otherPriority = getPriority(other.source, other.type);
        if (otherPriority <= eventPriority) return false;
        
        const otherEnd = addDays(other.date, other.duration - 1);
        return (event.date <= otherEnd && eventEnd >= other.date);
      });
      
      return !overlapsHigherPriority; 
    });
  }
}

import { TimelineEvent, TimelineEventType } from '../models/TimelineEvent';
import { daysBetween } from '../../../utils/dateUtils';

export type CyclePhase = 'MENSTRUAL' | 'FOLLICULAR' | 'OVULATORY' | 'LUTEAL';
export type FertilityStatus = 'fertile' | 'possible' | 'not_fertile' | 'unknown';

export interface PhaseInfo {
  phase: CyclePhase | null;
  fertilityStatus: FertilityStatus;
  cycleDay: number | null;
  isPredictedMenstrual?: boolean;
}

export class PhaseResolver {
  public getPhaseForDate(
    dateStr: string,
    activeEvents: TimelineEvent[],
    allEvents: TimelineEvent[]
  ): PhaseInfo {
    // 2. Sort active events by priority
    activeEvents.sort((a, b) => b.priority - a.priority);
    const topEvent = activeEvents[0];

    // 3. Find the most recent PERIOD event before or on dateStr to calculate cycleDay
    const pastPeriods = allEvents.filter(e => e.type === TimelineEventType.PERIOD && e.date <= dateStr).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const lastPeriod = pastPeriods[0];
    const cycleDay = lastPeriod ? daysBetween(lastPeriod.date, dateStr) + 1 : null;

    if (!topEvent) {
      // We are in a gap between events (Follicular or Luteal)
      if (lastPeriod) {
         // Find the next ovulation event associated with this period
         const nextOvulation = allEvents.find(e => e.type === TimelineEventType.OVULATION && e.date > lastPeriod.date);
         
         if (nextOvulation) {
             if (dateStr < nextOvulation.date) {
                 return { phase: 'FOLLICULAR', fertilityStatus: 'not_fertile', cycleDay };
             } else {
                 if (daysBetween(nextOvulation.date, dateStr) <= 16) {
                     return { phase: 'LUTEAL', fertilityStatus: 'not_fertile', cycleDay };
                 } else {
                     return { phase: null, fertilityStatus: 'unknown', cycleDay };
                 }
             }
         }
      }
      return { phase: null, fertilityStatus: 'unknown', cycleDay };
    }

    let phase: CyclePhase | null = null;
    let fertilityStatus: FertilityStatus = 'not_fertile';
    let isPredictedMenstrual = false;

    if (topEvent.type === TimelineEventType.PERIOD) {
      phase = 'MENSTRUAL';
      isPredictedMenstrual = topEvent.source === 'PREDICTED';
    } else if (topEvent.type === TimelineEventType.FERTILE_WINDOW || topEvent.type === TimelineEventType.OVULATION) {
      phase = 'OVULATORY';
      
      const ovulationEvent = activeEvents.find(e => e.type === TimelineEventType.OVULATION);
      const isLowConfidence = activeEvents.some(e => e.confidence === 'LOW');
      
      if (isLowConfidence) {
        fertilityStatus = 'unknown';
      } else {
        fertilityStatus = ovulationEvent ? 'fertile' : 'possible';
      }
    }

    return { phase, fertilityStatus, cycleDay, isPredictedMenstrual };
  }
}

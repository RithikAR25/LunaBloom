import { TimelineEvent, TimelineEventType } from '../models/TimelineEvent';
import { PhaseInterval, CyclePhase } from '../models/PhaseInterval';
import { daysBetween } from '../../../utils/dateUtils';

export type FertilityStatus = 'fertile' | 'possible' | 'not_fertile' | 'unknown';

export interface PhaseInfo {
  phase: CyclePhase | null;
  fertilityStatus: FertilityStatus;
  cycleDay: number | null;
  source?: 'LOGGED' | 'RECONSTRUCTED' | 'PREDICTED';
  /**
   * @deprecated Use `source` and `phase` instead.
   */
  isPredictedMenstrual?: boolean;
}

export class PhaseResolver {
  public getPhaseForDate(
    dateStr: string,
    intervals: PhaseInterval[],
    eventsIndex: Map<string, TimelineEvent[]>
  ): PhaseInfo {
    
    // Find last MENSTRUAL interval to calculate cycleDay (intervals is a small array so this is very fast)
    const pastPeriods = intervals.filter(i => i.phase === 'MENSTRUAL' && i.startDate <= dateStr)
                                 .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    const lastPeriod = pastPeriods[0];
    const cycleDay = lastPeriod ? daysBetween(lastPeriod.startDate, dateStr) + 1 : null;

    const currentInterval = intervals.find(i => dateStr >= i.startDate && dateStr <= i.endDate);
    
    // O(1) lookup for events happening on this specific day
    const eventsToday = eventsIndex.get(dateStr) || [];
    
    const isFertileEvent = eventsToday.some(e => e.type === TimelineEventType.FERTILE_WINDOW || e.type === TimelineEventType.OVULATION);
    const isOvulationEvent = eventsToday.some(e => e.type === TimelineEventType.OVULATION);

    if (!currentInterval) {
        return { phase: null, fertilityStatus: 'unknown', cycleDay };
    }

    let fertilityStatus: FertilityStatus = 'not_fertile';
    if (isOvulationEvent) {
        fertilityStatus = 'fertile';
    } else if (isFertileEvent) {
        fertilityStatus = 'possible';
    } else if (currentInterval.confidence === 'LOW') {
        fertilityStatus = 'unknown';
    }

    return { 
        phase: currentInterval.phase, 
        fertilityStatus, 
        cycleDay, 
        source: currentInterval.source,
        isPredictedMenstrual: currentInterval.phase === 'MENSTRUAL' && currentInterval.source === 'PREDICTED' 
    };
  }
}

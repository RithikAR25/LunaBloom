import { CycleEntry } from '../../models/Cycle';
import { ProjectedCycle } from '../models/ProjectedCycle';
import { TimelineEvent, TimelineEventType } from '../models/TimelineEvent';
import { daysBetween, addDays } from '../../../utils/dateUtils';

export class TimelineBuilder {
  
  public generateTimeline(cycles: CycleEntry[], projections: ProjectedCycle[]): TimelineEvent[] {
    const events: TimelineEvent[] = [];
    
    // 1. Add logged cycles
    cycles.forEach((c, index) => {
      const duration = c.endDate ? daysBetween(c.startDate, c.endDate) + 1 : 5; // Default 5 if ongoing/unknown
      
      events.push({
        id: `logged-period-${c.id || index}`,
        type: TimelineEventType.PERIOD,
        date: c.startDate,
        duration: duration,
        source: 'LOGGED',
        priority: 100 
      });
      
      // Calculate historical fertility based on the cycleLength (if known)
      if (c.cycleLengthDays) {
        const ovulationDay = c.cycleLengthDays - 14;
        const predictedOvulationDate = addDays(c.startDate, ovulationDay - 1);
        events.push({
            id: `logged-ovulation-${c.id || index}`,
            type: TimelineEventType.OVULATION,
            date: predictedOvulationDate,
            duration: 1,
            source: 'LOGGED', // Technically derived from logged
            priority: 90
        });
        
        events.push({
            id: `logged-fertile-${c.id || index}`,
            type: TimelineEventType.FERTILE_WINDOW,
            date: addDays(predictedOvulationDate, -3),
            duration: 5,
            source: 'LOGGED',
            priority: 80
        });
      }
    });

    // 2. Add projected cycles
    projections.forEach((p, index) => {
      events.push({
        id: `predicted-period-${index}`,
        type: TimelineEventType.PERIOD,
        date: p.predictedStartDate,
        duration: p.predictedPeriodDuration,
        source: 'PREDICTED',
        priority: 80,
        confidence: p.confidence
      });

      if (p.predictedOvulationDate) {
        events.push({
          id: `predicted-ovulation-${index}`,
          type: TimelineEventType.OVULATION,
          date: p.predictedOvulationDate,
          duration: 1,
          source: 'PREDICTED',
          priority: 60,
          confidence: p.confidence
        });
      }
      
      if (p.fertileWindowStart && p.fertileWindowEnd) {
        events.push({
          id: `predicted-fertile-${index}`,
          type: TimelineEventType.FERTILE_WINDOW,
          date: p.fertileWindowStart,
          duration: daysBetween(p.fertileWindowStart, p.fertileWindowEnd) + 1,
          source: 'PREDICTED',
          priority: 40,
          confidence: p.confidence
        });
      }
    });

    // 3. Resolve Conflicts
    return this.resolveConflicts(events);
  }

  private resolveConflicts(events: TimelineEvent[]): TimelineEvent[] {
     // A simple rule: if a predicted event overlaps a logged event of higher priority, drop it.
     const loggedPeriods = events.filter(e => e.source === 'LOGGED' && e.type === TimelineEventType.PERIOD);
     
     return events.filter(event => {
       if (event.source === 'LOGGED') return true; 
       
       const eventEnd = addDays(event.date, event.duration - 1);
       
       const overlapsLogged = loggedPeriods.some(lp => {
         const lpEnd = addDays(lp.date, lp.duration - 1);
         return (event.date <= lpEnd && eventEnd >= lp.date);
       });
       
       // Drop predicted event if it overlaps a logged period
       return !overlapsLogged; 
     });
  }
}

import { TimelineEvent } from '../models/TimelineEvent';
import { addDays } from '../../../utils/dateUtils';

export class TimelineIndexer {
  
  /**
   * Builds an O(1) lookup map mapping a date string (YYYY-MM-DD) to all events active on that day.
   */
  public buildDateIndex(events: TimelineEvent[]): Map<string, TimelineEvent[]> {
    const index = new Map<string, TimelineEvent[]>();
    
    events.forEach(event => {
      // For multi-day events, populate the index for each day
      for (let i = 0; i < event.duration; i++) {
        const currentDate = addDays(event.date, i);
        
        const existing = index.get(currentDate) || [];
        existing.push(event);
        
        // Sort events on the same day by priority descending
        existing.sort((a, b) => b.priority - a.priority);
        
        index.set(currentDate, existing);
      }
    });
    
    return index;
  }
}

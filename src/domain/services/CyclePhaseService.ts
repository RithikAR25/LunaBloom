import type { CycleEntry } from '../models/Cycle';
import type { CyclePhase } from '../models/Insights';
import { daysBetween } from '../../utils/dateUtils';

export class CyclePhaseService {
  /**
   * Determines the cycle phase for a given date, based on the cycle it belongs to.
   * If the date is outside the cycle bounds, returns 'UNKNOWN'.
   */
  public static getPhaseForDate(date: string, cycle: CycleEntry, avgCycleLength = 28): CyclePhase {
    if (date < cycle.startDate) {
      return 'UNKNOWN';
    }
    
    // If we have an endDate, the date must be before or equal to endDate.
    // If we don't have an endDate, the date can be any date after startDate.
    if (cycle.endDate && date > cycle.endDate) {
      return 'UNKNOWN';
    }

    const cycleDay = daysBetween(cycle.startDate, date) + 1;
    const periodDuration = cycle.durationDays ?? 5; // Default to 5 days if unknown
    
    // If the cycle is completed, we know the exact length.
    // If it's active, we use the average cycle length to estimate luteal/ovulatory phases.
    const lengthToUse = cycle.cycleLengthDays ?? avgCycleLength;

    if (cycleDay <= periodDuration) {
      return 'MENSTRUAL';
    }

    // Luteal phase is typically the last 14 days of the cycle
    const lutealStartDay = Math.max(lengthToUse - 13, periodDuration + 1);
    
    // Ovulatory phase is roughly 4 days before the luteal phase
    const ovulatoryStartDay = Math.max(lutealStartDay - 4, periodDuration + 1);

    if (cycleDay >= lutealStartDay) {
      return 'LUTEAL';
    } else if (cycleDay >= ovulatoryStartDay) {
      return 'OVULATORY';
    } else {
      return 'FOLLICULAR';
    }
  }
}

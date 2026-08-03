import type { ICycleRepository } from '../../repositories/ICycleRepository';
import type { CycleEntry } from '../../models/Cycle';
import { generateId, nowISO, todayISO, daysBetween, addDays } from '../../../utils/dateUtils';
import type { ValidationService } from '../../services/ValidationService';
import { ValidationError } from '../../errors';

export class StartPeriod {
  constructor(
    private cycleRepository: ICycleRepository,
    private validationService: ValidationService
  ) {}

  public async execute(startDate: string = todayISO(), defaultDurationDays: number = 5): Promise<CycleEntry> {
    /**
     * Business Rule:
     * Cycle events cannot occur in the future.
     * This invariant is enforced regardless of caller.
     */
    const dateRes = this.validationService.validateHistoricalDate(startDate);
    if (!dateRes.isValid) {
      throw new ValidationError(dateRes.error || 'Date cannot be in the future', 'startDate');
    }

    const allCycles = await this.cycleRepository.getAll();
    const now = nowISO();

    const sortedCycles = [...allCycles].sort((a,b) => a.startDate.localeCompare(b.startDate));
    const subsequentCycles = sortedCycles.filter(c => c.startDate > startDate);
    const isHistoric = subsequentCycles.length > 0;
    
    /**
     * Product Rule: Active Period Heuristic
     * If the user logs a period starting today or yesterday, we assume they are currently on their period,
     * so we create an "active" period (endDate = null).
     * If the date is older than yesterday, we assume it's a historical log and use their average duration.
     */
    const isTodayOrYesterday = daysBetween(startDate, todayISO()) <= 1;
    
    let targetEndDate: string | null = null;
    let targetDurationDays: number | null = null;

    if (isTodayOrYesterday) {
      // Action A: Create an active period for today/yesterday.
      targetEndDate = null;
      targetDurationDays = null;
      
      const activeCycle = allCycles.find(c => c.endDate === null);
      if (activeCycle) {
        if (activeCycle.startDate === startDate) {
          throw new Error('A cycle is already active and started on this date.');
        }
        
        if (activeCycle.startDate < startDate) {
          const newEndDate = addDays(startDate, -1);
          const durationDays = daysBetween(activeCycle.startDate, newEndDate) + 1;
          await this.cycleRepository.update(activeCycle.id, {
            endDate: newEndDate,
            durationDays: durationDays,
          });
        }
      }
    } else {
      // Action B: Create a bounded historical period using the user's default duration.
      let calculatedEndDate = addDays(startDate, defaultDurationDays - 1);
      
      // Safety: Never create a future end date from a historical log.
      const today = todayISO();
      if (calculatedEndDate > today) {
        calculatedEndDate = today;
      }
      
      targetEndDate = calculatedEndDate;
      targetDurationDays = daysBetween(startDate, targetEndDate) + 1;

      // Cap the end date if it collides with a subsequent cycle.
      if (isHistoric) {
        const nextCycleStart = subsequentCycles[0]!.startDate;
        if (targetEndDate >= nextCycleStart) {
          targetEndDate = addDays(nextCycleStart, -1);
          targetDurationDays = daysBetween(startDate, targetEndDate) + 1;
        }
      }
    }

    // Re-fetch cycles because we might have just updated the active cycle's endDate
    const updatedCycles = await this.cycleRepository.getAll();
    const overlapRes = this.validationService.validatePeriodOverlap(startDate, targetEndDate, updatedCycles);
    if (!overlapRes.isValid) {
      throw new ValidationError(overlapRes.error || 'These dates overlap with an existing period.', 'overlap');
    }

    const newCycle: CycleEntry = {
      id: generateId(),
      startDate,
      endDate: targetEndDate,
      durationDays: targetDurationDays,
      cycleLengthDays: null,
      notes: null,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      syncStatus: 'LOCAL',
    };

    await this.cycleRepository.save(newCycle);
    await this.recalculateAllCycleLengths();

    return newCycle;
  }

  private async recalculateAllCycleLengths(): Promise<void> {
    const allCycles = await this.cycleRepository.getAll();
    allCycles.sort((a, b) => (a.startDate < b.startDate ? -1 : 1));

    for (let i = 0; i < allCycles.length; i++) {
      const current = allCycles[i];
      let cycleLengthDays: number | null = null;
      
      if (i < allCycles.length - 1) {
        const next = allCycles[i + 1];
        if (current && next) {
          cycleLengthDays = daysBetween(current.startDate, next.startDate);
        }
      }

      if (current && current.cycleLengthDays !== cycleLengthDays) {
        await this.cycleRepository.update(current.id, { cycleLengthDays });
      }
    }
  }
}


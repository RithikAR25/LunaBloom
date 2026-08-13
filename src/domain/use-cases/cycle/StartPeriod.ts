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

  public async execute(startDate: string = todayISO(), defaultDurationDays: number = 5, isExcludedFromPredictions: boolean = false): Promise<CycleEntry> {
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
    
    let targetEndDate: string | null = null;
    let targetDurationDays: number | null = null;

    let calculatedEndDate = addDays(startDate, defaultDurationDays - 1);
    const today = todayISO();

    if (isHistoric) {
      // Action B: Create a bounded historical period capped by the next cycle.
      const nextCycleStart = subsequentCycles[0]!.startDate;
      
      // We must leave at least 1 day gap to prevent the "touching" overlap error
      // from ValidationService (which expands bounds by 1 day).
      if (calculatedEndDate >= addDays(nextCycleStart, -1)) {
        calculatedEndDate = addDays(nextCycleStart, -2);
      }
      
      // Safety: Never create a future end date from a historical log.
      if (calculatedEndDate > today) {
        calculatedEndDate = today;
      }
      
      targetEndDate = calculatedEndDate;
      targetDurationDays = daysBetween(startDate, targetEndDate) + 1;
    } else {
      // Action A: Create an active period OR a naturally concluded historical period.
      if (calculatedEndDate >= today) {
        // The period's natural window still includes today (or the future).
        // It is an ACTIVE period.
        const activeCycle = allCycles.find(c => c.endDate === null);
        if (activeCycle) {
          throw new Error("You're already tracking a period.\nEnd it before starting a new one.");
        }
        
        targetEndDate = null;
        targetDurationDays = null;
      } else {
        // The period naturally concluded before today.
        targetEndDate = calculatedEndDate;
        targetDurationDays = daysBetween(startDate, targetEndDate) + 1;
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
      isExcludedFromPredictions,
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


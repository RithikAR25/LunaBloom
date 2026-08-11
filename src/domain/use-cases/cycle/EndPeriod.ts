import type { ICycleRepository } from '../../repositories/ICycleRepository';
import type { CycleEntry } from '../../models/Cycle';
import { daysBetween, isBefore, todayISO } from '../../../utils/dateUtils';
import type { ValidationService } from '../../services/ValidationService';
import { ValidationError } from '../../errors';

export class EndPeriod {
  constructor(
    private cycleRepository: ICycleRepository,
    private validationService: ValidationService
  ) {}

  public async execute(endDate: string = todayISO(), isExcludedFromPredictions?: boolean): Promise<void> {
    /**
     * Business Rule:
     * Cycle events cannot occur in the future.
     * This invariant is enforced regardless of caller.
     */
    const dateRes = this.validationService.validateHistoricalDate(endDate);
    if (!dateRes.isValid) {
      throw new ValidationError(dateRes.error || 'Date cannot be in the future', 'endDate');
    }

    const activeCycle = (await this.cycleRepository.getAll()).find(c => c.endDate === null);
    
    if (!activeCycle) {
      throw new Error("There's no active period to end.");
    }

    if (isBefore(endDate, activeCycle.startDate)) {
      throw new Error('End date cannot be before start date.');
    }

    const allCycles = await this.cycleRepository.getAll();
    const overlapRes = this.validationService.validatePeriodOverlap(activeCycle.startDate, endDate, allCycles, activeCycle.id);
    if (!overlapRes.isValid) {
      throw new ValidationError(overlapRes.error!, 'overlapping_periods');
    }

    // Days of bleeding (inclusive): if start is 1st and end is 5th -> 5 days
    const durationDays = daysBetween(activeCycle.startDate, endDate) + 1;

    const updatePayload: Partial<CycleEntry> = {
      endDate,
      durationDays,
    };

    if (isExcludedFromPredictions !== undefined) {
      updatePayload.isExcludedFromPredictions = isExcludedFromPredictions;
    }

    await this.cycleRepository.update(activeCycle.id, updatePayload);
  }
}

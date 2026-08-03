import type { ICycleRepository } from '../../repositories/ICycleRepository';
import type { CycleEntry } from '../../models/Cycle';
import { daysBetween, isBefore } from '../../../utils/dateUtils';
import type { ValidationService } from '../../services/ValidationService';
import { ValidationError } from '../../errors';

export class EditCycleEntry {
  constructor(
    private cycleRepository: ICycleRepository,
    private validationService: ValidationService
  ) {}

  public async execute(
    id: string,
    startDate: string,
    endDate: string | null,
    notes: string | null = null,
    isExcludedFromPredictions?: boolean
  ): Promise<void> {
    const existing = await this.cycleRepository.getById(id);
    if (!existing) throw new Error(`Cycle entry ${id} not found.`);

    if (endDate !== null && isBefore(endDate, startDate)) {
      throw new ValidationError('End date cannot be before start date.', 'endDate');
    }

    /**
     * Business Rule:
     * Cycle events cannot occur in the future.
     * This invariant is enforced regardless of caller.
     */
    const startRes = this.validationService.validateHistoricalDate(startDate);
    if (!startRes.isValid) {
      throw new ValidationError(startRes.error || 'Date cannot be in the future', 'startDate');
    }

    if (endDate !== null) {
      const endRes = this.validationService.validateHistoricalDate(endDate);
      if (!endRes.isValid) {
        throw new ValidationError(endRes.error || 'Date cannot be in the future', 'endDate');
      }
    }

    const allCycles = await this.cycleRepository.getAll();
    const overlapRes = this.validationService.validatePeriodOverlap(startDate, endDate, allCycles, id);
    if (!overlapRes.isValid) {
      throw new ValidationError(overlapRes.error || 'These dates overlap with an existing period.', 'overlap');
    }

    const durationDays = endDate ? daysBetween(startDate, endDate) + 1 : null;

    const dataToUpdate: Partial<CycleEntry> = {
      startDate,
      endDate,
      durationDays,
      notes,
    };
    
    if (isExcludedFromPredictions !== undefined) {
      dataToUpdate.isExcludedFromPredictions = isExcludedFromPredictions;
    }

    await this.cycleRepository.update(id, dataToUpdate);

    // Recalculate cycle lengths for all cycles to ensure consistency
    await this.recalculateAllCycleLengths();
  }

  private async recalculateAllCycleLengths(): Promise<void> {
    const allCycles = await this.cycleRepository.getAll();
    // Sort oldest to newest
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

import type { ICycleRepository } from '../../repositories/ICycleRepository';
import { daysBetween, isBefore } from '../../../utils/dateUtils';
import type { ValidationService } from '../../services/ValidationService';

export class EditCycleEntry {
  constructor(
    private cycleRepository: ICycleRepository,
    private validationService: ValidationService
  ) {}

  public async execute(
    id: string,
    startDate: string,
    endDate: string | null,
    notes: string | null = null
  ): Promise<void> {
    const existing = await this.cycleRepository.getById(id);
    if (!existing) throw new Error(`Cycle entry ${id} not found.`);

    if (endDate !== null && isBefore(endDate, startDate)) {
      throw new Error('End date cannot be before start date.');
    }

    const allCycles = await this.cycleRepository.getAll();
    if (this.validationService.hasOverlap(startDate, endDate, allCycles, id)) {
      throw new Error('These dates overlap with an existing period.');
    }

    const durationDays = endDate ? daysBetween(startDate, endDate) + 1 : null;

    await this.cycleRepository.update(id, {
      startDate,
      endDate,
      durationDays,
      notes,
    });

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
      
      if (i > 0) {
        const previous = allCycles[i - 1];
        if (current && previous) {
          cycleLengthDays = daysBetween(previous.startDate, current.startDate);
        }
      }

      if (current && current.cycleLengthDays !== cycleLengthDays) {
        await this.cycleRepository.update(current.id, { cycleLengthDays });
      }
    }
  }
}

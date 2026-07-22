import type { ICycleRepository } from '../../repositories/ICycleRepository';
import { daysBetween, isBefore, todayISO } from '../../../utils/dateUtils';
import type { ValidationService } from '../../services/ValidationService';

export class EndPeriod {
  constructor(
    private cycleRepository: ICycleRepository,
    private validationService: ValidationService
  ) {}

  public async execute(endDate: string = todayISO()): Promise<void> {
    const activeCycle = (await this.cycleRepository.getAll()).find(c => c.endDate === null);
    
    if (!activeCycle) {
      throw new Error('No active period to end.');
    }

    if (isBefore(endDate, activeCycle.startDate)) {
      throw new Error('End date cannot be before start date.');
    }

    const allCycles = await this.cycleRepository.getAll();
    if (this.validationService.hasOverlap(activeCycle.startDate, endDate, allCycles, activeCycle.id)) {
      throw new Error('This period overlaps with an existing logged period.');
    }

    // Days of bleeding (inclusive): if start is 1st and end is 5th -> 5 days
    const durationDays = daysBetween(activeCycle.startDate, endDate) + 1;

    await this.cycleRepository.update(activeCycle.id, {
      endDate,
      durationDays,
    });
  }
}

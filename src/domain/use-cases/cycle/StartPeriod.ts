import type { ICycleRepository } from '../../repositories/ICycleRepository';
import type { CycleEntry } from '../../models/Cycle';
import { generateId, nowISO, todayISO, daysBetween } from '../../../utils/dateUtils';
import type { ValidationService } from '../../services/ValidationService';

export class StartPeriod {
  constructor(
    private cycleRepository: ICycleRepository,
    private validationService: ValidationService
  ) {}

  public async execute(startDate: string = todayISO()): Promise<CycleEntry> {
    const activeCycle = (await this.cycleRepository.getAll()).find(c => c.endDate === null);
    
    const now = nowISO();

    // If there is an active cycle, end it before starting the new one
    if (activeCycle) {
      if (activeCycle.startDate === startDate) {
        throw new Error('A cycle is already active and started on this date.');
      }
      
      const durationDays = daysBetween(activeCycle.startDate, startDate);
      
      await this.cycleRepository.update(activeCycle.id, {
        endDate: startDate,
        cycleLengthDays: durationDays,
      });
    }

    const newCycle: CycleEntry = {
      id: generateId(),
      startDate,
      endDate: null,
      durationDays: null,
      cycleLengthDays: null,
      notes: null,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      syncStatus: 'LOCAL',
    };

    const allCycles = await this.cycleRepository.getAll();
    if (this.validationService.hasOverlap(startDate, null, allCycles)) {
      throw new Error('This period overlaps with an existing logged period.');
    }

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


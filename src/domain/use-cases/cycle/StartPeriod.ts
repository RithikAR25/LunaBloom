import type { ICycleRepository } from '../../repositories/ICycleRepository';
import type { CycleEntry } from '../../models/Cycle';
import { generateId, nowISO, todayISO, daysBetween, addDays } from '../../../utils/dateUtils';
import type { ValidationService } from '../../services/ValidationService';

export class StartPeriod {
  constructor(
    private cycleRepository: ICycleRepository,
    private validationService: ValidationService
  ) {}

  public async execute(startDate: string = todayISO()): Promise<CycleEntry> {
    const allCycles = await this.cycleRepository.getAll();
    const now = nowISO();

    const sortedCycles = [...allCycles].sort((a,b) => a.startDate.localeCompare(b.startDate));
    const subsequentCycles = sortedCycles.filter(c => c.startDate > startDate);
    const isHistoric = subsequentCycles.length > 0;
    
    let targetEndDate: string | null = null;
    let targetDurationDays: number | null = null;

    if (isHistoric) {
      const nextCycleStart = subsequentCycles[0]!.startDate;
      const defaultEnd = addDays(startDate, 4); 
      
      if (defaultEnd < nextCycleStart) {
        targetEndDate = defaultEnd;
      } else {
        targetEndDate = addDays(nextCycleStart, -1);
      }
      targetDurationDays = daysBetween(startDate, targetEndDate) + 1;
    } else {
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
    }

    if (this.validationService.hasOverlap(startDate, targetEndDate, allCycles)) {
      throw new Error('This period overlaps with an existing logged period.');
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


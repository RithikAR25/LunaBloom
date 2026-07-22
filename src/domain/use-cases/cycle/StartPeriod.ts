import type { ICycleRepository } from '../../repositories/ICycleRepository';
import type { CycleEntry } from '../../models/Cycle';
import { generateId, nowISO, todayISO, daysBetween } from '../../../utils/dateUtils';

export class StartPeriod {
  constructor(private cycleRepository: ICycleRepository) {}

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

    await this.cycleRepository.save(newCycle);

    return newCycle;
  }
}

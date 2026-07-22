import type { ICycleRepository } from '../../repositories/ICycleRepository';
import { daysBetween } from '../../../utils/dateUtils';

export class DeleteCycleEntry {
  constructor(private cycleRepository: ICycleRepository) {}

  public async execute(id: string): Promise<void> {
    const existing = await this.cycleRepository.getById(id);
    if (!existing) {
      throw new Error(`Cycle entry ${id} not found.`);
    }

    await this.cycleRepository.softDelete(id);
    
    // Recalculate cycle lengths for remaining cycles
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

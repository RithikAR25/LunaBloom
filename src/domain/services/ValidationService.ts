import type { CycleEntry } from '../models/Cycle';


export class ValidationService {
  /**
   * Checks if a new or updated cycle entry overlaps with any existing entries.
   * Excludes the entry itself (via excludeId) when checking an update.
   */
  public hasOverlap(
    targetStartDate: string,
    targetEndDate: string | null,
    existingCycles: CycleEntry[],
    excludeId?: string
  ): boolean {
    const cyclesToCheck = existingCycles.filter((c) => c.id !== excludeId);

    for (const cycle of cyclesToCheck) {
      const existingStart = cycle.startDate;
      const existingEnd = cycle.endDate; // null means ongoing

      // Logic:
      // If target is ongoing (targetEndDate === null), it overlaps if targetStartDate <= existingEnd.
      // If existing is ongoing (existingEnd === null), it overlaps if targetEndDate >= existingStart.
      // If both have ends, it overlaps if max(starts) <= min(ends).

      if (targetEndDate === null && existingEnd === null) {
        // Both ongoing -> definite overlap (can't have two ongoing periods)
        return true;
      }

      if (targetEndDate === null && existingEnd !== null) {
        if (targetStartDate <= existingEnd) {
          return true;
        }
      }

      if (existingEnd === null && targetEndDate !== null) {
        if (targetEndDate >= existingStart) {
          return true;
        }
      }

      if (targetEndDate !== null && existingEnd !== null) {
        if (targetStartDate <= existingEnd && targetEndDate >= existingStart) {
          return true;
        }
      }
    }

    return false;
  }
}

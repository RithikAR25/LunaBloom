import type { CycleEntry } from '../models/Cycle';

/**
 * Repository interface for cycle entries.
 * The domain layer depends on this interface — never on a concrete implementation.
 * V1: SQLiteCycleRepository | V2: FirebaseCycleRepository
 */
export interface ICycleRepository {
  save(cycle: CycleEntry): Promise<void>;
  getAll(): Promise<CycleEntry[]>;
  getById(id: string): Promise<CycleEntry | null>;
  /** Returns the N most recent non-deleted cycles, ordered newest first */
  getLastN(n: number): Promise<CycleEntry[]>;
  update(id: string, data: Partial<CycleEntry>): Promise<void>;
  /** Soft delete: sets deletedAt. Never calls DELETE. */
  softDelete(id: string): Promise<void>;
  /** 
   * Atomically merges multiple cycles into one. 
   * Updates retained cycle, migrates daily logs, soft deletes absorbed cycles, and recalculates cycle lengths.
   */
  mergeCycles(retainedCycleId: string, absorbedCycleIds: string[], mergedData: Partial<CycleEntry>): Promise<void>;
}

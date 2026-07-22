import type { DailyLog } from '../models/DailyLog';

export interface IDailyLogRepository {
  save(log: DailyLog): Promise<void>;
  getByDate(date: string): Promise<DailyLog | null>;
  getById(id: string): Promise<DailyLog | null>;
  /** Returns logs between fromDate and toDate (inclusive), ordered newest first */
  getRange(fromDate: string, toDate: string): Promise<DailyLog[]>;
  /** Returns logs associated with a specific cycle */
  getByCycleId(cycleEntryId: string): Promise<DailyLog[]>;
  update(id: string, data: Partial<DailyLog>): Promise<void>;
  softDelete(id: string): Promise<void>;
}

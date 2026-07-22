import type { HealthNote } from '../models/HealthNote';
import type { HealthNoteType } from '../models/index';

export interface IHealthNoteRepository {
  save(note: HealthNote): Promise<void>;
  getById(id: string): Promise<HealthNote | null>;
  getRange(fromDate: string, toDate: string): Promise<HealthNote[]>;
  getByType(type: HealthNoteType): Promise<HealthNote[]>;
  update(id: string, data: Partial<HealthNote>): Promise<void>;
  softDelete(id: string): Promise<void>;
}

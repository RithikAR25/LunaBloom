import type { SyncStatus } from './index';

export interface IntercourseLog {
  id: string;
  /** ISO 8601 date */
  date: string;
  protected: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  syncStatus: SyncStatus;
}

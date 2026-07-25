import type { FlowIntensity, SyncStatus } from './index';

export const MIN_NORMAL_CYCLE_LENGTH_DAYS = 15;

/** Represents a single menstrual period entry. */
export interface CycleEntry {
  /** UUID v4 — generated client-side */
  id: string;
  /** ISO 8601 date: '2026-07-01' */
  startDate: string;
  /** ISO 8601 date — null if period is still active */
  endDate: string | null;
  /** Days of bleeding — calculated when endDate is set */
  durationDays: number | null;
  /** Days between this startDate and the previous cycle's startDate */
  cycleLengthDays: number | null;
  notes: string | null;
  isExcludedFromPredictions?: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  syncStatus: SyncStatus;
}

/** Daily flow entry within a cycle (stored in daily_logs, not cycles table) */
export interface DailyFlowEntry {
  date: string;
  flowIntensity: FlowIntensity;
}

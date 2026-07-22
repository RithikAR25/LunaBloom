import type { FlowIntensity, SyncStatus } from './index';

/** The user's health log for a single calendar day. One log per day maximum. */
export interface DailyLog {
  id: string;
  /** ISO 8601 date — UNIQUE per user */
  date: string;
  /** Foreign key to cycles.id — null if log is outside any active period */
  cycleEntryId: string | null;
  /** Which day of the current cycle this is (1-indexed) */
  cycleDay: number | null;
  /** Flow intensity — only set during a period */
  flowIntensity: FlowIntensity | null;
  /** Logged symptom IDs (predefined strings or custom UUIDs) */
  symptoms: string[];
  /** Logged mood IDs */
  moods: string[];
  /** 1–10 pain scale */
  painLevel: number | null;
  /** 1–5 energy scale */
  energyLevel: number | null;
  /** 1–5 sleep quality scale */
  sleepQuality: number | null;
  sleepHours: number | null;
  waterIntakeLiters: number | null;
  exerciseMinutes: number | null;
  exerciseType: string | null;
  /** 1–3 libido scale */
  libidoLevel: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  syncStatus: SyncStatus;
}

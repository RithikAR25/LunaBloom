import type {
  BirthControlType,
  MedicalCondition,
  SyncStatus,
  TrackingMode,
} from './index';
import { UserGoal } from './index';

export type ThemePreference = 'SYSTEM' | 'LIGHT' | 'DARK';

/** The user's personal profile and app preferences. Single row in V1. */
export interface UserProfile {
  id: string;
  preferredName: string | null;
  /** ISO 8601 date: '1998-05-14' */
  dateOfBirth: string | null;
  /** Centimetres */
  heightCm: number | null;
  /** Kilograms */
  weightKg: number | null;
  avgCycleLength: number;
  avgPeriodDuration: number;
  primaryGoal: UserGoal;
  conditions: MedicalCondition[];
  birthControlType: BirthControlType;
  trackingMode: TrackingMode;
  themePreference: ThemePreference;
  learnModeEnabled: boolean;
  cycleRemindersEnabled: boolean;
  intimacyReminderEnabled: boolean;
  intimacyReminderTime: string; // HH:mm
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  syncStatus: SyncStatus;
}

/** Sensible defaults for a new user profile. */
export const DEFAULT_PROFILE: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'> = {
  preferredName: null,
  dateOfBirth: null,
  heightCm: null,
  weightKg: null,
  avgCycleLength: 28,
  avgPeriodDuration: 5,
  primaryGoal: UserGoal.TrackCycle,
  conditions: [],
  birthControlType: 'NONE',
  trackingMode: 'CYCLE',
  themePreference: 'SYSTEM',
  learnModeEnabled: true,
  cycleRemindersEnabled: false,
  intimacyReminderEnabled: false,
  intimacyReminderTime: '21:00',
  onboardingCompleted: false,
  deletedAt: null,
  syncStatus: 'LOCAL',
};

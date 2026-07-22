import type {
  BirthControlType,
  MedicalCondition,
  PrimaryGoal,
  SyncStatus,
  TrackingMode,
} from './index';

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
  primaryGoal: PrimaryGoal;
  conditions: MedicalCondition[];
  birthControlType: BirthControlType;
  trackingMode: TrackingMode;
  learnModeEnabled: boolean;
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
  primaryGoal: 'TRACK_CYCLE',
  conditions: [],
  birthControlType: 'NONE',
  trackingMode: 'CYCLE',
  learnModeEnabled: true,
  onboardingCompleted: false,
  deletedAt: null,
  syncStatus: 'LOCAL',
};

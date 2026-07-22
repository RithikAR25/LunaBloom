// Domain Models — re-exported from this barrel file
export type { CycleEntry } from './Cycle';
export type { DailyLog } from './DailyLog';
export type { UserProfile } from './UserProfile';
export type { HealthNote } from './HealthNote';
export type { CustomSymptom } from './CustomSymptom';
export type { IntercourseLog } from './IntercourseLog';

// Shared enums / types
export type FlowIntensity = 'SPOTTING' | 'LIGHT' | 'MEDIUM' | 'HEAVY' | 'VERY_HEAVY';
export type SyncStatus = 'LOCAL' | 'SYNCED' | 'PENDING_SYNC' | 'CONFLICT';
export type MedicalCondition = 'PCOS' | 'ENDOMETRIOSIS' | 'IRREGULAR_CYCLES' | 'THYROID' | 'OTHER';
export type BirthControlType =
  | 'PILL'
  | 'HORMONAL_IUD'
  | 'COPPER_IUD'
  | 'IMPLANT'
  | 'INJECTION'
  | 'PATCH'
  | 'RING'
  | 'BARRIER'
  | 'NATURAL'
  | 'NONE';
export type TrackingMode = 'CYCLE' | 'PREGNANT' | 'POSTPARTUM' | 'PERIMENOPAUSE';
export type PrimaryGoal = 'TRACK_CYCLE' | 'UNDERSTAND_HEALTH' | 'TRY_TO_CONCEIVE' | 'LEARN';
export type CyclePhase = 'MENSTRUAL' | 'FOLLICULAR' | 'OVULATORY' | 'LUTEAL' | 'UNKNOWN';
export type HealthNoteType =
  | 'MEDICATION'
  | 'SUPPLEMENT'
  | 'APPOINTMENT'
  | 'TEST'
  | 'BIRTH_CONTROL'
  | 'PREGNANCY_TEST'
  | 'OVULATION_TEST'
  | 'JOURNAL'
  | 'OTHER';
export type NotificationType =
  | 'PERIOD_APPROACHING'
  | 'OVULATION'
  | 'FERTILE_WINDOW'
  | 'DAILY_CHECKIN'
  | 'PERIOD_END'
  | 'MEDICATION'
  | 'WEEKLY_SUMMARY'
  | 'MONTHLY_SUMMARY';
export type SymptomCategory = 'PHYSICAL' | 'EMOTIONAL' | 'OTHER';

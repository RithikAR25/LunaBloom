import type { HealthNoteType, SyncStatus } from './index';

/** Structured data varies by note type */
export interface HealthNoteStructuredData {
  /** For MEDICATION / SUPPLEMENT */
  dosage?: string;
  /** For PREGNANCY_TEST / OVULATION_TEST */
  result?: 'POSITIVE' | 'NEGATIVE' | 'INVALID' | 'PEAK';
  /** For APPOINTMENT */
  appointmentWith?: string;
  reminderDate?: string;
}

export interface HealthNote {
  id: string;
  /** ISO 8601 date */
  date: string;
  type: HealthNoteType;
  title: string | null;
  content: string;
  structuredData: HealthNoteStructuredData | null;
  /** Reserved for V2 */
  attachments: string[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  syncStatus: SyncStatus;
}

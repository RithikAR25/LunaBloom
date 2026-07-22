import type { SymptomCategory, SyncStatus } from './index';

export interface CustomSymptom {
  id: string;
  name: string;
  category: SymptomCategory;
  /** Ionicons icon name */
  icon: string | null;
  /** Hex color string */
  color: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  syncStatus: SyncStatus;
}

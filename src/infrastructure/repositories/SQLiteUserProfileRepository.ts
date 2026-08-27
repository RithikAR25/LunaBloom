/**
 * SQLiteUserProfileRepository — SQLite implementation of IUserProfileRepository.
 * Single-row table. Always upserts, never inserts a second row.
 */
import { getDatabase } from '../database/database';
import type { IUserProfileRepository } from '../../domain/repositories/IUserProfileRepository';
import type { UserProfile } from '../../domain/models/UserProfile';
import { RepositoryError } from '../../domain/errors';
import { nowISO } from '../../utils/dateUtils';

type ProfileRow = {
  id: string;
  preferred_name: string | null;
  date_of_birth: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  avg_cycle_length: number;
  avg_period_duration: number;
  primary_goal: string;
  conditions: string;
  birth_control_type: string;
  tracking_mode: string;
  theme_preference: string;
  learn_mode_enabled: number;
  cycle_reminders_enabled: number;
  intimacy_reminder_enabled: number;
  intimacy_reminder_time: string;
  onboarding_completed: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  sync_status: string;
};

function rowToModel(row: ProfileRow): UserProfile {
  return {
    id: row.id,
    preferredName: row.preferred_name,
    dateOfBirth: row.date_of_birth,
    heightCm: row.height_cm,
    weightKg: row.weight_kg,
    avgCycleLength: row.avg_cycle_length,
    avgPeriodDuration: row.avg_period_duration,
    primaryGoal: row.primary_goal as UserProfile['primaryGoal'],
    conditions: JSON.parse(row.conditions) as UserProfile['conditions'],
    birthControlType: row.birth_control_type as UserProfile['birthControlType'],
    trackingMode: row.tracking_mode as UserProfile['trackingMode'],
    themePreference: row.theme_preference as UserProfile['themePreference'],
    learnModeEnabled: row.learn_mode_enabled === 1,
    cycleRemindersEnabled: row.cycle_reminders_enabled === 1,
    intimacyReminderEnabled: row.intimacy_reminder_enabled === 1,
    intimacyReminderTime: row.intimacy_reminder_time,
    onboardingCompleted: row.onboarding_completed === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
    syncStatus: row.sync_status as UserProfile['syncStatus'],
  };
}

export class SQLiteUserProfileRepository implements IUserProfileRepository {
  async get(): Promise<UserProfile | null> {
    try {
      const db = getDatabase();
      const row = await db.getFirstAsync<ProfileRow>(
        'SELECT * FROM user_profiles WHERE deleted_at IS NULL LIMIT 1'
      );
      return row ? rowToModel(row) : null;
    } catch (err) {
      throw new RepositoryError('Failed to fetch user profile', err);
    }
  }

  async save(profile: UserProfile): Promise<void> {
    try {
      const db = getDatabase();
      await db.runAsync(
        `INSERT INTO user_profiles
          (id, preferred_name, date_of_birth, height_cm, weight_kg,
           avg_cycle_length, avg_period_duration, primary_goal, conditions,
           birth_control_type, tracking_mode, theme_preference, learn_mode_enabled,
           cycle_reminders_enabled, intimacy_reminder_enabled, intimacy_reminder_time,
           onboarding_completed, created_at, updated_at, deleted_at, sync_status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          profile.id,
          profile.preferredName,
          profile.dateOfBirth,
          profile.heightCm,
          profile.weightKg,
          profile.avgCycleLength,
          profile.avgPeriodDuration,
          profile.primaryGoal,
          JSON.stringify(profile.conditions),
          profile.birthControlType,
          profile.trackingMode,
          profile.themePreference,
          profile.learnModeEnabled ? 1 : 0,
          profile.cycleRemindersEnabled ? 1 : 0,
          profile.intimacyReminderEnabled ? 1 : 0,
          profile.intimacyReminderTime,
          profile.onboardingCompleted ? 1 : 0,
          profile.createdAt,
          profile.updatedAt,
          profile.deletedAt,
          profile.syncStatus,
        ]
      );
    } catch (err) {
      throw new RepositoryError('Failed to save user profile', err);
    }
  }

  async update(data: Partial<UserProfile>): Promise<void> {
    try {
      const db = getDatabase();
      const existing = await this.get();
      if (!existing) throw new RepositoryError('No profile exists to update');

      await db.runAsync(
        `UPDATE user_profiles SET
          preferred_name = ?,
          date_of_birth = ?,
          height_cm = ?,
          weight_kg = ?,
          avg_cycle_length = ?,
          avg_period_duration = ?,
          primary_goal = ?,
          conditions = ?,
          birth_control_type = ?,
          tracking_mode = ?,
          theme_preference = ?,
          learn_mode_enabled = ?,
          cycle_reminders_enabled = ?,
          intimacy_reminder_enabled = ?,
          intimacy_reminder_time = ?,
          onboarding_completed = ?,
          updated_at = ?,
          sync_status = ?
         WHERE id = ?`,
        [
          data.preferredName ?? existing.preferredName,
          data.dateOfBirth ?? existing.dateOfBirth,
          data.heightCm ?? existing.heightCm,
          data.weightKg ?? existing.weightKg,
          data.avgCycleLength ?? existing.avgCycleLength,
          data.avgPeriodDuration ?? existing.avgPeriodDuration,
          data.primaryGoal ?? existing.primaryGoal,
          JSON.stringify(data.conditions ?? existing.conditions),
          data.birthControlType ?? existing.birthControlType,
          data.trackingMode ?? existing.trackingMode,
          data.themePreference ?? existing.themePreference,
          (data.learnModeEnabled ?? existing.learnModeEnabled) ? 1 : 0,
          (data.cycleRemindersEnabled ?? existing.cycleRemindersEnabled) ? 1 : 0,
          (data.intimacyReminderEnabled ?? existing.intimacyReminderEnabled) ? 1 : 0,
          data.intimacyReminderTime ?? existing.intimacyReminderTime,
          (data.onboardingCompleted ?? existing.onboardingCompleted) ? 1 : 0,
          nowISO(),
          'LOCAL',
          existing.id,
        ]
      );
    } catch (err) {
      if (err instanceof RepositoryError) throw err;
      throw new RepositoryError('Failed to update user profile', err);
    }
  }
}

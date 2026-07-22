/**
 * SQLiteDailyLogRepository — SQLite implementation of IDailyLogRepository.
 *
 * Rules:
 * - Soft deletes only
 * - JSON arrays (symptoms, moods) serialized to/from strings
 * - Dates as ISO 8601 strings
 */
import { getDatabase } from '../database/database';
import type { IDailyLogRepository } from '../../domain/repositories/IDailyLogRepository';
import type { DailyLog } from '../../domain/models/DailyLog';
import { RepositoryError, NotFoundError } from '../../domain/errors';
import { nowISO } from '../../utils/dateUtils';
import type { FlowIntensity, SyncStatus } from '../../domain/models';

type DailyLogRow = {
  id: string;
  date: string;
  cycle_entry_id: string | null;
  cycle_day: number | null;
  flow_intensity: string | null;
  symptoms: string;
  moods: string;
  pain_level: number | null;
  energy_level: number | null;
  sleep_quality: number | null;
  sleep_hours: number | null;
  water_intake_liters: number | null;
  exercise_minutes: number | null;
  exercise_type: string | null;
  libido_level: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  sync_status: string;
};

function rowToModel(row: DailyLogRow): DailyLog {
  return {
    id: row.id,
    date: row.date,
    cycleEntryId: row.cycle_entry_id,
    cycleDay: row.cycle_day,
    flowIntensity: row.flow_intensity as FlowIntensity | null,
    symptoms: JSON.parse(row.symptoms) as string[],
    moods: JSON.parse(row.moods) as string[],
    painLevel: row.pain_level,
    energyLevel: row.energy_level,
    sleepQuality: row.sleep_quality,
    sleepHours: row.sleep_hours,
    waterIntakeLiters: row.water_intake_liters,
    exerciseMinutes: row.exercise_minutes,
    exerciseType: row.exercise_type,
    libidoLevel: row.libido_level,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
    syncStatus: row.sync_status as SyncStatus,
  };
}

export class SQLiteDailyLogRepository implements IDailyLogRepository {
  async save(log: DailyLog): Promise<void> {
    try {
      const db = getDatabase();
      await db.runAsync(
        `INSERT INTO daily_logs
          (id, date, cycle_entry_id, cycle_day, flow_intensity, symptoms, moods,
           pain_level, energy_level, sleep_quality, sleep_hours, water_intake_liters,
           exercise_minutes, exercise_type, libido_level, notes,
           created_at, updated_at, deleted_at, sync_status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          log.id,
          log.date,
          log.cycleEntryId,
          log.cycleDay,
          log.flowIntensity,
          JSON.stringify(log.symptoms),
          JSON.stringify(log.moods),
          log.painLevel,
          log.energyLevel,
          log.sleepQuality,
          log.sleepHours,
          log.waterIntakeLiters,
          log.exerciseMinutes,
          log.exerciseType,
          log.libidoLevel,
          log.notes,
          log.createdAt,
          log.updatedAt,
          log.deletedAt,
          log.syncStatus,
        ]
      );
    } catch (err) {
      throw new RepositoryError('Failed to save daily log', err);
    }
  }

  async getAll(): Promise<DailyLog[]> {
    try {
      const db = getDatabase();
      const rows = await db.getAllAsync<DailyLogRow>(
        'SELECT * FROM daily_logs WHERE deleted_at IS NULL ORDER BY date DESC'
      );
      return rows.map(rowToModel);
    } catch (err) {
      throw new RepositoryError('Failed to fetch all daily logs', err);
    }
  }

  async getByDate(date: string): Promise<DailyLog | null> {
    try {
      const db = getDatabase();
      const row = await db.getFirstAsync<DailyLogRow>(
        'SELECT * FROM daily_logs WHERE date = ? AND deleted_at IS NULL',
        [date]
      );
      return row ? rowToModel(row) : null;
    } catch (err) {
      throw new RepositoryError(`Failed to fetch daily log for date ${date}`, err);
    }
  }

  async getById(id: string): Promise<DailyLog | null> {
    try {
      const db = getDatabase();
      const row = await db.getFirstAsync<DailyLogRow>(
        'SELECT * FROM daily_logs WHERE id = ? AND deleted_at IS NULL',
        [id]
      );
      return row ? rowToModel(row) : null;
    } catch (err) {
      throw new RepositoryError(`Failed to fetch daily log ${id}`, err);
    }
  }

  async getRange(fromDate: string, toDate: string): Promise<DailyLog[]> {
    try {
      const db = getDatabase();
      const rows = await db.getAllAsync<DailyLogRow>(
        'SELECT * FROM daily_logs WHERE date >= ? AND date <= ? AND deleted_at IS NULL ORDER BY date DESC',
        [fromDate, toDate]
      );
      return rows.map(rowToModel);
    } catch (err) {
      throw new RepositoryError(`Failed to fetch daily logs between ${fromDate} and ${toDate}`, err);
    }
  }

  async getByCycleId(cycleEntryId: string): Promise<DailyLog[]> {
    try {
      const db = getDatabase();
      const rows = await db.getAllAsync<DailyLogRow>(
        'SELECT * FROM daily_logs WHERE cycle_entry_id = ? AND deleted_at IS NULL ORDER BY date DESC',
        [cycleEntryId]
      );
      return rows.map(rowToModel);
    } catch (err) {
      throw new RepositoryError(`Failed to fetch daily logs for cycle ${cycleEntryId}`, err);
    }
  }

  async update(id: string, data: Partial<DailyLog>): Promise<void> {
    try {
      const db = getDatabase();
      const existing = await this.getById(id);
      if (!existing) throw new NotFoundError('DailyLog', id);

      await db.runAsync(
        `UPDATE daily_logs SET
          cycle_entry_id = ?,
          cycle_day = ?,
          flow_intensity = ?,
          symptoms = ?,
          moods = ?,
          pain_level = ?,
          energy_level = ?,
          sleep_quality = ?,
          sleep_hours = ?,
          water_intake_liters = ?,
          exercise_minutes = ?,
          exercise_type = ?,
          libido_level = ?,
          notes = ?,
          updated_at = ?,
          sync_status = ?
         WHERE id = ?`,
        [
          data.cycleEntryId !== undefined ? data.cycleEntryId : existing.cycleEntryId,
          data.cycleDay !== undefined ? data.cycleDay : existing.cycleDay,
          data.flowIntensity !== undefined ? data.flowIntensity : existing.flowIntensity,
          data.symptoms ? JSON.stringify(data.symptoms) : JSON.stringify(existing.symptoms),
          data.moods ? JSON.stringify(data.moods) : JSON.stringify(existing.moods),
          data.painLevel !== undefined ? data.painLevel : existing.painLevel,
          data.energyLevel !== undefined ? data.energyLevel : existing.energyLevel,
          data.sleepQuality !== undefined ? data.sleepQuality : existing.sleepQuality,
          data.sleepHours !== undefined ? data.sleepHours : existing.sleepHours,
          data.waterIntakeLiters !== undefined ? data.waterIntakeLiters : existing.waterIntakeLiters,
          data.exerciseMinutes !== undefined ? data.exerciseMinutes : existing.exerciseMinutes,
          data.exerciseType !== undefined ? data.exerciseType : existing.exerciseType,
          data.libidoLevel !== undefined ? data.libidoLevel : existing.libidoLevel,
          data.notes !== undefined ? data.notes : existing.notes,
          nowISO(),
          'LOCAL',
          id,
        ]
      );
    } catch (err) {
      if (err instanceof NotFoundError) throw err;
      throw new RepositoryError(`Failed to update daily log ${id}`, err);
    }
  }

  async softDelete(id: string): Promise<void> {
    try {
      const db = getDatabase();
      await db.runAsync(
        'UPDATE daily_logs SET deleted_at = ?, updated_at = ?, sync_status = ? WHERE id = ?',
        [nowISO(), nowISO(), 'LOCAL', id]
      );
    } catch (err) {
      throw new RepositoryError(`Failed to delete daily log ${id}`, err);
    }
  }
}

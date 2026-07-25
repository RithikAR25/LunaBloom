/**
 * SQLiteCycleRepository — SQLite implementation of ICycleRepository.
 *
 * Rules:
 * - Never uses DELETE — only soft deletes (sets deleted_at)
 * - Never exposes SQLite errors to callers — wraps in RepositoryError
 * - JSON arrays (symptoms, moods) serialized/deserialized here
 * - All dates stored as ISO 8601 strings
 */
import { getDatabase } from '../database/database';
import type { ICycleRepository } from '../../domain/repositories/ICycleRepository';
import type { CycleEntry } from '../../domain/models/Cycle';
import { RepositoryError, NotFoundError } from '../../domain/errors';
import { nowISO } from '../../utils/dateUtils';

type CycleRow = {
  id: string;
  start_date: string;
  end_date: string | null;
  duration_days: number | null;
  cycle_length_days: number | null;
  notes: string | null;
  is_excluded_from_predictions: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  sync_status: string;
};

function rowToModel(row: CycleRow): CycleEntry {
  return {
    id: row.id,
    startDate: row.start_date,
    endDate: row.end_date,
    durationDays: row.duration_days,
    cycleLengthDays: row.cycle_length_days,
    notes: row.notes,
    isExcludedFromPredictions: row.is_excluded_from_predictions === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
    syncStatus: row.sync_status as CycleEntry['syncStatus'],
  };
}

export class SQLiteCycleRepository implements ICycleRepository {
  async save(cycle: CycleEntry): Promise<void> {
    try {
      const db = getDatabase();
      await db.runAsync(
        `INSERT INTO cycles
          (id, start_date, end_date, duration_days, cycle_length_days, notes,
           is_excluded_from_predictions, created_at, updated_at, deleted_at, sync_status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          cycle.id,
          cycle.startDate,
          cycle.endDate,
          cycle.durationDays,
          cycle.cycleLengthDays,
          cycle.notes,
          cycle.isExcludedFromPredictions ? 1 : 0,
          cycle.createdAt,
          cycle.updatedAt,
          cycle.deletedAt,
          cycle.syncStatus,
        ]
      );
    } catch (err) {
      throw new RepositoryError('Failed to save cycle entry', err);
    }
  }

  async getAll(): Promise<CycleEntry[]> {
    try {
      const db = getDatabase();
      const rows = await db.getAllAsync<CycleRow>(
        'SELECT * FROM cycles WHERE deleted_at IS NULL ORDER BY start_date DESC'
      );
      return rows.map(rowToModel);
    } catch (err) {
      throw new RepositoryError('Failed to fetch cycles', err);
    }
  }

  async getById(id: string): Promise<CycleEntry | null> {
    try {
      const db = getDatabase();
      const row = await db.getFirstAsync<CycleRow>(
        'SELECT * FROM cycles WHERE id = ? AND deleted_at IS NULL',
        [id]
      );
      return row ? rowToModel(row) : null;
    } catch (err) {
      throw new RepositoryError(`Failed to fetch cycle ${id}`, err);
    }
  }

  async getLastN(n: number): Promise<CycleEntry[]> {
    try {
      const db = getDatabase();
      const rows = await db.getAllAsync<CycleRow>(
        'SELECT * FROM cycles WHERE deleted_at IS NULL ORDER BY start_date DESC LIMIT ?',
        [n]
      );
      return rows.map(rowToModel);
    } catch (err) {
      throw new RepositoryError(`Failed to fetch last ${n} cycles`, err);
    }
  }

  async update(id: string, data: Partial<CycleEntry>): Promise<void> {
    try {
      const db = getDatabase();
      const existing = await this.getById(id);
      if (!existing) throw new NotFoundError('CycleEntry', id);

      await db.runAsync(
        `UPDATE cycles SET
          start_date = ?,
          end_date = ?,
          duration_days = ?,
          cycle_length_days = ?,
          notes = ?,
          is_excluded_from_predictions = ?,
          updated_at = ?,
          sync_status = ?
         WHERE id = ?`,
        [
          data.startDate !== undefined ? data.startDate : existing.startDate,
          data.endDate !== undefined ? data.endDate : existing.endDate,
          data.durationDays !== undefined ? data.durationDays : existing.durationDays,
          data.cycleLengthDays !== undefined ? data.cycleLengthDays : existing.cycleLengthDays,
          data.notes !== undefined ? data.notes : existing.notes,
          data.isExcludedFromPredictions !== undefined ? (data.isExcludedFromPredictions ? 1 : 0) : (existing.isExcludedFromPredictions ? 1 : 0),
          nowISO(),
          'LOCAL',
          id,
        ]
      );
    } catch (err) {
      if (err instanceof NotFoundError) throw err;
      throw new RepositoryError(`Failed to update cycle ${id}`, err);
    }
  }

  async softDelete(id: string): Promise<void> {
    try {
      const db = getDatabase();
      await db.runAsync(
        'UPDATE cycles SET deleted_at = ?, updated_at = ?, sync_status = ? WHERE id = ?',
        [nowISO(), nowISO(), 'LOCAL', id]
      );
    } catch (err) {
      throw new RepositoryError(`Failed to delete cycle ${id}`, err);
    }
  }
}

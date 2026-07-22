/**
 * SQLite Database — initialization and migration manager.
 *
 * Architecture:
 * - Uses Expo SQLite (expo-sqlite)
 * - Migrations tracked via PRAGMA user_version
 * - All tables include: id, created_at, updated_at, deleted_at, sync_status
 * - Soft delete only — no hard DELETE ever (except "Delete All Data" in settings)
 *
 * ADR Reference: docs/adr/0002-use-sqlite.md
 */
import * as SQLite from 'expo-sqlite';

export const DB_NAME = 'lunabloom.db';

let _db: SQLite.SQLiteDatabase | null = null;

/**
 * Returns the singleton database instance.
 * Must call initDatabase() before using this.
 */
export function getDatabase(): SQLite.SQLiteDatabase {
  if (_db === null) {
    throw new Error(
      '[Database] getDatabase() called before initDatabase(). ' +
        'Ensure DatabaseProvider is wrapping the app.'
    );
  }
  return _db;
}

/**
 * Opens the database and runs all pending migrations.
 * Called once during app startup inside DatabaseProvider.
 */
export async function initDatabase(): Promise<void> {
  _db = await SQLite.openDatabaseAsync(DB_NAME, {
    enableChangeListener: false,
  });

  await _db.execAsync('PRAGMA journal_mode = WAL;');
  await _db.execAsync('PRAGMA foreign_keys = ON;');

  await runMigrations(_db);
}

/**
 * Closes the database. Called during "Delete All Data".
 */
export async function closeDatabase(): Promise<void> {
  if (_db !== null) {
    await _db.closeAsync();
    _db = null;
  }
}

// ---------------------------------------------------------------------------
// MIGRATIONS
// ---------------------------------------------------------------------------

type Migration = {
  version: number;
  description: string;
  up: (db: SQLite.SQLiteDatabase) => Promise<void>;
};

const MIGRATIONS: Migration[] = [
  {
    version: 1,
    description: 'Initial schema — user_profiles, cycles, daily_logs, health_notes, custom_symptoms, intercourse_logs',
    up: async (db) => {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS user_profiles (
          id TEXT PRIMARY KEY NOT NULL,
          preferred_name TEXT,
          date_of_birth TEXT,
          height_cm REAL,
          weight_kg REAL,
          avg_cycle_length INTEGER NOT NULL DEFAULT 28,
          avg_period_duration INTEGER NOT NULL DEFAULT 5,
          primary_goal TEXT NOT NULL DEFAULT 'TRACK_CYCLE',
          conditions TEXT NOT NULL DEFAULT '[]',
          birth_control_type TEXT NOT NULL DEFAULT 'NONE',
          tracking_mode TEXT NOT NULL DEFAULT 'CYCLE',
          learn_mode_enabled INTEGER NOT NULL DEFAULT 1,
          onboarding_completed INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          deleted_at TEXT,
          sync_status TEXT NOT NULL DEFAULT 'LOCAL'
        );

        CREATE TABLE IF NOT EXISTS cycles (
          id TEXT PRIMARY KEY NOT NULL,
          start_date TEXT NOT NULL,
          end_date TEXT,
          duration_days INTEGER,
          cycle_length_days INTEGER,
          notes TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          deleted_at TEXT,
          sync_status TEXT NOT NULL DEFAULT 'LOCAL'
        );

        CREATE INDEX IF NOT EXISTS idx_cycles_start_date ON cycles(start_date);
        CREATE INDEX IF NOT EXISTS idx_cycles_deleted_at ON cycles(deleted_at);

        CREATE TABLE IF NOT EXISTS daily_logs (
          id TEXT PRIMARY KEY NOT NULL,
          date TEXT NOT NULL UNIQUE,
          cycle_entry_id TEXT,
          cycle_day INTEGER,
          flow_intensity TEXT,
          symptoms TEXT NOT NULL DEFAULT '[]',
          moods TEXT NOT NULL DEFAULT '[]',
          pain_level INTEGER,
          energy_level INTEGER,
          sleep_quality INTEGER,
          sleep_hours REAL,
          water_intake_liters REAL,
          exercise_minutes INTEGER,
          exercise_type TEXT,
          libido_level INTEGER,
          notes TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          deleted_at TEXT,
          sync_status TEXT NOT NULL DEFAULT 'LOCAL',
          FOREIGN KEY (cycle_entry_id) REFERENCES cycles(id)
        );

        CREATE INDEX IF NOT EXISTS idx_daily_logs_date ON daily_logs(date);
        CREATE INDEX IF NOT EXISTS idx_daily_logs_cycle_id ON daily_logs(cycle_entry_id);

        CREATE TABLE IF NOT EXISTS health_notes (
          id TEXT PRIMARY KEY NOT NULL,
          date TEXT NOT NULL,
          type TEXT NOT NULL,
          title TEXT,
          content TEXT NOT NULL,
          structured_data TEXT,
          attachments TEXT NOT NULL DEFAULT '[]',
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          deleted_at TEXT,
          sync_status TEXT NOT NULL DEFAULT 'LOCAL'
        );

        CREATE INDEX IF NOT EXISTS idx_health_notes_date ON health_notes(date);

        CREATE TABLE IF NOT EXISTS custom_symptoms (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          category TEXT NOT NULL DEFAULT 'PHYSICAL',
          icon TEXT,
          color TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          deleted_at TEXT,
          sync_status TEXT NOT NULL DEFAULT 'LOCAL'
        );

        CREATE TABLE IF NOT EXISTS intercourse_logs (
          id TEXT PRIMARY KEY NOT NULL,
          date TEXT NOT NULL,
          protected INTEGER NOT NULL DEFAULT 1,
          notes TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          deleted_at TEXT,
          sync_status TEXT NOT NULL DEFAULT 'LOCAL'
        );

        CREATE INDEX IF NOT EXISTS idx_intercourse_logs_date ON intercourse_logs(date);
      `);
    },
  },
];

async function runMigrations(db: SQLite.SQLiteDatabase): Promise<void> {
  const result = await db.getFirstAsync<{ user_version: number }>(
    'PRAGMA user_version'
  );
  const currentVersion = result?.user_version ?? 0;

  const pending = MIGRATIONS.filter((m) => m.version > currentVersion);

  if (pending.length === 0) {
    return;
  }

  for (const migration of pending) {
    await db.withTransactionAsync(async () => {
      await migration.up(db);
      await db.execAsync(`PRAGMA user_version = ${migration.version}`);
    });
  }
}

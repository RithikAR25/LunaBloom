# LunaBloom — Database Design

**Version:** 1.0.0  
**Status:** Active  
**Date:** 2026-07-22  
**Engine:** SQLite (via Expo SQLite + SQLCipher)

---

## Table of Contents
1. [Design Principles](#1-design-principles)
2. [Entity-Relationship Diagram](#2-entity-relationship-diagram)
3. [Table Definitions](#3-table-definitions)
4. [Relationships](#4-relationships)
5. [Indexes](#5-indexes)
6. [Migration Strategy](#6-migration-strategy)
7. [Sync Fields Reference](#7-sync-fields-reference)
8. [Data Retention Policy](#8-data-retention-policy)

---

## 1. Design Principles

| Principle | Implementation |
|---|---|
| **UUID primary keys** | All `id` fields are UUID v4 strings (never integer auto-increment) |
| **Soft deletes** | Records are never hard-deleted; `deleted_at` is set instead |
| **Sync-ready** | Every table has `created_at`, `updated_at`, `deleted_at`, `sync_status` |
| **UTC timestamps** | All dates stored as ISO 8601 UTC strings (`TEXT`) |
| **Normalized** | Each entity has its own table; no JSON blobs for structured relationships |
| **Encrypted** | Entire database encrypted via SQLCipher (AES-256) |

---

## 2. Entity-Relationship Diagram

```
┌─────────────────┐          ┌──────────────────────┐
│  user_profiles  │          │  custom_symptoms      │
│─────────────────│          │──────────────────────│
│ id (PK)         │          │ id (PK)              │
│ preferred_name  │          │ name                 │
│ date_of_birth   │          │ category             │
│ height          │          │ icon                 │
│ weight          │          │ color                │
│ avg_cycle_len   │          │ [sync fields]        │
│ avg_period_dur  │          └──────────────────────┘
│ primary_goal    │
│ conditions      │                ↑ referenced by
│ birth_control   │          daily_log_symptoms (junction)
│ tracking_mode   │
│ [sync fields]   │
└────────┬────────┘
         │ 1
         │
         │ (implicit — all data belongs to the single device user in V1)
         │
         │ N
┌────────▼────────┐
│  cycles         │
│─────────────────│
│ id (PK)         │
│ start_date      │◄──────────────────────────────┐
│ end_date        │                               │
│ duration_days   │                               │
│ cycle_len_days  │                               │
│ notes           │                               │
│ [sync fields]   │                               │
└────────┬────────┘                               │
         │ 1                                      │
         │                                        │
         │ N                              foreign key (nullable)
┌────────▼──────────────┐                         │
│  daily_logs           │─────────────────────────┘
│───────────────────────│
│ id (PK)               │
│ date                  │
│ cycle_entry_id (FK)   │ nullable
│ cycle_day             │
│ flow_intensity        │
│ pain_level            │
│ energy_level          │
│ sleep_quality         │
│ sleep_hours           │
│ water_intake_liters   │
│ exercise_minutes      │
│ exercise_type         │
│ libido_level          │
│ notes                 │
│ [sync fields]         │
└──────────┬────────────┘
           │ 1
           │
           │ N (junction tables)
           │
    ┌──────┴──────────────┐
    │                     │
┌───▼──────────────┐  ┌───▼──────────────┐
│ daily_log_       │  │ daily_log_moods  │
│ symptoms         │  │──────────────────│
│──────────────────│  │ id (PK)          │
│ id (PK)          │  │ daily_log_id(FK) │
│ daily_log_id(FK) │  │ mood_id          │
│ symptom_id       │  │ [sync fields]    │
│ [sync fields]    │  └──────────────────┘
└──────────────────┘

┌─────────────────────┐       ┌──────────────────────┐
│  health_notes       │       │  intercourse_logs    │
│─────────────────────│       │──────────────────────│
│ id (PK)             │       │ id (PK)              │
│ date                │       │ date                 │
│ type                │       │ protected            │
│ title               │       │ notes                │
│ content             │       │ [sync fields]        │
│ structured_data     │       └──────────────────────┘
│ attachments         │
│ [sync fields]       │
└─────────────────────┘
```

---

## 3. Table Definitions

### 3.1 user_profiles

Stores the user's personal profile and app preferences.

```sql
CREATE TABLE IF NOT EXISTS user_profiles (
  id                    TEXT PRIMARY KEY,
  preferred_name        TEXT,
  date_of_birth         TEXT,             -- ISO 8601 date: '1998-05-14'
  height_cm             REAL,             -- Centimetres, optional
  weight_kg             REAL,             -- Kilograms, optional
  avg_cycle_length      INTEGER NOT NULL DEFAULT 28,
  avg_period_duration   INTEGER NOT NULL DEFAULT 5,
  primary_goal          TEXT NOT NULL DEFAULT 'TRACK_CYCLE',
                                          -- TRACK_CYCLE | UNDERSTAND_HEALTH |
                                          -- TRY_TO_CONCEIVE | LEARN
  conditions            TEXT NOT NULL DEFAULT '[]',
                                          -- JSON array: ['PCOS', 'ENDOMETRIOSIS']
  birth_control_type    TEXT DEFAULT 'NONE',
  tracking_mode         TEXT NOT NULL DEFAULT 'CYCLE',
                                          -- CYCLE | PREGNANT | POSTPARTUM | PERIMENOPAUSE
  learn_mode_enabled    INTEGER NOT NULL DEFAULT 1, -- 0 = false, 1 = true
  onboarding_completed  INTEGER NOT NULL DEFAULT 0,
  created_at            TEXT NOT NULL,
  updated_at            TEXT NOT NULL,
  deleted_at            TEXT,             -- NULL = not deleted
  sync_status           TEXT NOT NULL DEFAULT 'LOCAL'
                                          -- LOCAL | SYNCED | PENDING_SYNC | CONFLICT
);
```

**Notes:**
- Only one row exists in V1 (single-device, no accounts)
- `conditions` is stored as a JSON array string (SQLite has no array type)
- Boolean values use `INTEGER` (0/1) — SQLite has no native boolean

---

### 3.2 cycles

Stores each menstrual period entry.

```sql
CREATE TABLE IF NOT EXISTS cycles (
  id                TEXT PRIMARY KEY,
  start_date        TEXT NOT NULL,        -- ISO 8601 date: '2026-07-01'
  end_date          TEXT,                 -- NULL if period is still active
  duration_days     INTEGER,              -- Calculated on end_date set
  cycle_length_days INTEGER,              -- Days from this start to previous start
  notes             TEXT,
  created_at        TEXT NOT NULL,
  updated_at        TEXT NOT NULL,
  deleted_at        TEXT,
  sync_status       TEXT NOT NULL DEFAULT 'LOCAL'
);
```

**Business Rules:**
- `start_date` must not overlap with any other non-deleted cycle's date range
- `end_date` is set manually by the user — never auto-calculated
- `duration_days` is calculated when `end_date` is set: `end_date - start_date + 1`
- `cycle_length_days` is calculated when a new cycle starts: `new.start_date - previous.start_date`

---

### 3.3 daily_logs

Stores the user's health log for each calendar day.

```sql
CREATE TABLE IF NOT EXISTS daily_logs (
  id                    TEXT PRIMARY KEY,
  date                  TEXT NOT NULL UNIQUE, -- ISO 8601 date; one log per day
  cycle_entry_id        TEXT REFERENCES cycles(id),  -- NULL if outside period
  cycle_day             INTEGER,              -- Day N of the current cycle
  flow_intensity        TEXT,                 -- SPOTTING | LIGHT | MEDIUM | HEAVY | VERY_HEAVY
  pain_level            INTEGER,              -- 1-10, NULL if not logged
  energy_level          INTEGER,              -- 1-5, NULL if not logged
  sleep_quality         INTEGER,              -- 1-5, NULL if not logged
  sleep_hours           REAL,                 -- e.g. 7.5
  water_intake_liters   REAL,
  exercise_minutes      INTEGER,
  exercise_type         TEXT,
  libido_level          INTEGER,              -- 1-3, NULL if not logged
  notes                 TEXT,
  attachments           TEXT NOT NULL DEFAULT '[]', -- JSON array; reserved for V2
  created_at            TEXT NOT NULL,
  updated_at            TEXT NOT NULL,
  deleted_at            TEXT,
  sync_status           TEXT NOT NULL DEFAULT 'LOCAL'
);
```

**Notes:**
- `UNIQUE` on `date` enforces one log per calendar day
- Symptoms and moods are stored in junction tables (see below)

---

### 3.4 daily_log_symptoms

Junction table linking daily logs to symptoms (predefined or custom).

```sql
CREATE TABLE IF NOT EXISTS daily_log_symptoms (
  id            TEXT PRIMARY KEY,
  daily_log_id  TEXT NOT NULL REFERENCES daily_logs(id),
  symptom_id    TEXT NOT NULL,   -- Predefined ID (e.g. 'cramps') or custom symptom UUID
  created_at    TEXT NOT NULL,
  updated_at    TEXT NOT NULL,
  deleted_at    TEXT,
  sync_status   TEXT NOT NULL DEFAULT 'LOCAL',
  UNIQUE(daily_log_id, symptom_id)  -- No duplicate symptom per log
);
```

---

### 3.5 daily_log_moods

Junction table linking daily logs to moods.

```sql
CREATE TABLE IF NOT EXISTS daily_log_moods (
  id            TEXT PRIMARY KEY,
  daily_log_id  TEXT NOT NULL REFERENCES daily_logs(id),
  mood_id       TEXT NOT NULL,   -- Predefined mood ID (e.g. 'calm', 'anxious')
  created_at    TEXT NOT NULL,
  updated_at    TEXT NOT NULL,
  deleted_at    TEXT,
  sync_status   TEXT NOT NULL DEFAULT 'LOCAL',
  UNIQUE(daily_log_id, mood_id)
);
```

---

### 3.6 custom_symptoms

Stores user-created custom symptoms.

```sql
CREATE TABLE IF NOT EXISTS custom_symptoms (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  category    TEXT NOT NULL,   -- PHYSICAL | EMOTIONAL | OTHER
  icon        TEXT,            -- Ionicons icon name, optional
  color       TEXT,            -- Hex color, optional
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL,
  deleted_at  TEXT,
  sync_status TEXT NOT NULL DEFAULT 'LOCAL'
);
```

---

### 3.7 health_notes

Stores structured and journal health notes.

```sql
CREATE TABLE IF NOT EXISTS health_notes (
  id              TEXT PRIMARY KEY,
  date            TEXT NOT NULL,
  type            TEXT NOT NULL,
                  -- MEDICATION | SUPPLEMENT | APPOINTMENT | TEST |
                  -- BIRTH_CONTROL | PREGNANCY_TEST | OVULATION_TEST |
                  -- JOURNAL | OTHER
  title           TEXT,
  content         TEXT NOT NULL DEFAULT '',
  structured_data TEXT,         -- JSON string for type-specific fields
                                -- e.g. {"dosage": "400mg", "result": "NEGATIVE"}
  attachments     TEXT NOT NULL DEFAULT '[]', -- JSON array; reserved for V2
  created_at      TEXT NOT NULL,
  updated_at      TEXT NOT NULL,
  deleted_at      TEXT,
  sync_status     TEXT NOT NULL DEFAULT 'LOCAL'
);
```

---

### 3.8 intercourse_logs

Stores intercourse tracking data for TTC users.

```sql
CREATE TABLE IF NOT EXISTS intercourse_logs (
  id          TEXT PRIMARY KEY,
  date        TEXT NOT NULL,
  protected   INTEGER NOT NULL DEFAULT 1,  -- 0 = unprotected, 1 = protected
  notes       TEXT,
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL,
  deleted_at  TEXT,
  sync_status TEXT NOT NULL DEFAULT 'LOCAL'
);
```

---

## 4. Relationships

| Relationship | Type | Notes |
|---|---|---|
| cycles → daily_logs | One-to-Many | A cycle has many daily logs; a log may have no cycle (between cycles) |
| daily_logs → daily_log_symptoms | One-to-Many | Via junction table |
| daily_logs → daily_log_moods | One-to-Many | Via junction table |
| custom_symptoms → daily_log_symptoms | One-to-Many | Custom symptom used in many logs |
| user_profiles → (all tables) | Implicit one-to-all | V1: single user, no explicit FK needed |

---

## 5. Indexes

Performance-critical queries are optimized with indexes.

```sql
-- Cycles: ordered by date (most common query)
CREATE INDEX IF NOT EXISTS idx_cycles_start_date
  ON cycles(start_date DESC)
  WHERE deleted_at IS NULL;

-- Daily logs: lookup by date (dashboard, calendar)
CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_logs_date
  ON daily_logs(date)
  WHERE deleted_at IS NULL;

-- Daily logs: lookup by cycle (cycle analysis)
CREATE INDEX IF NOT EXISTS idx_daily_logs_cycle_entry
  ON daily_logs(cycle_entry_id)
  WHERE deleted_at IS NULL;

-- Log symptoms: lookup by log
CREATE INDEX IF NOT EXISTS idx_log_symptoms_log_id
  ON daily_log_symptoms(daily_log_id)
  WHERE deleted_at IS NULL;

-- Log moods: lookup by log
CREATE INDEX IF NOT EXISTS idx_log_moods_log_id
  ON daily_log_moods(daily_log_id)
  WHERE deleted_at IS NULL;

-- Health notes: lookup by date range
CREATE INDEX IF NOT EXISTS idx_health_notes_date
  ON health_notes(date DESC)
  WHERE deleted_at IS NULL;

-- Intercourse logs: lookup by date range
CREATE INDEX IF NOT EXISTS idx_intercourse_date
  ON intercourse_logs(date DESC)
  WHERE deleted_at IS NULL;

-- Sync: find records needing sync (V2)
CREATE INDEX IF NOT EXISTS idx_cycles_sync_status
  ON cycles(sync_status)
  WHERE sync_status = 'PENDING_SYNC';
```

---

## 6. Migration Strategy

Schema migrations use SQLite's `PRAGMA user_version` for version tracking.

### Migration Version History

| Version | Date | Changes |
|---|---|---|
| `1` | 2026-07-22 | Initial schema — all tables |
| `2` | TBD | Add `bbt_celsius` to `daily_logs` (V2 BBT tracking) |
| `3` | TBD | Add `pregnancy_mode_started_at` to `user_profiles` (V2 pregnancy mode) |

### Migration Rules

1. **Never drop a table or column** in a migration
2. **New columns must be nullable** or have a default value
3. **Deprecated columns** are prefixed with `_deprecated_` and left in place
4. **Test every migration** with realistic data volumes before release
5. **Run migrations at app startup** before any repositories are instantiated

### Migration Runner Pattern

```sql
-- Check current version
PRAGMA user_version;

-- After applying migration N:
PRAGMA user_version = N;
```

---

## 7. Sync Fields Reference

Every table includes these four fields to support V2 Firebase synchronization.

| Field | Type | Default | Description |
|---|---|---|---|
| `created_at` | TEXT | App-generated UTC ISO 8601 | When the record was first created |
| `updated_at` | TEXT | App-generated UTC ISO 8601 | When the record was last modified (updated on every write) |
| `deleted_at` | TEXT | NULL | Set on soft delete; NULL means active |
| `sync_status` | TEXT | `'LOCAL'` | `LOCAL` = V1 only; `PENDING_SYNC` = awaiting upload; `SYNCED` = confirmed on server; `CONFLICT` = merge required |

### V2 Sync Query

To find all records that need uploading to Firebase in V2:

```sql
SELECT * FROM cycles
WHERE sync_status = 'PENDING_SYNC'
   OR (deleted_at IS NOT NULL AND sync_status != 'SYNCED')
ORDER BY updated_at ASC;
```

---

## 8. Data Retention Policy

| Data Type | Retention | Notes |
|---|---|---|
| Cycle entries | Indefinite | Never auto-deleted |
| Daily logs | Indefinite | Never auto-deleted |
| Custom symptoms | Until user deletes | Soft-deleted |
| Health notes | Until user deletes | Soft-deleted |
| Intercourse logs | Until user deletes | Soft-deleted |
| App settings | Indefinite (MMKV) | Cleared on "Reset All Data" |

### "Reset All Data" Behavior

When the user confirms a full data reset:

1. All table rows are hard-deleted (this is the ONLY hard delete in the system)
2. MMKV is cleared
3. Expo SecureStore entries are removed
4. App resets to onboarding state

This action is irreversible and requires:
- Data export offer
- Clear warning text
- Three-step confirmation

---

*Database Design v1.0.0 — Schema version 1.*

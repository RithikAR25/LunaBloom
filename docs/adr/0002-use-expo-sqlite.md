# ADR-0002: Use Expo SQLite for Local Data Persistence

| Field | Value |
|---|---|
| **Status** | Accepted |
| **Date** | 2026-07-22 |
| **Deciders** | Lead Developer |
| **Supersedes** | Initial proposal of WatermelonDB |

---

## Context

LunaBloom is an offline-first health application. All cycle history, daily logs, symptoms, moods, health notes, and user profile data must be stored locally on the device. The storage solution must:

- Work completely offline
- Support relational data (cycles → daily logs → symptoms)
- Support schema migrations as the app evolves
- Enable future Firebase cloud synchronization (V2)
- Encrypt sensitive health data at rest
- Be compatible with Expo SDK 57

---

## Decision

**Use Expo SQLite (`expo-sqlite`) with application-level SQLCipher encryption** for all health data, combined with **MMKV** for settings and preferences.

---

## Alternatives Considered

### Option A: AsyncStorage
- Simple key-value store included with React Native
- No relational query capability
- No schema migration support
- Significantly slower than SQLite for health record volumes
- Not suitable for structured health data — eliminated

### Option B: WatermelonDB
- Built on top of SQLite with a reactive observable query system
- Has a built-in sync protocol designed for offline-first → cloud sync
- Very strong choice for Firebase V2 integration
- **Rejected because:** Requires a native module (JSI-based) that breaks Expo Go compatibility. Adds setup complexity (custom native build). Built-in sync protocol is a convenience but not a necessity given the Repository Pattern approach.

### Option C: Realm (MongoDB Atlas Device Sync)
- Powerful, reactive, with built-in cloud sync
- Ties the backend to MongoDB Atlas — conflicts with the planned Firebase V2 backend
- Heavier runtime; complex setup
- Eliminated due to backend lock-in

### Option D: Expo SQLite ✅ Chosen
- First-class Expo SDK library (`expo-sqlite`)
- Full SQLite with WAL mode support (improved concurrent read performance)
- Works in Expo Go — no custom native build required for development
- Supports parameterized queries, transactions, `PRAGMA user_version` for migrations
- Supports SQLCipher encryption (via Expo SQLite's encryption option in SDK 50+)
- Sufficient performance for health record volumes (< 10MB/year typical usage)
- Repository Pattern provides the same V2 Firebase migration path as WatermelonDB

### Option E: MMKV only
- Extremely fast key-value store
- No relational capability
- Cannot replace SQLite for structured health data
- **Used alongside SQLite** for settings/preferences only

---

## Trade-offs

| Consideration | Impact |
|---|---|
| No built-in reactive queries | Reactivity handled explicitly: Zustand re-fetches after every write mutation |
| No built-in sync protocol | V2 Firebase sync must be manually implemented (delta tracking, conflict resolution) |
| Manual SQL queries | More verbose than WatermelonDB's model-based API; mitigated by typed query constants |
| No ORM | Plain SQL is more transparent, easier to debug, and has no abstraction overhead |
| Expo Go compatible | Development iteration is faster; no native rebuild required for most changes |

---

## V2 Sync Strategy

Because the Repository Pattern completely isolates the storage layer, V2 Firebase migration is clean:

1. All records have `syncStatus`, `createdAt`, `updatedAt`, `deletedAt` fields from V1
2. `syncStatus = 'PENDING_SYNC'` flags records that need to be pushed to Firebase
3. `updatedAt` enables last-write-wins conflict resolution
4. `deletedAt` (soft delete) communicates deletions to Firebase before local cleanup
5. V2 implements `FirebaseCycleRepository implements ICycleRepository` — zero UI changes

The cost: writing a `FirebaseSyncService` in V2 is non-trivial but architecturally contained.

---

## Consequences

**Positive:**
- Simpler development setup — works with `expo start` and Expo Go
- Full SQL power for complex queries (symptom trends, cycle analysis)
- Transparent, debuggable SQL queries
- Repository Pattern ensures V2 Firebase migration requires no UI changes

**Negative:**
- V2 Firebase sync logic must be custom-built (no protocol included)
- More verbose than WatermelonDB's model-based API
- No automatic reactivity — requires explicit Zustand re-fetch pattern

---

## References
- [Expo SQLite Documentation v57](https://docs.expo.dev/versions/v57.0.0/sdk/sqlite/)
- [SQLite WAL Mode](https://www.sqlite.org/wal.html)
- [SQLCipher](https://www.zetetic.net/sqlcipher/)

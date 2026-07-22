# ADR-0004: Use Repository Pattern for Data Access

| Field | Value |
|---|---|
| **Status** | Accepted |
| **Date** | 2026-07-22 |
| **Deciders** | Lead Developer |
| **Supersedes** | — |

---

## Context

LunaBloom V1 stores all data locally using Expo SQLite. V2 will introduce Firebase cloud synchronization. The architecture must allow replacing the storage layer (SQLite → Firebase) without touching UI components or business logic.

Additionally, business logic services (prediction engine, insight engine) must be testable in isolation without requiring a real database connection.

---

## Decision

**Apply the Repository Pattern** across all data access in LunaBloom.

Every data entity has:
1. A **repository interface** in the domain layer (pure TypeScript, no dependencies)
2. A **concrete implementation** in the data layer (Expo SQLite in V1, Firebase in V2)
3. All business logic and UI depend only on the **interface**, never the implementation

---

## Pattern Structure

```
src/domain/repositories/
    ICycleRepository.ts         ← Interface (contract)
    IDailyLogRepository.ts
    IHealthNoteRepository.ts
    IUserProfileRepository.ts

src/data/repositories/
    SQLiteCycleRepository.ts    ← V1 Implementation
    SQLiteDailyLogRepository.ts
    ...
    FirebaseCycleRepository.ts  ← V2 Implementation (same interface)
    FirebaseDailyLogRepository.ts
```

---

## Alternatives Considered

### Option A: Direct SQLite access in components
- Components call `db.getAllAsync(...)` directly
- Zero indirection, simple to understand initially
- **Fatal flaw:** UI is tightly coupled to SQLite. V2 migration requires rewriting every screen.
- Unit testing requires a real SQLite database. Eliminated.

### Option B: Service layer only (no repository)
- A `CycleService` class handles both business logic AND data access
- Simpler than full repository pattern
- Still couples business logic to SQLite implementation
- Harder to test: mocking requires mocking SQLite, not just an interface
- Eliminated

### Option C: Repository Pattern ✅ Chosen
- Clean boundary: domain layer depends on interfaces, data layer implements them
- V2 migration = implement new class + swap at DI root. Zero other changes.
- Unit testing = inject mock repository. No database required.
- Industry-standard pattern in Clean Architecture (Uncle Bob, DDD literature)
- Overhead is minimal: one interface file + one implementation file per entity

---

## Interface Contract Example

```typescript
// src/domain/repositories/ICycleRepository.ts
export interface ICycleRepository {
  save(cycle: CycleEntry): Promise<void>;
  getAll(): Promise<CycleEntry[]>;
  getById(id: string): Promise<CycleEntry | null>;
  getLastN(n: number): Promise<CycleEntry[]>;
  update(id: string, data: Partial<CycleEntry>): Promise<void>;
  softDelete(id: string): Promise<void>;
}
```

The domain layer, prediction engine, insight engine, and Zustand stores all depend on `ICycleRepository`. They have no knowledge of SQLite or Firebase.

---

## Dependency Injection

Repositories are instantiated once at the application root and provided via React Context:

```
App Root (_layout.tsx)
  → DatabaseProvider (initializes SQLite)
    → RepositoryProvider (instantiates all repositories)
      → All screens (consume repositories via context or hooks)
```

V2: Replace `SQLite*Repository` with `Firebase*Repository` at `RepositoryProvider`. Done.

---

## Consequences

**Positive:**
- V2 Firebase migration requires zero UI or domain layer changes
- All business logic is unit-testable with mock repositories
- Clear architectural boundaries make codebase navigable for new contributors
- Forces consistent data access patterns across the entire codebase

**Negative:**
- Slightly more files: one interface + one implementation per entity
- New contributors must understand the pattern (well-documented in this ADR)
- For very simple queries, the indirection can feel verbose

---

## Testing Strategy

```typescript
// Mock repository for unit tests
class MockCycleRepository implements ICycleRepository {
  private cycles: CycleEntry[] = [];
  async save(cycle: CycleEntry) { this.cycles.push(cycle); }
  async getAll() { return this.cycles; }
  // ...
}

// Test CyclePredictionService without any database
const service = new CyclePredictionService();
const repo = new MockCycleRepository();
await repo.save(mockCycle);
const prediction = service.predictNextPeriod(await repo.getAll());
expect(prediction.confidenceLevel).toBe('LOW');
```

---

## References
- [Repository Pattern — Martin Fowler](https://martinfowler.com/eaaCatalog/repository.html)
- [Clean Architecture — Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

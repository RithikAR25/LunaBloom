# LunaBloom — Coding Standards

**Version:** 1.0.0  
**Status:** Active  
**Date:** 2026-07-22  
**Scope:** All source code in `src/` and `app/`

> These standards are enforced by ESLint, Prettier, and TypeScript strict mode. Where tooling cannot enforce a rule, code review enforces it.

---

## Table of Contents
1. [TypeScript Rules](#1-typescript-rules)
2. [Naming Conventions](#2-naming-conventions)
3. [Folder Organization](#3-folder-organization)
4. [Component Guidelines](#4-component-guidelines)
5. [Hook Guidelines](#5-hook-guidelines)
6. [Repository Rules](#6-repository-rules)
7. [Error Handling](#7-error-handling)
8. [Logging](#8-logging)
9. [Testing](#9-testing)
10. [Git Commit Conventions](#10-git-commit-conventions)

---

## 1. TypeScript Rules

### 1.1 Strict Mode — Non-Negotiable

The following compiler options are mandatory in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "exactOptionalPropertyTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

### 1.2 Forbidden Patterns

| Pattern | Why Forbidden | Alternative |
|---|---|---|
| `any` | Defeats type safety | Use `unknown` + type guard |
| `as Type` (type assertion) | Hides runtime errors | Use type guard or narrowing |
| `!` (non-null assertion) | Masks null bugs | Use optional chaining `?.` or explicit check |
| `// @ts-ignore` | Silences errors | Fix the root cause |
| `// @ts-nocheck` | Disables TypeScript | Never acceptable |

### 1.3 Type Definitions

- All domain models are defined as `interface` (not `type`) in `src/domain/models/`
- Shared enums use `type` literal unions (not TypeScript `enum`) for bundle efficiency:
  ```typescript
  // ✅ Correct
  type FlowIntensity = 'SPOTTING' | 'LIGHT' | 'MEDIUM' | 'HEAVY' | 'VERY_HEAVY';

  // ❌ Avoid
  enum FlowIntensity { SPOTTING, LIGHT, ... }
  ```
- All function parameters and return types must be explicitly typed
- Generic types use descriptive names: `TData`, `TError` (not single letters like `T`)

### 1.4 Imports

- Use absolute imports via path aliases (`@/domain/...`, `@/components/...`)
- Never use relative imports that go more than 2 levels up (`../../..`)
- Import order enforced by ESLint: React → React Native → Expo → Third-party → Internal (`@/`)

---

## 2. Naming Conventions

### Files & Folders

| Asset | Convention | Example |
|---|---|---|
| React component file | PascalCase | `CycleCalendar.tsx` |
| Hook file | camelCase, prefixed `use` | `useCycleStore.ts` |
| Service/class file | PascalCase | `CyclePredictionService.ts` |
| Repository interface | PascalCase, prefixed `I` | `ICycleRepository.ts` |
| Repository implementation | PascalCase, prefixed with DB | `SQLiteCycleRepository.ts` |
| Utility file | camelCase | `dateUtils.ts` |
| Type definition file | camelCase | `cycleTypes.ts` |
| Constants file | camelCase | `cycleConstants.ts` |
| Test file | Same name + `.test` | `CyclePredictionService.test.ts` |
| JSON content file | kebab-case | `menstrual-phase.json` |

### Variables & Functions

| Asset | Convention | Example |
|---|---|---|
| Variables | camelCase | `lastPeriodDate` |
| Constants (module-level) | SCREAMING_SNAKE_CASE | `DEFAULT_CYCLE_LENGTH` |
| Functions | camelCase, verb-first | `calculateNextPeriod()` |
| React components | PascalCase | `CyclePhaseCard` |
| Custom hooks | camelCase, `use` prefix | `useCyclePrediction()` |
| Zustand stores | camelCase, `use` prefix | `useCycleStore` |
| Event handlers | camelCase, `handle` prefix | `handlePeriodStart` |
| Boolean variables | camelCase, `is/has/can` prefix | `isPeriodActive`, `hasLoggedToday` |
| Interface names | PascalCase | `CycleEntry`, `ICycleRepository` |
| Type alias names | PascalCase | `FlowIntensity`, `SyncStatus` |
| Enum-style literals | SCREAMING_SNAKE_CASE values | `'VERY_HEAVY'`, `'PENDING_SYNC'` |

---

## 3. Folder Organization

### 3.1 Layer Rules

```
src/domain/       → Pure TypeScript. No imports from Expo, React Native, or data layer.
src/data/         → Expo SQLite implementations. Depends on domain interfaces only.
src/presentation/ → Zustand stores, hooks, view-models. Depends on domain only.
src/components/   → React Native components. Depends on presentation and domain.
app/              → Expo Router screens. Depends on components and presentation.
```

### 3.2 Component Colocation

Each component lives in its own folder with an `index.ts` barrel file:

```
src/components/ui/Button/
    Button.tsx          ← Implementation
    Button.styles.ts    ← StyleSheet (if complex)
    Button.test.tsx     ← Unit tests
    index.ts            ← export { Button } from './Button'
```

### 3.3 Feature Isolation

New features must be self-contained. A feature should not directly import from another feature's internals:

```typescript
// ✅ Correct — import from domain interface
import type { ICycleRepository } from '@/domain/repositories/ICycleRepository';

// ❌ Wrong — importing another feature's implementation detail
import { SQLiteCycleRepository } from '@/data/repositories/SQLiteCycleRepository';
```

---

## 4. Component Guidelines

### 4.1 Component Structure

Every component follows this order:

```typescript
// 1. Imports (React → RN → Expo → third-party → internal)
import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@/presentation/hooks/useTheme';
import type { CyclePhase } from '@/domain/models/Cycle';

// 2. Types
interface CyclePhaseCardProps {
  phase: CyclePhase;
  currentDay: number;
  onLearnMore: () => void;
}

// 3. Component (named export preferred over default for screens)
export function CyclePhaseCard({ phase, currentDay, onLearnMore }: CyclePhaseCardProps) {
  const { colors } = useTheme();

  // 4. Hooks (all at top, no conditional hooks)

  // 5. Derived values / handlers

  // 6. JSX return
  return (...);
}
```

### 4.2 Rules

- **No business logic in components.** Components call Zustand store actions or hook functions — they never contain cycle math, date calculations, or data transformations.
- **Props are typed.** Every component has an explicit `interface *Props` definition.
- **No inline styles for static bounds.** Use `StyleSheet.create()` or design system tokens.
- **Use `useScaling()` for responsive geometry.** Never use raw `Dimensions.get('window')`. Layout structural sizes must scale, while borders, radius, and tokens remain static. See [docs/20_Responsive_Scaling.md](./20_Responsive_Scaling.md) for the exact rules of engagement.
- **No hardcoded colors or font sizes.** Always use design tokens from `@/design-system/`.
- **No hardcoded strings.** All user-facing text lives in constants or content JSON (i18n-readiness).
- **Accessibility labels required.** All interactive elements must have `accessibilityLabel` and `accessibilityRole`.
- **Maximum component size:** 200 lines. If larger, decompose.

### 4.3 Screen Components (app/ directory)

- Screen components are thin: they read from Zustand stores and render child components
- No data fetching logic in screens — that belongs in stores or hooks
- Screen names match their route file: `app/(tabs)/calendar.tsx` → `CalendarScreen`

---

## 5. Hook Guidelines

### 5.1 Custom Hook Rules

- Hook names **must** start with `use`
- Hooks encapsulate state + effects that go together
- Hooks must not have side effects that cannot be cleaned up
- Hooks that fetch data must handle loading, error, and empty states

### 5.2 Hook Structure

```typescript
// src/presentation/hooks/useCyclePrediction.ts
export function useCyclePrediction() {
  const cycles = useCycleStore(state => state.cycles);
  
  const prediction = useMemo(
    () => CyclePredictionService.predictNextPeriod(cycles),
    [cycles]
  );
  
  return { prediction };
}
```

### 5.3 Forbidden Hook Patterns

- No conditional hook calls (React rule)
- No hooks that call other custom hooks in loops
- No hooks that contain business logic — delegate to services

---

## 6. Repository Rules

### 6.1 Interface Compliance

Every concrete repository must implement the full domain interface:

```typescript
export class SQLiteCycleRepository implements ICycleRepository {
  // All interface methods must be implemented — no empty stubs
}
```

### 6.2 Repository Methods

- All repository methods are `async` and return `Promise<T>`
- All database operations are wrapped in try/catch
- Errors are re-thrown as domain errors (not SQLite-specific errors)
- Soft delete only — never call `DELETE FROM` for user health data

### 6.3 SQL Rules

- All SQL queries use parameterized placeholders (`?`) — never string interpolation
- SQL query strings live in `src/data/database/queries/` — never inline in repository methods
- Every table must have: `id TEXT PRIMARY KEY`, `created_at`, `updated_at`, `deleted_at`, `sync_status`

### 6.4 Forbidden Patterns in Repositories

```typescript
// ❌ String interpolation — SQL injection risk
await db.runAsync(`SELECT * FROM cycles WHERE id = '${id}'`);

// ✅ Parameterized query
await db.runAsync(`SELECT * FROM cycles WHERE id = ?`, [id]);

// ❌ Hard delete
await db.runAsync(`DELETE FROM cycles WHERE id = ?`, [id]);

// ✅ Soft delete
await db.runAsync(
  `UPDATE cycles SET deleted_at = ?, sync_status = 'LOCAL' WHERE id = ?`,
  [new Date().toISOString(), id]
);
```

---

## 7. Error Handling

### 7.1 Principles

- **Never swallow errors silently.** Every caught error must be either re-thrown, logged, or surfaced to the user.
- **Never show raw stack traces to users.** All user-facing errors are friendly, actionable messages.
- **Database errors → domain errors.** Repositories translate SQLite errors into domain-level `RepositoryError` types before propagating up.

### 7.2 Error Types

```typescript
// src/domain/errors/index.ts
export class RepositoryError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'RepositoryError';
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly field: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class PredictionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PredictionError';
  }
}
```

### 7.3 Error Boundaries

- Every screen is wrapped in a React Error Boundary
- Error Boundary displays `<ErrorState />` component with a "Try Again" action
- Error Boundary logs the error to the device-local error log

### 7.4 Repository Error Pattern

```typescript
async save(cycle: CycleEntry): Promise<void> {
  try {
    await this.db.runAsync(`INSERT INTO cycles ...`, [...]);
  } catch (error) {
    throw new RepositoryError(
      'Failed to save cycle entry. Please try again.',
      error
    );
  }
}
```

---

## 8. Logging

### 8.1 V1 Logging Policy

- V1 uses `console.log` / `console.error` for development logging only
- All `console.log` statements **must** be removed before any public release
- Use `__DEV__` guard for development-only logs:
  ```typescript
  if (__DEV__) {
    console.log('[CyclePredictionService] Calculated prediction:', result);
  }
  ```

### 8.2 Log Format

```typescript
// Format: [ClassName/HookName] Action: detail
console.log('[SQLiteCycleRepository] Saving cycle:', cycle.id);
console.error('[SQLiteCycleRepository] Save failed:', error);
```

### 8.3 V2 Logging

Sentry or equivalent crash reporting will be added in V2. The architecture supports adding it with zero changes to existing code — wrap `console.error` calls in a `Logger` service in V2.

---

## 9. Testing

### 9.1 What to Test

| Layer | Test Type | Coverage Target |
|---|---|---|
| Domain services (prediction, insights) | Unit tests | ≥ 90% |
| Repository interfaces (via mock implementations) | Unit tests | ≥ 80% |
| Utility functions (date, validation, uuid) | Unit tests | 100% |
| Zustand stores | Unit tests | ≥ 70% |
| UI components | Component tests | Key reusable components |
| User flows | Manual test matrix | All flows before each release |

### 9.2 Test File Location

Tests are colocated with source files:

```
src/domain/services/CyclePredictionService.ts
src/domain/services/CyclePredictionService.test.ts
```

### 9.3 Test Naming

```typescript
describe('CyclePredictionService', () => {
  describe('predictNextPeriod', () => {
    it('returns LOW confidence with one cycle', () => { ... });
    it('returns HIGH confidence with three or more cycles', () => { ... });
    it('returns wider range for irregular cycles', () => { ... });
    it('never returns a predicted date in the past', () => { ... });
  });
});
```

### 9.4 Mock Repository Pattern

```typescript
// Never mock SQLite — mock the repository interface
const mockRepo: ICycleRepository = {
  save: jest.fn(),
  getAll: jest.fn().mockResolvedValue([mockCycle]),
  // ...
};
```

---

## 10. Git Commit Conventions

LunaBloom uses **Conventional Commits** format.

### 10.1 Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### 10.2 Types

| Type | When to Use |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no logic change |
| `refactor` | Code restructure, no feature/fix |
| `test` | Adding or fixing tests |
| `chore` | Build process, dependency updates |
| `perf` | Performance improvement |
| `ci` | CI/CD changes |

### 10.3 Scopes

Use the feature or layer name as scope:

`feat(cycle)`, `fix(prediction)`, `docs(adr)`, `feat(dashboard)`, `refactor(data-layer)`

### 10.4 Examples

```
feat(cycle): add period start with retroactive date selection
fix(prediction): correct weighted average for single-cycle history
docs(adr): add ADR-0002 for Expo SQLite decision
chore(deps): upgrade expo-sqlite to latest patch
refactor(data): rename Watermelon repositories to SQLite prefix
test(prediction): add unit tests for irregular cycle detection
feat(calendar): implement color-coded phase calendar view
```

### 10.5 Phase-Based Commit Strategy

Each development phase ends with a tagged commit:

```
git tag v0.1.0-phase0   # Project foundation complete
git tag v0.2.0-phase1   # Core cycle tracking complete
git tag v0.3.0-phase2   # Dashboard and daily log complete
...
git tag v1.0.0          # MVP complete
```

This creates a clean, demonstrable Git history for portfolio purposes.

---

*Coding Standards v1.0.0 — Enforced from first commit.*

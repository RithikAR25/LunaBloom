# ADR-0003: Use Zustand for Client State Management

| Field | Value |
|---|---|
| **Status** | Accepted |
| **Date** | 2026-07-22 |
| **Deciders** | Lead Developer |
| **Supersedes** | — |

---

## Context

LunaBloom needs a client-side state management solution to manage:

- In-memory cache of cycle data, predictions, and daily logs (sourced from SQLite)
- UI state (current screen state, modals open/closed, selected date)
- App-level state (theme, auth lock status, onboarding status)
- Settings state (notification preferences, privacy settings)

The solution must be lightweight, TypeScript-friendly, and leave room for TanStack Query to handle server state in V2 without conflict.

---

## Decision

**Use Zustand** for all client-side state management.

**Use TanStack Query (reserved for V2)** for Firebase server state when introduced.

---

## Alternatives Considered

### Option A: Redux Toolkit
- Industry standard for large-scale apps
- Excellent DevTools
- Significant boilerplate even with RTK (slices, reducers, actions, selectors)
- Bundle size: ~40KB (Zustand: ~1KB)
- Over-engineered for a solo developer health app
- RTK Query could handle server state in V2 but conflicts less cleanly than TanStack Query

### Option B: React Context + useReducer
- Zero dependencies
- Fine for simple apps; becomes verbose and performance-problematic at scale
- No built-in selectors — causes unnecessary re-renders without memoization
- Context nesting becomes unmanageable across 10+ stores
- Eliminated for medium-complexity apps

### Option C: Jotai
- Atomic state model — each piece of state is independent
- Very good TypeScript support
- Less intuitive for store-shaped data (cycles, logs, insights)
- Smaller community than Zustand
- Very similar bundle size to Zustand

### Option D: Zustand ✅ Chosen
- Minimal boilerplate: define store as a single function
- Excellent TypeScript inference — no generics gymnastics
- Tiny bundle: ~1KB gzipped
- Supports slices, middleware (devtools, persist), and computed values
- Clean separation from data layer — stores are view-model caches, not data sources
- Does not conflict with TanStack Query (different concerns: local state vs server state)
- React 18 compatible with automatic batching

---

## Architecture Rule

Zustand stores are **thin view-model caches**, not data sources.

```
SQLite (source of truth)
    ↓ Repository read
Zustand Store (in-memory cache)
    ↓ React hooks
UI Components
```

Every write follows this pattern:
1. UI dispatches store action
2. Store action calls repository (writes to SQLite)
3. Store action calls `load*` to re-fetch from repository
4. Store updates → UI re-renders

No component reads directly from SQLite. No component writes directly to SQLite.

---

## Store Inventory

| Store | Responsibility |
|---|---|
| `useCycleStore` | Cycle history, current cycle, predictions |
| `useDashboardStore` | Current phase, today summary, health tip |
| `useInsightsStore` | Analytics data, charts data, trends |
| `useSettingsStore` | All MMKV settings: theme, notifications, privacy |
| `useAuthStore` | Lock state, PIN verification status |
| `useLogStore` | Today's daily log, log history cache |

---

## V2 TanStack Query Strategy

When Firebase is introduced in V2:
- TanStack Query handles all server state: fetching, caching, background sync, error retry
- Zustand continues handling local UI state and local-first data
- There is no conflict — they operate on different data layers

---

## Consequences

**Positive:**
- Minimal boilerplate — each store is ~30 lines of typed code
- Easy to unit test: stores are plain functions
- DevTools middleware available for debugging
- TypeScript inference works out of the box — no manual type annotations on every selector

**Negative:**
- No built-in reactive data binding to SQLite (unlike WatermelonDB's `.observe()`)
- Explicit re-fetch pattern required after every write — slightly more verbose

---

## References
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [TanStack Query Documentation](https://tanstack.com/query/latest)

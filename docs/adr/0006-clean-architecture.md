# ADR-0006: Use Clean Architecture with Feature-Based Organization

| Field | Value |
|---|---|
| **Status** | Accepted |
| **Date** | 2026-07-22 |
| **Deciders** | Lead Developer |
| **Supersedes** | — |

---

## Context

LunaBloom is intended to grow from a personal portfolio project to a production-grade application. The codebase must remain maintainable, testable, and navigable for years of development. An architectural style must be chosen before any feature code is written.

---

## Decision

**Use Clean Architecture** with three explicit layers (Presentation, Domain, Data) organized with **feature-based folders** within the domain and data layers.

---

## Layer Definitions

| Layer | Location | Allowed Dependencies |
|---|---|---|
| Presentation | `app/`, `src/presentation/`, `src/components/` | Domain layer only |
| Domain | `src/domain/` | Nothing (pure TypeScript) |
| Data | `src/data/` | Domain interfaces + Expo SQLite |

**Dependency Rule:** Dependencies flow inward only. Domain knows nothing about Expo, React, or SQLite. Presentation knows nothing about SQLite.

---

## Alternatives Considered

### Option A: MVC / Component-heavy
- Components contain business logic and data fetching
- Simple to start; quickly becomes unmaintainable
- Testing requires rendering components
- Eliminated — not suitable for a growing health app

### Option B: Feature-sliced design (FSD)
- Trendy architecture with strict import rules between features
- Complex to enforce; requires tooling
- Overkill for a single-developer project
- Eliminated

### Option C: Clean Architecture ✅ Chosen
- Industry-proven for mobile applications
- Clear boundaries enable unit testing of business logic
- Domain layer can be reused in a future web companion
- Repository Pattern integrates naturally
- Well-documented (Uncle Bob, Android Architecture Guidelines)

---

## Consequences

**Positive:**
- Business logic is testable without UI
- Storage layer is swappable (SQLite → Firebase) without touching domain or UI
- New features can be added without touching unrelated code
- Codebase is self-documenting: file location reveals layer and responsibility

**Negative:**
- More initial files compared to a flat component structure
- New contributors must understand the layering before contributing

---

## References
- [The Clean Architecture — Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

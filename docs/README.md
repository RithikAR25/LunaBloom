# LunaBloom — Documentation

**"Understand your cycle. Empower your health."**

This folder contains all project documentation for LunaBloom, organized by type. Documentation is version-controlled alongside the codebase and updated with each development phase.

---

## Documentation Index

### Architecture Decision Records (`adr/`)

Short documents recording *why* each major technical decision was made, what alternatives were considered, and what trade-offs were accepted.

| ADR | Decision |
|---|---|
| [0001](./adr/0001-use-expo-router.md) | Use Expo Router for navigation |
| [0002](./adr/0002-use-expo-sqlite.md) | Use Expo SQLite for local data persistence |
| [0003](./adr/0003-use-zustand.md) | Use Zustand for client state management |
| [0004](./adr/0004-repository-pattern.md) | Use Repository Pattern for data access |
| [0005](./adr/0005-offline-first.md) | Offline-first architecture |
| [0006](./adr/0006-clean-architecture.md) | Clean Architecture with feature-based organization |

> When adding a new major technical decision, create a new ADR following the existing format.

---

### Project Documentation

| # | Document | Description |
|---|---|---|
| — | [**DEVELOPMENT.md**](./DEVELOPMENT.md) | **Agent operating manual — read this before writing any code** |
| 06 | [Coding Standards](./07_Coding_Standards.md) | TypeScript rules, naming, components, hooks, repositories, testing, Git conventions |
| 07 | [Design System](./05_Design_System.md) | Color palette, typography, spacing, motion, component states, accessibility |
| 08 | [API Contract](./10_API_Contract.md) | V2 REST API endpoints, request/response schemas, sync strategy |
| 09 | [Database Design](./06_Database.md) | ER diagram, table definitions, indexes, migrations, sync fields |

---

### Planning Documentation

*(Stored in project planning system — linked for reference)*

- Business Requirements Document (BRD)
- Product Requirements Document (PRD) — personas, user stories, functional requirements
- System Architecture — technology stack, folder structure, data model
- Navigation Flow & Screen Map
- Development Roadmap — 7 phases with deliverables and exit criteria

---

## Development Phases

| Phase | Description | Status |
|---|---|---|
| **Phase 0** | Project foundation — Expo Router, SQLite, design system, folder structure | Planned |
| **Phase 1** | Core cycle tracking — period logging, predictions, calendar | Planned |
| **Phase 2** | Daily log, dashboard, onboarding | Planned |
| **Phase 3** | Insights, analytics, education content | Planned |
| **Phase 4** | Fertility tracking, notifications, privacy/app lock | Planned |
| **Phase 5** | Data export/import, accessibility, polish | Planned |
| **Phase 6** | V2 architecture validation | Planned |

**Development approach:** One phase at a time. Each phase ends with a commit and a version tag.

```
v0.1.0-phase0 → v0.2.0-phase1 → v0.3.0-phase2 → ... → v1.0.0
```

---

## Contributing to Documentation

- Update the relevant document when a decision changes
- Create a new ADR for any new major technical decision
- Keep ADRs short — the goal is *why*, not *how*
- Documentation is part of the definition of done for every phase

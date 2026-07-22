# LunaBloom — Development Guide

> **This document is the operating manual for any developer or AI agent working on LunaBloom.**  
> Read this before writing a single line of code.

---

## The Golden Rule

**One phase at a time. Commit. Tag. Stop.**

Do not implement Phase 2 while Phase 1 is incomplete.  
Do not refactor Phase 0 while implementing Phase 1.  
Do not add features that belong to a future phase.

---

## Before You Write Any Code

Complete these steps in order. No exceptions.

### Step 1 — Read the Documentation

| Document | Location | Why |
|---|---|---|
| Business Requirements | Planning artifacts | What problem we're solving and for whom |
| Product Requirements | Planning artifacts | User stories and functional requirements |
| System Architecture | Planning artifacts | Technology decisions and folder structure |
| Navigation Flow | Planning artifacts | Screen map and user flows |
| Development Roadmap | Planning artifacts | Phase breakdown and exit criteria |

### Step 2 — Read AGENTS.md

[`AGENTS.md`](../AGENTS.md) contains workspace-specific rules and constraints for this project. These override any general defaults.

### Step 3 — Read the ADRs

Every major technical decision is recorded in `docs/adr/`. Read all ADRs before making any new technical decision.

If you are about to make a decision that contradicts an existing ADR, **stop and update the ADR first** — do not silently override it in code.

### Step 4 — Identify the Current Phase

Check the [Development Roadmap](./05_Roadmap.md) and identify:
- Which phase is currently active
- What deliverables are required for this phase
- What the exit criteria are

**Implement only the current phase.** If you see a needed improvement that belongs to a future phase, note it as a comment or TODO — do not implement it now.

---

## Git Milestone Structure

LunaBloom uses a milestone-based Git tag strategy. Each milestone is a stable, committed state.

| Tag | Milestone | Contents |
|---|---|---|
| `v0.1-planning` ✅ | Planning Complete | All documentation: BRD, PRD, architecture, ADRs, coding standards, design system, API contract, database design |
| `v0.2-foundation` | Project Foundation | Expo Router, TypeScript strict config, ESLint, Prettier, Jest, folder structure, `_layout.tsx` skeleton |
| `v0.3-navigation` | Navigation Shell | All Expo Router routes, tab navigator, placeholder screens, root layout with auth gate logic |
| `v0.4-design-system` | Design System | Token files (colors, typography, spacing, motion), light/dark themes, all base UI components |
| `v0.5-database` | Local Database | Expo SQLite initialization, schema v1, all migrations, all repository interfaces and implementations |
| `v0.6-auth-ui` | Auth & Security | PIN setup screen, lock screen, biometric integration, Expo SecureStore, auto-lock logic |
| `v0.7-dashboard` | Dashboard | Onboarding flow, cycle store, dashboard screen, health tip of the day, quick actions |
| `v0.8-calendar` | Calendar View | Calendar screen, phase color coding, day tap bottom sheet, month navigation |
| `v0.9-cycle-tracking` | Cycle Tracking | Period start/end, flow logging, prediction engine, daily log, insights, education, fertility, notifications |
| `v1.0` | MVP Complete | Data export/import, accessibility audit, polish pass, full test coverage, portfolio-ready |

### Commit and Tag Procedure

After each milestone is complete and verified:

```bash
# Stage all changes
git add .

# Commit with conventional format
git commit -m "feat(foundation): complete project scaffold and architecture"

# Tag the milestone
git tag v0.2-foundation

# (When ready to push — future step)
# git push origin main --tags
```

---

## Development Rules

These are non-negotiable. Any code review (human or automated) that catches a violation should result in the code being reverted.

### Architecture Rules

- [ ] **Never modify the architecture without updating the relevant ADR first.**
- [ ] **Never add a dependency without a documented justification.** Every `npm install` requires a reason written in a comment, commit message, or ADR.
- [ ] **The domain layer must remain pure.** `src/domain/` must never import from `src/data/`, `src/presentation/`, or any Expo/React Native package.
- [ ] **UI components must never call repositories directly.** All data flows through Zustand stores.
- [ ] **Never hard-delete user health data.** Use soft deletes (`deleted_at`) only. The only exception is "Reset All Data" in Settings.

### TypeScript Rules

- [ ] **Zero TypeScript errors.** The build must pass `tsc --noEmit` cleanly.
- [ ] **Never use `any`.** Use `unknown` + type guards, or fix the root type.
- [ ] **Never use `// @ts-ignore` or `// @ts-nocheck`.**
- [ ] **Never use non-null assertion `!` without a comment explaining why it's safe.**
- [ ] **All function parameters and return types must be explicitly typed.**

### Code Quality Rules

- [ ] **Run lint before finishing.** `npx expo lint` must pass with zero errors.
- [ ] **No hardcoded colors or font sizes.** Every visual value must come from `@/design-system/`.
- [ ] **No hardcoded user-facing strings.** All text lives in constants or content JSON.
- [ ] **No business logic in components.** Cycle calculations, date math, and predictions belong in domain services.
- [ ] **Every new component needs an empty state and error state.**
- [ ] **Every interactive element needs accessibility labels.**

### Testing Rules

- [ ] **Business logic must be unit tested.** All services in `src/domain/services/` require tests before a phase is marked complete.
- [ ] **Tests use mock repositories, never real SQLite.**
- [ ] **A phase is not complete if tests fail.**

### Build Rules

- [ ] **Verify the Expo build compiles cleanly** before committing: `npx expo export --platform android` (or `expo run:android`).
- [ ] **Verify the app runs on a real device or emulator**, not just passes type checking.
- [ ] **The app must work completely offline.** Never call a network API in V1.

---

## Dependency Governance

Before adding any new package, answer these questions:

1. **Is it necessary?** Can this be implemented with what's already installed?
2. **Is it maintained?** Check the GitHub repo — last commit, open issues, license.
3. **Is it Expo-compatible?** Check [Expo's compatibility list](https://docs.expo.dev/versions/v57.0.0/).
4. **Does it require a dev build?** If yes, document this clearly.
5. **What is its bundle size impact?** Check [bundlephobia.com](https://bundlephobia.com/).

Record the decision in the relevant ADR or create a new ADR if it's a major dependency.

**Approved dependencies for V1** (already decided via ADRs):

| Package | Purpose | ADR |
|---|---|---|
| `expo-router` | Navigation | ADR-0001 |
| `expo-sqlite` | Local database | ADR-0002 |
| `zustand` | State management | ADR-0003 |
| `react-native-mmkv` | Settings storage | ADR-0002 |
| `expo-secure-store` | PIN / key storage | ADR-0002 |
| `react-native-reanimated` | Animations | Design System |
| `react-native-gesture-handler` | Gestures | Design System |
| `victory-native` | Charts | System Architecture |
| `@shopify/react-native-skia` | Skia renderer for charts | System Architecture |
| `expo-local-authentication` | Biometrics | System Architecture |
| `expo-notifications` | Local push notifications | System Architecture |
| `expo-print` | PDF export | System Architecture |
| `expo-file-system` | File export/import | System Architecture |
| `expo-haptics` | Haptic feedback | Design System |
| `@expo-google-fonts/inter` | Typography | Design System |

Any package not on this list requires justification before installation.

---

## Phase Exit Checklist

Before marking any phase as complete and creating a Git tag:

```
□ All deliverables in the Roadmap for this phase are implemented
□ TypeScript strict mode passes: npx tsc --noEmit
□ Lint passes: npx expo lint
□ App builds: expo run:android (or equivalent)
□ App runs correctly on emulator or real device
□ All new domain services have unit tests
□ No hardcoded colors, strings, or font sizes
□ All new screens have empty states and error states
□ All interactive elements have accessibility labels
□ AGENTS.md has been re-read and no rules were violated
□ No features from future phases were implemented
□ No dependencies were added without justification
□ Git commit follows conventional commit format
□ Git tag created with correct milestone name
```

---

## Folder Quick Reference

```
app/            → Expo Router screens (presentation only)
src/domain/     → Pure business logic (no Expo, no React)
src/data/       → SQLite implementations (no UI)
src/presentation/ → Zustand stores, hooks
src/components/ → Reusable UI components
src/design-system/ → Tokens and themes
src/content/    → Educational content JSON
src/constants/  → App-wide constants
src/utils/      → Pure utility functions
docs/           → All project documentation
docs/adr/       → Architecture Decision Records
__tests__/      → Test files (mirror src/ structure)
```

---

## Common Mistakes to Avoid

| Mistake | Correct Approach |
|---|---|
| Importing SQLite in a component | Use a Zustand store action instead |
| Calling `db.runAsync` in a screen | Move to a repository method |
| Hardcoding `#7C3AED` in a StyleSheet | Use `theme.colors.brand.primary` |
| Using `any` because it's "just temporary" | Fix the type now; temporary becomes permanent |
| Adding a feature from Phase 3 during Phase 1 | Add a `// TODO Phase 3:` comment and move on |
| Committing with TypeScript errors | Run `tsc --noEmit` first |
| Hard-deleting a health record | Set `deleted_at` instead |
| Making a network call | All V1 data is local; there is no network |

---

*DEVELOPMENT.md v1.0.0 — The operating manual for LunaBloom development.*

# LunaBloom: Reuse Existing Architecture First

## Policy

Before implementing ANY feature, bug fix, refactor, or code change, you MUST inspect the existing codebase for reusable functionality. This policy is mandatory and always active.

## Reuse Audit — Required Before Plans and Before Code

> [!IMPORTANT]
> The Reuse Audit must be performed **before creating an implementation plan**, not just before writing code.
> Do not propose creating a new utility, hook, component, service, helper, scaling mechanism, date utility, or abstraction until the repository has been searched for an existing implementation and possible extensions.
> **The implementation plan itself must identify which existing utilities and components will be reused.** A plan that proposes new abstractions without a prior search is not acceptable.

The required search order before any plan or code:

1. Inspect feature requirements.
2. Search existing utilities (`src/utils/`, `src/design-system/`, feature directories).
3. Search existing `useScaling` / SCAL usage and design-system tokens.
4. Search existing UI components (`src/presentation/components/ui/`, `src/presentation/components/`).
5. Search existing hooks (`src/presentation/hooks/`).
6. Search existing domain services and use-cases (`src/domain/`).
7. Search related feature implementations for established patterns.
8. Produce the Reuse Audit table below.
9. Build the implementation plan using only the findings above.

The Reuse Audit table must cover:

| Category | Findings | Will Reuse? |
|---|---|---|
| Utilities | List matches found | Yes / No + reason |
| Hooks | List matches found | Yes / No + reason |
| UI Components | List matches found | Yes / No + reason |
| Design-system tokens | List matches found | Yes / No + reason |
| Domain services/use-cases | List matches found | Yes / No + reason |
| State/store patterns | List matches found | Yes / No + reason |
| Existing tests | List matches found | Yes / No + reason |

If you cannot determine whether an existing implementation should be reused, **stop and ask** before creating a duplicate.

## Mandatory Behaviors

1. Search the repository for existing relevant functionality before writing any code.
2. Prefer reusing existing implementations over creating new ones.
3. Never create a duplicate utility, helper, hook, component, service, or parallel architecture when an existing implementation can satisfy the requirement.
4. If an existing implementation is close but insufficient, determine whether it can safely be extended before creating a new one.
5. Preserve existing APIs, contracts, architecture, and established patterns.
6. Do not introduce a new abstraction simply because it is more convenient.
7. If genuinely necessary to create something new, document why the existing implementation cannot reasonably be reused.
8. After implementation, search again for duplicate functionality that may have accidentally been introduced.

## Before Creating Any New Utility, Hook, Helper, or Service

This step is mandatory. Before creating any new utility, helper function, hook, constant, or service:

1. Search the following directories and report the closest existing implementations:
   - `src/utils/` — general utilities (date, validation, ID generation, etc.)
   - `src/design-system/` — design tokens, scaling, spacing, typography
   - `src/presentation/hooks/` — React hooks
   - `src/presentation/components/ui/` — shared UI components
   - `src/domain/services/` — domain-layer logic
   - `src/domain/use-cases/` — domain use-cases
   - `src/presentation/stores/` — Zustand stores
   - The relevant feature directory for co-located utilities

2. Report the closest existing implementations found, even partial matches.

3. A new utility may only be created if:
   - No existing implementation satisfies the requirement, **and**
   - No existing implementation can be reasonably extended, **and**
   - A written justification is provided in the Reuse Audit.

4. After implementation, search again to confirm no duplicate was accidentally introduced.

## LunaBloom-Specific Requirements

### Responsive Scaling (SCAL)

> [!IMPORTANT]
> For every UI feature involving dimensions, spacing, sizing, typography, positioning, or responsive layout:
> 1. Inspect the existing SCAL implementation (`src/design-system/`) **before proposing any new styling or sizing abstraction**.
> 2. Determine which existing scaling utilities should be reused.
> 3. Do not create feature-specific scaling utilities unless the existing SCAL architecture has been proven insufficient **and the user has explicitly approved the new abstraction**.
> 4. This check must appear in the implementation plan — not only at code-writing time.

- Always inspect and reuse the existing `useScaling` hook from `@/design-system` before writing any layout or sizing logic.
- `verticalScale`, `scale`, and `moderateScale` from `useScaling` are the only approved scaling mechanisms for responsive geometry.
- Never create a separate responsive scaling system.
- Never use raw `Dimensions.get('window')` for responsive geometry.
- Typography tokens from the design system must be used as-is; scale them only when source analysis confirms they are raw geometry values, not design-system tokens.
- When in doubt about whether a value is a design-system token or eligible raw geometry, **stop and ask** rather than scaling it.

### Date and Calendar Handling
- Always inspect and reuse `src/utils/dateUtils.ts` before writing any date logic.
- **Approved utilities to reuse:**
  - `todayISO()` — current date as `YYYY-MM-DD`
  - `formatDateToISO(date)` — JS `Date` -> `YYYY-MM-DD`
  - `parseISODateLocal(str)` — safe `YYYY-MM-DD` -> local JS `Date`
  - `isValidISODate(str)` — validates `YYYY-MM-DD` format
  - `addDays(str, n)` — calendar-safe day arithmetic
  - `isAfter`, `isBetween`, `nowISO`, `generateId`
- **Never** use `new Date("YYYY-MM-DD")` for calendar-date handling (parses as UTC midnight, causing day-shift in negative-offset timezones).
- **Never** use `Date.parse("YYYY-MM-DD")` for calendar-date handling.
- For calendar-string comparisons, always compare `YYYY-MM-DD` strings lexicographically rather than converting to timestamps.

### UI Components
- Inspect `src/presentation/components/ui/` and `src/presentation/components/` before creating a new component.
- Reuse `Text`, `Heading`, `Button`, `AlertModal`, `BottomPickerModal`, `WheelPicker`, `DatePickerModal`, and other existing shared components.
- Follow the existing design system (`@/design-system`) for colors, spacing, typography, and border-radius tokens.

### Domain Logic
- Reuse domain use-cases in `src/domain/use-cases/` before duplicating business logic in presentation layers.
- Reuse domain services in `src/domain/services/` before writing validation logic in components or hooks.
- Never duplicate cycle, log, or prediction logic outside the domain layer.

### State Management
- Reuse existing Zustand stores: `useDailyLogStore`, `useCycleStore`, `useContentStore`, `useUserProfileStore`.
- Follow existing store patterns (selectors, actions, persistence) before introducing new state patterns.

### WheelPicker Contract (Protected)
- `WheelPicker.tsx`'s exported constants `ITEM_HEIGHT` and `LIST_HEIGHT` form a structural contract used by `MonthYearPicker`, `TimePickerModal`, and `DatePickerModal`.
- Do not modify these constants without explicit user approval and a compatibility audit of all consumers.

## Enforcement

This rule applies to:
- New feature implementations
- Bug fixes
- Refactors
- UI changes
- Adding tests
- Any code change that touches shared infrastructure

Skipping the Reuse Audit is not permitted. If time pressure is cited as a reason to skip it, that is not an acceptable justification.

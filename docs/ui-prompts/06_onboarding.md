# Screen: Onboarding Flow

**Route:** `/onboarding`  
**Files:** `app/onboarding/_layout.tsx`, `app/onboarding/index.tsx`, `app/onboarding/name.tsx`, `app/onboarding/cycle.tsx`, `app/onboarding/last-period.tsx`, `app/onboarding/goal.tsx`, `app/onboarding/complete.tsx`  
**Stitch Project:** `3929023419273108988`  
**Status:** ✅ Design Generated | 🔲 Not Implemented  
**Milestone:** Phase 2 (v0.7-dashboard)

---

## Steps

| Step | Screen | Route |
|---|---|---|
| 1 | Welcome | `/onboarding/` |
| 2 | Name (optional) | `/onboarding/name` |
| 3 | Cycle info | `/onboarding/cycle` |
| 4 | Last period | `/onboarding/last-period` |
| 5 | Primary goal | `/onboarding/goal` |
| 6 | Complete | `/onboarding/complete` |

---

## Acceptance Criteria

### Flow
- [ ] Each step is a separate route in the onboarding stack
- [ ] Progress dots at top show current position
- [ ] 'Continue' advances; 'Skip' (where applicable) skips the current step
- [ ] Back navigation returns to previous step
- [ ] Cannot complete onboarding without: last period date + primary goal
- [ ] All other fields are optional

### Data Collection
- [ ] Each step saves progressively to `useOnboardingStore` (temp state)
- [ ] On Step 6 ('Complete'), all collected data is committed via `IUserProfileRepository.save()` and `ICycleRepository.save()`
- [ ] `profile.onboardingCompleted = true` set on commit
- [ ] If onboarding is interrupted and restarted, partial data is preserved

### Navigation Gate
- [ ] Root layout checks `profile.onboardingCompleted` on app launch
- [ ] If false → redirect to `/onboarding`
- [ ] If true → show `/(tabs)`
- [ ] Check is performed after DB is initialized — loading screen shown first

### Step 4 — Last Period
- [ ] Calendar picker allows selecting any past date
- [ ] Cannot select a future date
- [ ] 'My period is currently active' toggle marks the cycle as ongoing (no endDate)
- [ ] If active, the start date is used to create an open CycleEntry

### Step 5 — Goal
- [ ] Exactly one goal must be selected before Continue is enabled
- [ ] Selected goal card shows purple border + tinted background

---

## Component Mapping

| UI Element | Component | Token |
|---|---|---|
| Progress dots | `OnboardingProgress` | `colors.brand.primary` (active) |
| Goal selection card | `GoalCard` | `colors.brand.primary` (selected border) |
| Date picker | `CalendarDatePicker` | `colors.brand.primary` |
| Number stepper | `NumberStepper` | `colors.surface` |
| Continue button | `PrimaryButton` | `colors.brand.primary` |
| Skip link | `TextButton` | `colors.text.link` |

---

## Data Dependencies

```typescript
useOnboardingStore()  → tempProfile (collected during flow)
IUserProfileRepository.save()
ICycleRepository.save()  (if last period date provided)
```

---

## Architecture Notes

- Onboarding is a **separate route group** — not part of tab navigation
- The root `_layout.tsx` handles the gate logic
- Onboarding state uses a **separate temporary store** (not profile store) to avoid committing partial data
- On completion, the temp store is flushed and profile store is populated

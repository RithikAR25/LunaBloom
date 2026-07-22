# Screen: Dashboard (Home Tab)

**Route:** `/(tabs)/index`  
**File:** `app/(tabs)/index.tsx`  
**Stitch Screen ID:** `94145823cd5e44bba0e333674cd272d2`  
**Stitch Project:** `3929023419273108988`  
**Status:** ✅ Design Generated | 🔲 Not Implemented  
**Milestone:** Phase 2 (v0.7-dashboard)

---

## Stitch Prompt Used

> LunaBloom Dashboard Screen — dark mode mobile app for women's menstrual cycle tracking.
>
> Layout (scroll view, safe area aware):
>
> 1. TOP HEADER (non-scrolling): Left greeting 'Good morning, Meera'. Right: Avatar + notification bell.
> 2. CYCLE PHASE HERO CARD: Gradient #7C3AED→#1E1E35, pill badge 'Luteal Phase' + moon icon, large 'Day 21', progress bar, 3 bottom stats.
> 3. QUICK ACTIONS ROW: 2×2 grid — Start Period (rose/water-drop), Log Today (purple/pencil), Add Note (teal/note), Log Intimacy (amber/heart).
> 4. TODAY'S LOG CARD: Mood chips, symptom summary, energy + sleep bars, Edit Log link.
> 5. HEALTH TIP CARD: Teal accent border, phase-specific tip, Learn More link.
> 6. RECENT CYCLES MINI-CHART: Last 3–4 cycles as bars with day labels.

---

## Acceptance Criteria

### Layout
- [ ] Header is non-scrolling (sticky); body scrolls below it
- [ ] Hero card occupies full width minus 16pt horizontal margins
- [ ] Quick actions display as 2×2 grid on all screen sizes
- [ ] All cards have 12pt corner radius and surface #16162A background
- [ ] Bottom padding clears the tab bar (80pt minimum)

### Hero Card
- [ ] Displays current cycle phase name and correct phase icon (moon=luteal, leaf=follicular, sun=ovulatory, drop=menstrual)
- [ ] Cycle day number is prominent (display-size text)
- [ ] Progress bar position reflects `(cycleDay / avgCycleLength) * 100%`
- [ ] Three stats: period countdown, cycle day, cycle length — all from store
- [ ] Gradient is always purple→dark regardless of phase (phase only changes the pill badge color)

### Quick Actions
- [ ] 'Start Period' only visible if no active period; 'End Period' replaces it if active
- [ ] 'Log Today' navigates to `/(tabs)/log` with today's date pre-selected
- [ ] 'Add Note' opens health notes bottom sheet
- [ ] 'Log Intimacy' opens intercourse log bottom sheet
- [ ] Each button has `accessibilityRole="button"` and `accessibilityLabel`

### Data
- [ ] All data sourced from `useCycleStore` and `useDailyLogStore` — no local component state for domain data
- [ ] Greeting uses profile preferred name from `useProfileStore`
- [ ] Empty state shown if no cycles logged: "Welcome to LunaBloom. Log your first period to begin."
- [ ] Loading state shown while stores are initializing

### Accessibility
- [ ] All interactive elements: min 44×44pt touch target
- [ ] Phase indicated by color AND icon (never color alone)
- [ ] Notification bell has `accessibilityLabel="Notifications"`

---

## Component Mapping

| UI Element | Component | Design Token |
|---|---|---|
| Screen container | `SafeAreaView` | `colors.background` |
| Phase hero card | `CyclePhaseHeroCard` | `colors.surface`, gradient via design |
| Phase pill badge | `PhaseBadge` | `colors.phase[phase]` |
| Progress bar | `CycleProgressBar` | `colors.brand.primary` |
| Quick action button | `QuickActionButton` | Phase/action-specific tint |
| Today's log card | `TodayLogCard` | `colors.surface` |
| Mood chip | `MoodChip` | `colors.brand.primary` (selected) |
| Health tip card | `HealthTipCard` | `colors.brand.secondary` (left border) |
| Mini cycle chart | `CycleHistoryChart` | `colors.brand.primary` bars |

---

## Data Dependencies

```typescript
// Stores required
useCycleStore()      → cycles, activeCycle, currentPhase, cycleDay
useDailyLogStore()   → todayLog
useProfileStore()    → preferredName
usePredictionStore() → nextPeriodPrediction, fertileWindow
```

---

## Architecture Notes

- Screen component is **thin** — reads stores, passes props to child components
- `CyclePhaseHeroCard` receives `phase`, `cycleDay`, `totalDays`, `stats` as props
- No business logic in this file — prediction logic is in `CyclePredictionService`
- `navigateTo` calls use Expo Router's `router.push()`, never direct navigation

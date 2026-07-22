# Screen: Calendar

**Route:** `/(tabs)/calendar`  
**File:** `app/(tabs)/calendar.tsx`  
**Stitch Project:** `3929023419273108988`  
**Status:** ✅ Design Generated | 🔲 Not Implemented  
**Milestone:** Phase 1 (v0.8-calendar)

---

## Acceptance Criteria

### Calendar Grid
- [ ] Displays current month as a 7-column grid (Mon–Sun)
- [ ] Left/right arrows navigate months; 'Today' button returns to current month
- [ ] Each day cell: 44×44pt minimum touch target
- [ ] Period days: rose tinted background + water-drop icon below number
- [ ] Fertile window: amber tint, 40% opacity background
- [ ] Ovulation day: amber background + star icon
- [ ] Luteal days: soft purple tinted background
- [ ] Predicted period: dashed rose border
- [ ] Today: white ring around number
- [ ] Days with logged data: small purple dot below number
- [ ] Selected day: `colors.brand.primary` solid background, white text
- [ ] Phase colors always paired with icons — never color alone

### Day Detail Panel
- [ ] Tapping a day opens a detail panel (bottom sheet style)
- [ ] Shows date, phase label, and any logged data for that day
- [ ] 'Log This Day' button pre-fills log screen with that date
- [ ] 'View Full Log' text link navigates to log detail

### Data
- [ ] Calendar state derived from `useCycleStore` — no local computation
- [ ] Phase calculation for each day uses `CyclePredictionService.getPhaseForDate()`
- [ ] Predicted days clearly distinguished from confirmed days

---

## Component Mapping

| UI Element | Component | Token |
|---|---|---|
| Month header | `MonthHeader` | `colors.text.primary` |
| Day cell | `CalendarDayCell` | Phase color + state variant |
| Phase indicator dot | `PhaseIndicatorDot` | `colors.phase[phase]` |
| Bottom sheet panel | `DayDetailPanel` | `colors.surfaceElevated` |
| Phase badge | `PhaseBadge` | `colors.phase[phase]` |
| Log button | `PrimaryButton` | `colors.brand.primary` |

---

## Data Dependencies

```typescript
useCycleStore()      → cycles, activeCycle
useDailyLogStore()   → logsMap (keyed by date)
usePredictionStore() → predictedDays, fertileWindow, ovulationDay
```

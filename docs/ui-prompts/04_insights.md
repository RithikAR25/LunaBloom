# Screen: Insights

**Route:** `/(tabs)/insights`  
**File:** `app/(tabs)/insights.tsx`  
**Stitch Project:** `3929023419273108988`  
**Status:** ✅ Design Generated | 🔲 Not Implemented  
**Milestone:** Phase 3 (v0.9-cycle-tracking)

---

## Acceptance Criteria

### Gate: Minimum Data
- [ ] If fewer than 2 complete cycles: show locked state with message 'Track 2 complete cycles to unlock your insights'
- [ ] Locked card shows blurred content + lock icon
- [ ] Shows progress indicator: 'You have 1 of 2 cycles needed'

### Cycle Overview Card
- [ ] Shows: average length, shortest, longest across all cycles
- [ ] Values update as more cycles are logged
- [ ] Calculation done in `CycleInsightsService` — not in component

### Charts (Victory Native)
- [ ] Cycle length history: bar chart, last 5 cycles, purple bars, green average line
- [ ] Period duration: bar chart, last 5 cycles, rose bars
- [ ] All charts have accessible labels (`accessibilityLabel` on each bar)
- [ ] Charts handle 0, 1, and 2+ data points gracefully

### Symptoms Frequency
- [ ] Top 5 symptoms ranked by occurrence across all cycles
- [ ] Each shown as a labeled progress bar (teal fill)
- [ ] Tap on a symptom shows phase correlation if data available

### Mood Patterns
- [ ] Grid of 4 phase cards, each showing top 2 moods for that phase
- [ ] Phase cards use their respective phase color tint
- [ ] 'Not enough data' shown per-phase if fewer than 2 occurrences

### Fertility (TTC users only)
- [ ] Section only shown if `profile.primaryGoal === 'TRY_TO_CONCEIVE'`
- [ ] Timeline bar showing predicted fertile window for next cycle

---

## Component Mapping

| UI Element | Component | Token |
|---|---|---|
| Stat block | `StatBlock` | `colors.text.primary / secondary` |
| Bar chart | `CycleLengthChart` (Victory) | `colors.brand.primary` |
| Progress bar | `FrequencyBar` | `colors.brand.secondary` |
| Phase card | `PhaseInsightCard` | `colors.phase[phase]` tint |
| Lock overlay | `LockedInsight` | `colors.surface` + blur |

---

## Data Dependencies

```typescript
useCycleStore()      → cycles (all)
useDailyLogStore()   → allLogs
CycleInsightsService → averageLength, symptomFrequency, moodByPhase
useProfileStore()    → primaryGoal (for fertility section gate)
```

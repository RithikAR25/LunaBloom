# Screen: Daily Log

**Route:** `/(tabs)/log`  
**File:** `app/(tabs)/log.tsx`  
**Stitch Project:** `3929023419273108988`  
**Status:** ✅ Design Generated | 🔲 Not Implemented  
**Milestone:** Phase 2 (v0.9-cycle-tracking)

---

## Acceptance Criteria

### Flow Section
- [ ] Only shown when an active period exists OR when the selected date is a period day
- [ ] 5 options: SPOTTING | LIGHT | MEDIUM | HEAVY | VERY HEAVY
- [ ] Selected option highlighted in rose color
- [ ] 'What does this mean?' expands inline explanation for each option
- [ ] Flow value persisted to `DailyLog.flowIntensity`

### Mood & Symptoms
- [ ] Mood chips: multi-select, max 5 at once
- [ ] Symptom chips: multi-select, unlimited
- [ ] Both support custom additions
- [ ] Selected chips fill with correct color (mood=purple, symptoms=teal)
- [ ] Selections persisted to junction tables via repository

### Wellbeing
- [ ] Pain level: 1–10 slider with haptic feedback at each integer
- [ ] Energy: 5-dot selector
- [ ] Sleep quality: 5-star selector
- [ ] Sleep hours: stepper with 0.5h increments
- [ ] Water intake: stepper with 0.25L increments

### Save Behaviour
- [ ] 'Save Log' button fixed at bottom, always visible
- [ ] Save calls `useDailyLogStore().saveLog()`
- [ ] On success: haptic success feedback + brief success state on button
- [ ] On error: inline error message, button resets
- [ ] Existing log for selected date is pre-filled on load

### Accessibility
- [ ] All selectors keyboard accessible (accessible via `accessibilityRole`)
- [ ] Slider has `accessibilityValue`
- [ ] Each chip has `accessibilityState={{ selected }}`

---

## Component Mapping

| UI Element | Component | Token |
|---|---|---|
| Flow selector | `FlowIntensitySelector` | `colors.phase.menstrual` (selected) |
| Mood chip | `SelectableChip` variant=mood | `colors.brand.primary` (selected) |
| Symptom chip | `SelectableChip` variant=symptom | `colors.brand.secondary` (selected) |
| Pain slider | `RangeSlider` | `colors.brand.primary` |
| Energy dots | `DotRating` | `colors.brand.primary` |
| Save button | `PrimaryButton` | `colors.brand.primary` |
| Section card | `SectionCard` | `colors.surface` |

---

## Data Dependencies

```typescript
useDailyLogStore()   → todayLog, saveLog, updateLog
useCycleStore()      → activeCycle (to show/hide flow section)
useSymptomStore()    → predefinedSymptoms, customSymptoms
```

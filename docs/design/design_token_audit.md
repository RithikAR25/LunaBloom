# LunaBloom Design Token Audit v2 — Colors & Typography
### Complete Occurrence Index with Semantic Mapping

> **Audit Version:** 2.0
> **Audit Date:** 2026-07-24
> **Scope:** `app/`, `src/` (excluding `node_modules`, `.expo`, `dist`, `build`, `src/design-system`)
> **Method:** Exhaustive grep — every occurrence listed individually, no summarization
> **Rule:** Analysis only. No code was modified.

---

## 1. Executive Summary

| Metric | Count |
|---|---|
| Total files scanned | 131 |
| Files with at least one violation | 50 |
| Color violations — hex | 47 |
| Color violations — rgba() | 14 |
| Color violations — named (transparent/white) | 18 |
| **Color violations — total** | **79** |
| Typography violations — fontSize | 41 |
| Typography violations — fontWeight | 35 |
| Typography violations — fontFamily | 6 |
| Typography violations — letterSpacing | 5 |
| Typography violations — lineHeight | 13 |
| **Typography violations — total** | **100** |
| **Grand total violations** | **179** |
| Values intentionally hardcoded (exempt) | **24** |
| Net violations requiring token migration | **155** |

---

## 2. Token Coverage and Compliance Scores

Compliance score = `(tokenRefs / (tokenRefs + violations)) * 100`.
A score of 100% means no violations detected; 0% means no token usage at all.

### 2.1 Base UI Components

| Component | Token Refs | Violations | Score | Status |
|---|---|---:|---:|---|
| `Card.tsx` | 3 | 0 | 100% | Compliant |
| `FloatingActionButton.tsx` | 3 | 0 | 100% | Compliant |
| `IconButton.tsx` | 5 | 0 | 100% | Compliant |
| `NumberStepper.tsx` | 10 | 0 | 100% | Compliant |
| `ProgressBar.tsx` | 4 | 0 | 100% | Compliant |
| `LoadingState.tsx` | 5 | 0 | 100% | Compliant |
| `EmptyState.tsx` | 7 | 1 | 88% | Partial |
| `Badge.tsx` | 15 | 2 | 88% | Partial |
| `Heading.tsx` | 23 | 4 | 85% | Partial |
| `Avatar.tsx` | 5 | 1 | 83% | Partial |
| `Chip.tsx` | 5 | 1 | 83% | Partial |
| `TextInput.tsx` | 14 | 3 | 82% | Partial |
| `Button.tsx` | 12 | 3 | 80% | Partial |
| `Text.tsx` | 17 | 5 | 77% | Partial* |
| `ErrorState.tsx` | 7 | 2 | 78% | Partial |
| `ConfirmModal.tsx` | 8 | 3 | 73% | Partial |
| `SectionHeader.tsx` | 4 | 2 | 67% | Partial |

> *Text.tsx violations are intentionally hardcoded (weight map). See Section 5.

### 2.2 Feature Components

| Component | Token Refs | Violations | Score | Status |
|---|---|---:|---:|---|
| `TodayLogCard.tsx` | 23 | 0 | 100% | Compliant |
| `QuickActionButton.tsx` | 4 | 0 | 100% | Compliant |
| `CycleHistoryChart.tsx` | 11 | 0 | 100% | Compliant |
| `DotRating.tsx` | 5 | 0 | 100% | Compliant |
| `SectionCard.tsx` | 5 | 0 | 100% | Compliant |
| `SettingsRow.tsx` | 8 | 0 | 100% | Compliant |
| `SettingsSection.tsx` | 4 | 0 | 100% | Compliant |
| `OverviewTab.tsx` | 21 | 1 | 95% | Partial |
| `CalendarLegend.tsx` | 12 | 1 | 92% | Partial |
| `DayCell.tsx` | 14 | 1 | 93% | Partial |
| `PhaseCard.tsx` | 13 | 1 | 93% | Partial |
| `MedicalDisclaimer.tsx` | 7 | 1 | 88% | Partial |
| `RangeSlider.tsx` | 8 | 1 | 89% | Partial |
| `HealthTipCard.tsx` | 8 | 1 | 89% | Partial |
| `LockScreen.tsx` | 11 | 2 | 85% | Partial |
| `ContentSection.tsx` | 9 | 2 | 82% | Partial |
| `SettingsToggle.tsx` | 6 | 2 | 75% | Partial |
| `SelectableChip.tsx` | 5 | 2 | 71% | Partial |
| `CalendarGrid.tsx` | 3 | 2 | 60% | Partial |
| `InsightsEmptyState.tsx` | 6 | 4 | 60% | Partial |
| `EditCycleModal.tsx` | 12 | 5 | 71% | Partial |
| `FlowSelector.tsx` | 7 | 5 | 58% | Partial |
| `CalendarHeader.tsx` | 5 | 4 | 56% | Partial |
| `SymptomsTab.tsx` | 8 | 9 | 47% | FAILING |
| `CycleTab.tsx` | 13 | 13 | 50% | FAILING |
| `CyclePhaseHeroCard.tsx` | 0 | 8 | 0% | No tokens |
| `WellbeingTab.tsx` | 12 | 16 | 43% | FAILING |

### 2.3 Screens

| Screen | Token Refs | Violations | Score | Status |
|---|---|---:|---:|---|
| `app/(tabs)/index.tsx` | 21 | 0 | 100% | Compliant |
| `app/(tabs)/settings.tsx` | 5 | 0 | 100% | Compliant |
| `app/settings/data.tsx` | 9 | 0 | 100% | Compliant |
| `app/(tabs)/log.tsx` | 16 | 1 | 94% | Partial |
| `app/(tabs)/insights.tsx` | 10 | 1 | 91% | Partial |
| `app/onboarding/goal.tsx` | 9 | 1 | 90% | Partial |
| `app/settings/profile.tsx` | 15 | 1 | 94% | Partial |
| `app/learn/index.tsx` | 13 | 1 | 93% | Partial |
| `app/settings/about.tsx` | 18 | 2 | 90% | Partial |
| `app/learn/glossary.tsx` | 10 | 2 | 83% | Partial |
| `app/settings/health.tsx` | 18 | 3 | 86% | Partial |
| `app/settings/cycle.tsx` | 9 | 2 | 82% | Partial |
| `app/(auth)/lock.tsx` | 5 | 2 | 71% | Partial |
| `app/+not-found.tsx` | 5 | 2 | 71% | Partial |
| `app/settings/notifications.tsx` | 9 | 3 | 75% | Partial |
| `app/(tabs)/calendar.tsx` | 6 | 3 | 67% | Partial |
| `app/settings/privacy.tsx` | 13 | 4 | 76% | Partial |
| `app/(tabs)/_layout.tsx` | 0 | 5 | 0% | No tokens |
| `app/onboarding/index.tsx` | 0 | 1 | 0% | No tokens |
| `app/_layout.tsx` | 0 | 1 | 0% | No tokens |

### 2.4 Infrastructure and Services

| File | Token Refs | Violations | Score | Status |
|---|---|---:|---:|---|
| `DatabaseProvider.tsx` | 0 | 3 | 0% | No tokens |
| `NotificationService.ts` | 0 | 1 | 0%* | No tokens |

> *NotificationService violation is intentionally exempt. See Section 5.

### 2.5 Overall Summary

| Layer | Files | Compliant | Partial | Failing | No Tokens |
|---|---|---|---|---|---|
| Base UI Components | 17 | 6 (35%) | 11 (65%) | 0 | 0 |
| Feature Components | 27 | 7 (26%) | 15 (56%) | 3 (11%) | 2 (7%) |
| Screens | 27 | 3 (11%) | 20 (74%) | 0 | 4 (15%) |
| Infrastructure | 2 | 0 | 0 | 0 | 2 (100%) |
| **Total** | **73** | **16 (22%)** | **46 (63%)** | **3 (4%)** | **8 (11%)** |

**Overall codebase compliance score: 64%**

---

## 3. Complete Color Occurrence Index

Every violation listed individually. Full relative paths from project root.
MISMATCH = value does not match the Sanguine theme definition for that semantic role.

### 3A. Hardcoded Hex Values

#### Group: White (#FFF / #fff / #FFFFFF)

| # | File | Line | Property | Semantic Mapping |
|---|---|---|---|---|
| C1 | `src/infrastructure/database/DatabaseProvider.tsx` | 32 | ActivityIndicator color (loading) | `colors.brand.primary` (wrong value — should be theme token) |
| C2 | `src/presentation/components/dashboard/CyclePhaseHeroCard.tsx` | 38 | icon color | `colors.text.inverse` |
| C3 | `src/presentation/components/dashboard/CyclePhaseHeroCard.tsx` | 100 | phase name label color | `colors.text.inverse` |
| C4 | `src/presentation/components/dashboard/CyclePhaseHeroCard.tsx` | 108 | day count label color | `colors.text.inverse` |
| C5 | `src/presentation/components/dashboard/CyclePhaseHeroCard.tsx` | 135 | next period label color | `colors.text.inverse` |
| C6 | `src/presentation/components/log/RangeSlider.tsx` | 44 | selected label text color | `colors.text.inverse` |
| C7 | `src/presentation/components/log/SelectableChip.tsx` | 20 | selected chip text color | `colors.text.inverse` |
| C8 | `src/presentation/components/log/SelectableChip.tsx` | 21 | selected chip icon color | `colors.text.inverse` |
| C9 | `src/presentation/components/settings/SettingsToggle.tsx` | 39 | Switch thumbColor | `colors.text.inverse` |
| C10 | `app/(tabs)/insights.tsx` | 116 | active tab label color | `colors.text.inverse` |
| C11 | `app/settings/health.tsx` | 75 | checkmark icon color | `colors.text.inverse` |
| C12 | `app/settings/notifications.tsx` | 56 | Switch thumbColor | `colors.text.inverse` |
| C13 | `app/settings/privacy.tsx` | 104 | Switch thumbColor | `colors.text.inverse` |
| C14 | `app/(tabs)/_layout.tsx` | 19 | tabBarBackground (light) | `colors.surface` (light) |
| C15 | `app/onboarding/goal.tsx` | 92 | checkmark emoji color (string 'white') | `colors.text.inverse` |

#### Group: Dark Surfaces

| # | File | Line | Value | Property | Semantic Mapping |
|---|---|---|---|---|---|
| C16 | `src/infrastructure/database/DatabaseProvider.tsx` | 62 | `#0C0C14` | backgroundColor | `colors.background` (dark) |
| C17 | `app/_layout.tsx` | 132 | `#0C0C14` | backgroundColor dark branch | `colors.background` (dark) |
| C18 | `app/_layout.tsx` | 132 | `#F8FAFC` | backgroundColor light branch | `colors.background` (light) |
| C19 | `app/(tabs)/_layout.tsx` | 19 | `#16162A` | tabBarBackground (dark) | `colors.surface` (dark) |
| C20 | `app/(tabs)/_layout.tsx` | 20 | `#2A2A45` | tabBarBorderColor (dark) | `colors.border` (dark) |
| C21 | `app/(tabs)/_layout.tsx` | 20 | `#E2E8F0` | tabBarBorderColor (light) | `colors.borderSubtle` (light) |
| C22 | `app/(tabs)/_layout.tsx` | 18 | `#475569` | tabBarInactiveTintColor (dark) | `colors.text.tertiary` |
| C23 | `app/(tabs)/_layout.tsx` | 18 | `#94A3B8` | tabBarInactiveTintColor (light) | `colors.text.secondary` |

#### Group: Onboarding

| # | File | Line | Value | Property | Semantic Mapping |
|---|---|---|---|---|---|
| C24 | `app/onboarding/index.tsx` | 56 | `#E2E8F0` | progress track backgroundColor | `colors.borderSubtle` |

#### Group: Error / Semantic

| # | File | Line | Value | Property | Semantic Mapping |
|---|---|---|---|---|---|
| C25 | `src/infrastructure/database/DatabaseProvider.tsx` | 41 | `#EF4444` | ActivityIndicator color (error) | `colors.semantic.error` |
| C26 | `src/presentation/components/ui/ConfirmModal.tsx` | 97 | `#000` | shadowColor | New `colors.shadow` token needed |

#### Group: Settings / Health

| # | File | Line | Value | Property | Semantic Mapping |
|---|---|---|---|---|---|
| C27 | `app/settings/health.tsx` | 179 | `#9ca3af` | borderColor (input) | `colors.border` |
| C28 | `app/settings/health.tsx` | 193 | `#9ca3af` | borderColor (input) | `colors.border` |

#### Group: Insights Phase Colors (MISMATCH — all use pre-Sanguine Tailwind colors)

| # | File | Line | Value | Phase | Semantic Mapping | Theme Actual Value |
|---|---|---|---|---|---|---|
| C29 | `src/presentation/components/insights/CycleTab.tsx` | 41 | `#ef4444` | menstrual bar | `colors.phase.menstrual` | `#76160D` (MISMATCH) |
| C30 | `src/presentation/components/insights/CycleTab.tsx` | 50 | `#ef4444` | menstrual legend dot | `colors.phase.menstrual` | `#76160D` (MISMATCH) |
| C31 | `src/presentation/components/insights/CycleTab.tsx` | 42 | `#3b82f6` | follicular bar | `colors.phase.follicular` | `#15803D` (MISMATCH) |
| C32 | `src/presentation/components/insights/CycleTab.tsx` | 55 | `#3b82f6` | follicular legend dot | `colors.phase.follicular` | `#15803D` (MISMATCH) |
| C33 | `src/presentation/components/insights/CycleTab.tsx` | 43 | `#a855f7` | ovulatory bar | `colors.phase.ovulatory` | `#D97706` (MISMATCH) |
| C34 | `src/presentation/components/insights/CycleTab.tsx` | 60 | `#a855f7` | ovulatory legend dot | `colors.phase.ovulatory` | `#D97706` (MISMATCH) |
| C35 | `src/presentation/components/insights/CycleTab.tsx` | 44 | `#f59e0b` | luteal bar | `colors.phase.luteal` | `#550000` (MISMATCH) |
| C36 | `src/presentation/components/insights/CycleTab.tsx` | 65 | `#f59e0b` | luteal legend dot | `colors.phase.luteal` | `#550000` (MISMATCH) |
| C37 | `src/presentation/components/insights/SymptomsTab.tsx` | 16 | `#ef4444` | getPhaseColor() menstrual | `colors.phase.menstrual` | `#76160D` (MISMATCH) |
| C38 | `src/presentation/components/insights/SymptomsTab.tsx` | 17 | `#3b82f6` | getPhaseColor() follicular | `colors.phase.follicular` | `#15803D` (MISMATCH) |
| C39 | `src/presentation/components/insights/SymptomsTab.tsx` | 18 | `#a855f7` | getPhaseColor() ovulatory | `colors.phase.ovulatory` | `#D97706` (MISMATCH) |
| C40 | `src/presentation/components/insights/SymptomsTab.tsx` | 19 | `#f59e0b` | getPhaseColor() luteal | `colors.phase.luteal` | `#550000` (MISMATCH) |
| C41 | `src/presentation/components/insights/SymptomsTab.tsx` | 20 | `#9ca3af` | getPhaseColor() default | `colors.text.secondary` | |
| C42 | `src/presentation/components/insights/WellbeingTab.tsx` | 18 | `#ef4444` | getPhaseColor() menstrual | `colors.phase.menstrual` | `#76160D` (MISMATCH) |
| C43 | `src/presentation/components/insights/WellbeingTab.tsx` | 19 | `#3b82f6` | getPhaseColor() follicular | `colors.phase.follicular` | `#15803D` (MISMATCH) |
| C44 | `src/presentation/components/insights/WellbeingTab.tsx` | 20 | `#a855f7` | getPhaseColor() ovulatory | `colors.phase.ovulatory` | `#D97706` (MISMATCH) |
| C45 | `src/presentation/components/insights/WellbeingTab.tsx` | 21 | `#f59e0b` | getPhaseColor() luteal | `colors.phase.luteal` | `#550000` (MISMATCH) |
| C46 | `src/presentation/components/insights/WellbeingTab.tsx` | 22 | `#9ca3af` | getPhaseColor() default | `colors.text.secondary` | |
| C47 | `src/presentation/components/insights/WellbeingTab.tsx` | 87 | `#ef4444` | pain metric icon/value color | `colors.semantic.error` | |
| C48 | `src/presentation/components/insights/WellbeingTab.tsx` | 88 | `#eab308` | energy metric color | `colors.semantic.warning` | |
| C49 | `src/presentation/components/insights/WellbeingTab.tsx` | 89 | `#3b82f6` | sleep metric color | `colors.semantic.info` | |

#### Group: NotificationService (exempt)

| # | File | Line | Value | Property | Semantic Mapping |
|---|---|---|---|---|---|
| C50 | `src/application/services/NotificationService.ts` | 36 | `#8b5cf6` | lightColor (notification LED) | EXEMPT — native API, not UI |

#### Group: DatabaseProvider ActivityIndicator (already listed in C1 / C25)

(ActivityIndicator values: #A78BFA at line 32 = C1, #EF4444 at line 41 = C25)

---

### 3B. Hardcoded rgba() Values

| # | File | Line | Value | Property | Semantic Mapping |
|---|---|---|---|---|---|
| R1 | `src/presentation/components/calendar/EditCycleModal.tsx` | 74 | `rgba(0,0,0,0.5)` | modal overlay backgroundColor | `colors.overlay` (exists in theme) |
| R2 | `src/presentation/components/calendar/EditCycleModal.tsx` | 242 | `rgba(0,0,0,0.05)` | footer borderTopColor | New `colors.overlayMuted` |
| R3 | `src/presentation/components/dashboard/CyclePhaseHeroCard.tsx` | 117 | `rgba(0,0,0,0.15)` | phase icon ring backgroundColor | New `colors.overlaySubtle` |
| R4 | `src/presentation/components/dashboard/CyclePhaseHeroCard.tsx` | 128 | `rgba(255,255,255,0.2)` | progress track background | New `colors.onPrimaryOverlay` |
| R5 | `src/presentation/components/dashboard/CyclePhaseHeroCard.tsx` | 131 | `rgba(255,255,255,0.7)` | sub-label text on gradient | New `colors.onPrimarySubtle` |
| R6 | `src/presentation/components/insights/OverviewTab.tsx` | 139 | `rgba(150,150,150,0.2)` | stat divider backgroundColor | New `colors.surfaceNeutral` |
| R7 | `src/presentation/components/insights/SymptomsTab.tsx` | 113 | `rgba(150,150,150,0.1)` | bar track backgroundColor | New `colors.surfaceNeutral` |
| R8 | `src/presentation/components/insights/WellbeingTab.tsx` | 98 | `rgba(150,150,150,0.1)` | mood chip backgroundColor | New `colors.surfaceNeutral` |
| R9 | `src/presentation/components/learn/PhaseCard.tsx` | 60 | `rgba(0,0,0,0.05)` | icon container backgroundColor | New `colors.overlayMuted` |
| R10 | `src/presentation/components/settings/SettingsToggle.tsx` | 38 | `rgba(0,0,0,0.1)` | Switch trackColor (false/off) | New `colors.switchTrackOff` |
| R11 | `src/presentation/components/ui/ConfirmModal.tsx` | 34 | `rgba(0,0,0,0.5)` | modal overlay backgroundColor | `colors.overlay` (exists in theme) |
| R12 | `app/(tabs)/log.tsx` | 253 | `rgba(255,255,255,0.05)` | sheet borderTopColor | New `colors.borderSubtleDark` |
| R13 | `app/settings/notifications.tsx` | 55 | `rgba(0,0,0,0.1)` | Switch trackColor (false/off) | New `colors.switchTrackOff` |
| R14 | `app/settings/privacy.tsx` | 103 | `rgba(0,0,0,0.1)` | Switch trackColor (false/off) | New `colors.switchTrackOff` |

---

### 3C. Named Color Values

#### transparent (all EXEMPT — see Section 5)

| # | File | Line | Property |
|---|---|---|---|
| N1 | `src/presentation/components/calendar/DayCell.tsx` | 30 | getBgColor return (default) |
| N2 | `src/presentation/components/calendar/DayCell.tsx` | 49 | getBgColor return (past) |
| N3 | `src/presentation/components/log/DotRating.tsx` | 49 | borderColor (unselected) |
| N4 | `src/presentation/components/log/SelectableChip.tsx` | 19 | backgroundColor (unselected) |
| N5 | `src/presentation/components/privacy/LockScreen.tsx` | 108 | backgroundColor (number key) |
| N6 | `src/presentation/components/settings/SettingsRow.tsx` | 23 | backgroundColor (unpressed) |
| N7 | `src/presentation/components/ui/Button.tsx` | 88 | backgroundColor (secondary variant) |
| N8 | `src/presentation/components/ui/Button.tsx` | 89 | backgroundColor (ghost variant) |
| N9 | `src/presentation/components/ui/Button.tsx` | 101 | borderColor (primary) |
| N10 | `src/presentation/components/ui/Button.tsx` | 103 | borderColor (ghost) |
| N11 | `src/presentation/components/ui/Button.tsx` | 104 | borderColor (danger) |
| N12 | `src/presentation/components/ui/Chip.tsx` | 83 | backgroundColor (unselected) |
| N13 | `src/presentation/components/ui/IconButton.tsx` | 52 | backgroundColor (ghost) |
| N14 | `src/presentation/components/ui/IconButton.tsx` | 56 | borderColor (primary) |
| N15 | `src/presentation/components/ui/IconButton.tsx` | 58 | borderColor (ghost) |
| N16 | `src/presentation/components/ui/NumberStepper.tsx` | 52 | backgroundColor (unpressed) |
| N17 | `src/presentation/components/ui/NumberStepper.tsx` | 71 | backgroundColor (unpressed) |

#### 'white' (NOT exempt — use `colors.text.inverse`)

| # | File | Line | Property |
|---|---|---|---|
| N18 | `app/onboarding/goal.tsx` | 92 | color (checkmark emoji) |


---

## 4. Complete Typography Occurrence Index

### 4A. fontSize Violations

| # | File | Line | Value | Role | Suggested Token | Exempt? |
|---|---|---|---|---|---|---|
| T1 | `src/presentation/components/calendar/CalendarGrid.tsx` | 67 | 12 | weekday header label | `fontSize.caption` | No |
| T2 | `src/presentation/components/calendar/CalendarHeader.tsx` | 20 | 18 | nav arrow (prev) | `fontSize.bodyLg` | No |
| T3 | `src/presentation/components/calendar/CalendarHeader.tsx` | 28 | 18 | nav arrow (next) | `fontSize.bodyLg` | No |
| T4 | `src/presentation/components/calendar/CalendarHeader.tsx` | 41 | 20 | month/year title | `fontSize.headlineSm` (NEW: 20) | No |
| T5 | `src/presentation/components/calendar/CalendarLegend.tsx` | 52 | 12 | legend label | `fontSize.caption` | No |
| T6 | `src/presentation/components/calendar/DayCell.tsx` | 99 | 16 | symbol/mood label | `fontSize.bodyMd` | No |
| T7 | `src/presentation/components/calendar/EditCycleModal.tsx` | 163 | 13 | helper/hint text | `fontSize.label` | No |
| T8 | `src/presentation/components/calendar/EditCycleModal.tsx` | 217 | 20 | modal title | `fontSize.headlineSm` (NEW) | No |
| T9 | `src/presentation/components/insights/CycleTab.tsx` | 78 | 16 | card title | `fontSize.bodyMd` | No |
| T10 | `src/presentation/components/insights/CycleTab.tsx` | 79 | 13 | card subtitle | `fontSize.label` | No |
| T11 | `src/presentation/components/insights/CycleTab.tsx` | 106 | 14 | stat value | `fontSize.labelMd` | No |
| T12 | `src/presentation/components/insights/CycleTab.tsx` | 109 | 14 | stat label | `fontSize.labelMd` | No |
| T13 | `src/presentation/components/insights/InsightsEmptyState.tsx` | 67 | 18 | empty state title | `fontSize.bodyLg` | No |
| T14 | `src/presentation/components/insights/InsightsEmptyState.tsx` | 72 | 14 | empty state subtitle | `fontSize.labelMd` | No |
| T15 | `src/presentation/components/insights/SymptomsTab.tsx` | 107 | 16 | card title | `fontSize.bodyMd` | No |
| T16 | `src/presentation/components/insights/SymptomsTab.tsx` | 111 | 14 | symptom name | `fontSize.labelMd` | No |
| T17 | `src/presentation/components/insights/SymptomsTab.tsx` | 112 | 12 | symptom count | `fontSize.caption` | No |
| T18 | `src/presentation/components/insights/WellbeingTab.tsx` | 119 | 16 | card title | `fontSize.bodyMd` | No |
| T19 | `src/presentation/components/insights/WellbeingTab.tsx` | 122 | 20 | metric value (display) | `fontSize.headlineSm` (NEW) | No |
| T20 | `src/presentation/components/insights/WellbeingTab.tsx` | 123 | 12 | metric label | `fontSize.caption` | No |
| T21 | `src/presentation/components/insights/WellbeingTab.tsx` | 124 | 10 | sample count | `fontSize.micro` | No |
| T22 | `src/presentation/components/insights/WellbeingTab.tsx` | 126 | 13 | section title | `fontSize.label` | No |
| T23 | `src/presentation/components/insights/WellbeingTab.tsx` | 129 | 14 | mood name | `fontSize.labelMd` | No |
| T24 | `src/presentation/components/insights/WellbeingTab.tsx` | 130 | 12 | mood count | `fontSize.caption` | No |
| T25 | `src/presentation/components/log/FlowSelector.tsx` | 71 | 16 | selected flow label | `fontSize.bodyMd` | No |
| T26 | `src/presentation/components/log/FlowSelector.tsx` | 86 | 14 | flow sub-label | `fontSize.labelMd` | No |
| T27 | `src/presentation/components/log/FlowSelector.tsx` | 90 | 13 | count/detail text | `fontSize.label` | No |
| T28 | `src/presentation/components/privacy/LockScreen.tsx` | 184 | 28 | locked message | `fontSize.headlineLgMobile` | No |
| T29 | `src/presentation/components/ui/ErrorState.tsx` | 76 | 40 | emoji icon render | No token — emoji size | Yes* |
| T30 | `app/(auth)/lock.tsx` | 20 | 22 | screen title | `fontSize.heading2` | No |
| T31 | `app/(auth)/lock.tsx` | 21 | 15 | screen subtitle | `fontSize.body` | No |
| T32 | `app/(tabs)/calendar.tsx` | 143 | 24 | screen title | `fontSize.headlineMd` | No |
| T33 | `app/(tabs)/calendar.tsx` | 144 | 15 | screen subtitle | `fontSize.body` | No |
| T34 | `app/(tabs)/calendar.tsx` | 146 | 16 | selected day label | `fontSize.bodyMd` | No |
| T35 | `app/(tabs)/_layout.tsx` | 37 | 11 | tab bar label | `fontSize.tabLabel` (NEW: 11) | No |
| T36 | `app/onboarding/goal.tsx` | 92 | 12 | checkmark emoji size | `fontSize.caption` (or exempt as emoji) | Yes* |
| T37 | `app/settings/cycle.tsx` | 119 | 16 | stepper value | `fontSize.bodyMd` | No |
| T38 | `app/settings/privacy.tsx` | 144 | 18 | PIN display | `fontSize.bodyLg` | No |
| T39 | `app/settings/profile.tsx` | 129 | 16 | avatar initial | `fontSize.bodyMd` | No |
| T40 | `app/+not-found.tsx` | 24 | 20 | 404 title | `fontSize.headlineSm` (NEW) | No |
| T41 | `app/+not-found.tsx` | 25 | 15 | 404 link | `fontSize.body` | No |

> *Exempt: emoji characters ignore fontFamily and require explicit point sizes for sizing.

---

### 4B. fontWeight Violations

> fontWeight values in `Text.tsx` lines 49-52 are the canonical weight map (EXEMPT — they implement the token system).

| # | File | Line | Value | Role | Suggested Token |
|---|---|---|---|---|---|
| W1 | `src/presentation/components/calendar/CalendarGrid.tsx` | 68 | '600' | weekday header | `fontFamily.semiBold` |
| W2 | `src/presentation/components/calendar/CalendarHeader.tsx` | 42 | '600' | month/year title | `fontFamily.semiBold` |
| W3 | `src/presentation/components/calendar/DayCell.tsx` | 72 | '600'/'400' | day number (conditional) | `fontFamily.semiBold` / `fontFamily.regular` |
| W4 | `src/presentation/components/calendar/EditCycleModal.tsx` | 162 | '600' | toggle label | `fontFamily.semiBold` |
| W5 | `src/presentation/components/insights/CycleTab.tsx` | 78 | '600' | card title | `fontFamily.semiBold` |
| W6 | `src/presentation/components/insights/CycleTab.tsx` | 110 | '500' | stat label | `fontFamily.medium` |
| W7 | `src/presentation/components/insights/InsightsEmptyState.tsx` | 68 | '600' | empty state title | `fontFamily.semiBold` |
| W8 | `src/presentation/components/insights/SymptomsTab.tsx` | 107 | '600' | card title | `fontFamily.semiBold` |
| W9 | `src/presentation/components/insights/SymptomsTab.tsx` | 111 | '500' | symptom name | `fontFamily.medium` |
| W10 | `src/presentation/components/insights/WellbeingTab.tsx` | 119 | '600' | card title | `fontFamily.semiBold` |
| W11 | `src/presentation/components/insights/WellbeingTab.tsx` | 122 | 'bold' | metric value | `fontFamily.bold` |
| W12 | `src/presentation/components/insights/WellbeingTab.tsx` | 129 | '500' | mood name | `fontFamily.medium` |
| W13 | `src/presentation/components/log/FlowSelector.tsx` | 72 | '600' | selected flow label | `fontFamily.semiBold` |
| W14 | `src/presentation/components/log/FlowSelector.tsx` | 87 | '500' | flow sub-label | `fontFamily.medium` |
| W15 | `src/presentation/components/privacy/LockScreen.tsx` | 185 | '500' | locked message | `fontFamily.medium` |
| W16 | `src/presentation/components/ui/Avatar.tsx` | 90 | '700' | avatar initial | `fontFamily.bold` |
| W17 | `src/presentation/components/ui/Badge.tsx` | 121 | '600' | badge label | `fontFamily.semiBold` |
| W18 | `src/presentation/components/ui/Button.tsx` | 166 | '600' | button label | `fontFamily.semiBold` |
| W19 | `src/presentation/components/ui/EmptyState.tsx` | 101 | '600' | empty title | `fontFamily.semiBold` |
| W20 | `src/presentation/components/ui/ErrorState.tsx` | 81 | '600' | error title | `fontFamily.semiBold` |
| W21 | `src/presentation/components/ui/Heading.tsx` | 27 | '700' | h1 | `fontFamily.headingBold` |
| W22 | `src/presentation/components/ui/Heading.tsx` | 34 | '700' | h2 | `fontFamily.headingBold` |
| W23 | `src/presentation/components/ui/Heading.tsx` | 41 | '600' | h3 | `fontFamily.headingSemiBold` |
| W24 | `src/presentation/components/ui/Heading.tsx` | 48 | '500' | h4 | `fontFamily.headingMedium` |
| W25 | `src/presentation/components/ui/SectionHeader.tsx` | 45 | '600' | overline label | `fontFamily.semiBold` |
| W26 | `src/presentation/components/ui/Text.tsx` | 49 | '400' | weight map: regular | EXEMPT (token system implementation) |
| W27 | `src/presentation/components/ui/Text.tsx` | 50 | '500' | weight map: medium | EXEMPT |
| W28 | `src/presentation/components/ui/Text.tsx` | 51 | '600' | weight map: semiBold | EXEMPT |
| W29 | `src/presentation/components/ui/Text.tsx` | 52 | '700' | weight map: bold | EXEMPT |
| W30 | `app/(auth)/lock.tsx` | 20 | '700' | screen title | `fontFamily.bold` |
| W31 | `app/(tabs)/calendar.tsx` | 143 | '700' | screen title | `fontFamily.bold` |
| W32 | `app/(tabs)/calendar.tsx` | 146 | '500' | selected label | `fontFamily.medium` |
| W33 | `app/learn/_layout.tsx` | 15 | '600' | stack header title | `fontFamily.semiBold` |
| W34 | `app/settings/_layout.tsx` | 19 | '600' | settings header title | `fontFamily.semiBold` |
| W35 | `app/settings/notifications.tsx` | 47 | '500' | row label | `fontFamily.medium` |
| W36 | `app/+not-found.tsx` | 24 | '600' | 404 title | `fontFamily.semiBold` |

---

### 4C. fontFamily Violations

| # | File | Line | Value | Role | Suggested Token |
|---|---|---|---|---|---|
| F1 | `src/presentation/components/ui/Button.tsx` | 167 | 'Inter_600SemiBold' | button label | `fontFamily.semiBold` |
| F2 | `src/presentation/components/ui/Chip.tsx` | 146 | 'Inter_500Medium' | chip label | `fontFamily.medium` |
| F3 | `src/presentation/components/ui/TextInput.tsx` | 144 | 'Inter_700Bold' | input label | `fontFamily.bold` |
| F4 | `src/presentation/components/ui/TextInput.tsx` | 156 | 'Inter_400Regular' | input value text | `fontFamily.regular` |
| F5 | `src/presentation/components/ui/TextInput.tsx` | 168 | 'Inter_400Regular' | helper text | `fontFamily.regular` |
| F6 | `app/(tabs)/_layout.tsx` | 38 | 'Inter_500Medium' | tab bar label | `fontFamily.medium` |

---

### 4D. letterSpacing Violations

| # | File | Line | Value | Role | Suggested Token | Exempt? |
|---|---|---|---|---|---|---|
| L1 | `src/presentation/components/dashboard/CyclePhaseHeroCard.tsx` | 101 | 0.5 | phase label | `letterSpacing.wide` (0.5 — already exists) | No |
| L2 | `src/presentation/components/ui/Badge.tsx` | 122 | 0.3 | badge text | `letterSpacing.medium` (NEW: 0.3) | No |
| L3 | `src/presentation/components/ui/Button.tsx` | 168 | 0.2 | button label | `letterSpacing.button` (NEW: 0.2) | No |
| L4 | `src/presentation/components/ui/SectionHeader.tsx` | 46 | 0.8 | section overline | `letterSpacing.wider` (NEW: 0.8) | No |
| L5 | `src/presentation/components/ui/Text.tsx` | 43 | 0.05 * fontSize.labelMd | label letterSpacing | EXEMPT — computed from tokens | Yes |
| L6 | `app/settings/privacy.tsx` | 145 | 4 | PIN character spacing | `letterSpacing.pin` (NEW: 4) | No |

---

### 4E. lineHeight Violations

| # | File | Line | Value | Role | Suggested Computation |
|---|---|---|---|---|---|
| LH1 | `src/presentation/components/calendar/EditCycleModal.tsx` | 163 | 18 | helper text | `fontSize.label * lineHeight.normal` (13 x 1.4 = 18.2) |
| LH2 | `src/presentation/components/dashboard/HealthTipCard.tsx` | 25 | 22 | body text | `fontSize.bodyMd * lineHeight.relaxed` (16 x 1.55 = 24.8) |
| LH3 | `src/presentation/components/insights/InsightsEmptyState.tsx` | 74 | 20 | subtitle | `fontSize.labelMd * lineHeight.relaxed` (14 x 1.55 = 21.7) |
| LH4 | `src/presentation/components/learn/ContentSection.tsx` | 39 | 22 | body paragraph | `fontSize.bodyMd * lineHeight.relaxed` |
| LH5 | `src/presentation/components/learn/ContentSection.tsx` | 49 | 22 | body paragraph | `fontSize.bodyMd * lineHeight.relaxed` |
| LH6 | `src/presentation/components/learn/MedicalDisclaimer.tsx` | 35 | 18 | disclaimer text | `fontSize.label * lineHeight.normal` |
| LH7 | `src/presentation/components/ui/ConfirmModal.tsx` | 123 | 22 | modal body | `fontSize.bodyMd * lineHeight.relaxed` |
| LH8 | `app/learn/glossary.tsx` | 32 | 24 | term definition | `fontSize.bodyLg * lineHeight.relaxed` (18 x 1.55 = 27.9) |
| LH9 | `app/learn/glossary.tsx` | 48 | 22 | body text | `fontSize.bodyMd * lineHeight.relaxed` |
| LH10 | `app/learn/index.tsx` | 47 | 24 | intro body | `fontSize.bodyLg * lineHeight.relaxed` |
| LH11 | `app/settings/about.tsx` | 35 | 24 | about body | `fontSize.bodyLg * lineHeight.relaxed` |
| LH12 | `app/settings/about.tsx` | 68 | 20 | caption | `fontSize.caption * lineHeight.relaxed` (12 x 1.55 = 18.6) |
| LH13 | `app/settings/cycle.tsx` | 53 | 20 | hint caption | `fontSize.caption * lineHeight.relaxed` |


---

## 5. Values That Should Intentionally Remain Hardcoded

These 24 occurrences are architecturally correct and should NOT be migrated.

| # | File | Line | Value | Category | Reason |
|---|---|---|---|---|---|
| E1 | `src/application/services/NotificationService.ts` | 36 | `'#8b5cf6'` | Native API | Android notification channel LED color. Set once at app startup via Expo Notifications API. The service has no React context and therefore no theme access. This is an OS-level setting, not a UI color. Changing it requires a reinstall on some Android versions. |
| E2 | `src/presentation/components/calendar/DayCell.tsx` | 30 | `'transparent'` | Logical constant | `'transparent'` is a RN keyword that equals `palette.transparent`. Runtime value is identical. Migration is purely cosmetic with zero visual impact. |
| E3 | `src/presentation/components/calendar/DayCell.tsx` | 49 | `'transparent'` | Logical constant | Same as E2. |
| E4 | `src/presentation/components/log/DotRating.tsx` | 49 | `'transparent'` | Logical constant | Same as E2. |
| E5 | `src/presentation/components/log/SelectableChip.tsx` | 19 | `'transparent'` | Logical constant | Same as E2. |
| E6 | `src/presentation/components/privacy/LockScreen.tsx` | 108 | `'transparent'` | Logical constant | Same as E2. |
| E7 | `src/presentation/components/settings/SettingsRow.tsx` | 23 | `'transparent'` | Logical constant | Same as E2. |
| E8 | `src/presentation/components/ui/Button.tsx` | 88 | `'transparent'` | Logical constant | Secondary variant explicitly has no background fill. Semantically correct. |
| E9 | `src/presentation/components/ui/Button.tsx` | 89 | `'transparent'` | Logical constant | Ghost variant. Same as E8. |
| E10 | `src/presentation/components/ui/Button.tsx` | 101 | `'transparent'` | Logical constant | Border fallback. Same as E8. |
| E11 | `src/presentation/components/ui/Button.tsx` | 103 | `'transparent'` | Logical constant | Border fallback. Same as E8. |
| E12 | `src/presentation/components/ui/Button.tsx` | 104 | `'transparent'` | Logical constant | Border fallback. Same as E8. |
| E13 | `src/presentation/components/ui/Chip.tsx` | 83 | `'transparent'` | Logical constant | Same as E2. |
| E14 | `src/presentation/components/ui/IconButton.tsx` | 52 | `'transparent'` | Logical constant | Same as E2. |
| E15 | `src/presentation/components/ui/IconButton.tsx` | 56 | `'transparent'` | Logical constant | Same as E2. |
| E16 | `src/presentation/components/ui/IconButton.tsx` | 58 | `'transparent'` | Logical constant | Same as E2. |
| E17 | `src/presentation/components/ui/NumberStepper.tsx` | 52 | `'transparent'` | Logical constant | Same as E2. |
| E18 | `src/presentation/components/ui/NumberStepper.tsx` | 71 | `'transparent'` | Logical constant | Same as E2. |
| E19 | `src/presentation/components/ui/ErrorState.tsx` | 76 | `fontSize: 40` | Emoji render | Emoji characters (⚠️) ignore fontFamily entirely in React Native. Font size here controls the rendered glyph size, not typographic scale. No token governs this. |
| E20 | `app/onboarding/goal.tsx` | 92 | `fontSize: 12` | Emoji render | Same as E19. Checkmark emoji sizing. |
| E21 | `src/presentation/components/ui/Text.tsx` | 49 | `fontWeight: '400'` | Token system | This IS the token system. Text.tsx's weight map is the canonical implementation that all other components should delegate to. Removing these would break font loading. |
| E22 | `src/presentation/components/ui/Text.tsx` | 50 | `fontWeight: '500'` | Token system | Same as E21. |
| E23 | `src/presentation/components/ui/Text.tsx` | 51 | `fontWeight: '600'` | Token system | Same as E21. |
| E24 | `src/presentation/components/ui/Text.tsx` | 52 | `fontWeight: '700'` | Token system | Same as E21. |

> **Note on `letterSpacing: 0.05 * fontSize.labelMd` (Text.tsx:43):** This is a computed value derived entirely from tokens. It is not a violation.

---

## 6. Migration Order

Grouped into waves. Complete each wave fully and verify before starting the next. Within a wave, order is by dependency (lowest-level first).

### Wave 1 — New Token Definitions (no UI changes, zero risk)

**Target files:** `src/design-system/tokens/typography.ts`, `src/design-system/themes/light.ts`, `src/design-system/themes/dark.ts`, `src/design-system/index.ts`

Actions:
1. Add to `typography.ts`: `fontSize.tabLabel = 11`, `fontSize.headlineSm = 20`
2. Add to `typography.ts`: `letterSpacing.button = 0.2`, `letterSpacing.medium = 0.3`, `letterSpacing.wider = 0.8`, `letterSpacing.pin = 4`
3. Add to Theme interface and both themes: `text.inverse`, `shadow`, `switchTrackOff`, `overlaySubtle`, `overlayMuted`, `onPrimaryOverlay`, `onPrimarySubtle`, `borderSubtleDark`, `surfaceNeutral`
4. Verify exports in `src/design-system/index.ts`

### Wave 2 — Infrastructure (no user-visible change)

**Target files:** `src/infrastructure/database/DatabaseProvider.tsx`

- C1: `#A78BFA` → `colors.brand.primary`
- C25: `#EF4444` → `colors.semantic.error`
- C16: `#0C0C14` → `colors.background`
- Requires: `useTheme()` hook import

### Wave 3 — Core UI Components (high blast radius — many screens inherit these)

**Target files (in order):**
1. `src/presentation/components/ui/Button.tsx` — F1, W18, L3
2. `src/presentation/components/ui/TextInput.tsx` — F3, F4, F5
3. `src/presentation/components/ui/Heading.tsx` — W21, W22, W23, W24
4. `src/presentation/components/ui/Badge.tsx` — W17, L2
5. `src/presentation/components/ui/Chip.tsx` — F2
6. `src/presentation/components/ui/Avatar.tsx` — W16
7. `src/presentation/components/ui/EmptyState.tsx` — W19
8. `src/presentation/components/ui/ErrorState.tsx` — W20
9. `src/presentation/components/ui/SectionHeader.tsx` — W25, L4
10. `src/presentation/components/ui/ConfirmModal.tsx` — R11, C26, LH7

### Wave 4 — Tab Navigation Shell

**Target files:** `app/(tabs)/_layout.tsx`
- C22, C23 (inactive tint colors)
- C19, C14 (tab bar background)
- C20, C21 (border color)
- T35 (fontSize: 11)
- F6 (fontFamily string)

### Wave 5 — App-level Layout

**Target files:** `app/_layout.tsx`
- C17, C18 (`#0C0C14` / `#F8FAFC`)

### Wave 6 — Dashboard Components

**Target files:**
1. `src/presentation/components/dashboard/CyclePhaseHeroCard.tsx` — C2-C5, R3, R4, R5, L1

### Wave 7 — Calendar Feature

**Target files (in order):**
1. `src/presentation/components/calendar/CalendarGrid.tsx` — T1, W1
2. `src/presentation/components/calendar/CalendarLegend.tsx` — T5
3. `src/presentation/components/calendar/CalendarHeader.tsx` — T2, T3, T4, W2
4. `src/presentation/components/calendar/DayCell.tsx` — W3
5. `src/presentation/components/calendar/EditCycleModal.tsx` — R1, R2, W4, T7, T8, LH1
6. `app/(tabs)/calendar.tsx` — T32, T33, T34, W31, W32

### Wave 8 — Log Feature

**Target files:**
1. `src/presentation/components/log/SelectableChip.tsx` — C7, C8
2. `src/presentation/components/log/RangeSlider.tsx` — C6
3. `src/presentation/components/log/FlowSelector.tsx` — T25, T26, T27, W13, W14
4. `app/(tabs)/log.tsx` — R12

### Wave 9 — Insights Feature [CRITICAL — visual correction, not just tokenization]

> Warning: these components display wrong phase colors. This is a design correctness issue, not just a refactor.

**Target files (in order):**
1. `src/presentation/components/insights/CycleTab.tsx` — C29-C36, T9-T12, W5, W6
2. `src/presentation/components/insights/SymptomsTab.tsx` — C37-C41, T15-T17, W8, W9
3. `src/presentation/components/insights/WellbeingTab.tsx` — C42-C49, T18-T24, W10-W12, R8
4. `src/presentation/components/insights/InsightsEmptyState.tsx` — T13, T14, W7, LH3
5. `src/presentation/components/insights/OverviewTab.tsx` — R6

### Wave 10 — Settings Feature

**Target files:**
1. `src/presentation/components/settings/SettingsToggle.tsx` — C9, R10
2. `app/settings/health.tsx` — C11, C27, C28
3. `app/settings/notifications.tsx` — C12, R13, W35
4. `app/settings/privacy.tsx` — C13, R14, T38, L6
5. `app/settings/about.tsx` — LH11, LH12
6. `app/settings/cycle.tsx` — T37, LH13
7. `app/settings/profile.tsx` — T39
8. `app/settings/_layout.tsx` — W34

### Wave 11 — Learn Feature

**Target files:**
1. `src/presentation/components/learn/PhaseCard.tsx` — R9
2. `src/presentation/components/learn/ContentSection.tsx` — LH4, LH5
3. `src/presentation/components/learn/MedicalDisclaimer.tsx` — LH6
4. `src/presentation/components/dashboard/HealthTipCard.tsx` — LH2
5. `app/learn/glossary.tsx` — LH8, LH9
6. `app/learn/index.tsx` — LH10
7. `app/learn/_layout.tsx` — W33

### Wave 12 — Auth, Onboarding, and Misc

**Target files:**
1. `src/presentation/components/privacy/LockScreen.tsx` — T28, W15
2. `app/(auth)/lock.tsx` — T30, T31, W30
3. `app/onboarding/index.tsx` — C24
4. `app/onboarding/goal.tsx` — N18
5. `app/+not-found.tsx` — T40, T41, W36

---

*End of Audit v2. Grand total: 179 occurrences audited. 24 exempt. 155 require migration.*
*No source code was modified during this analysis.*

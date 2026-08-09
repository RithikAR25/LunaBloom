# Alert & Dialog UI Audit

**Version:** 1.1.0
**Date:** 2026-08-09
**Status:** Complete — Read-only audit. No production code was modified.
**Scope:** All application-owned alerts, dialogs, and modal UI across the entire LunaBloom codebase.

> **v1.1 corrections** from post-audit verification pass:
> - Native `Alert.alert()` invocation count corrected: **22 → 24**
> - Executive summary table updated with correct totals
> - `ConfirmModal` shadow colour corrected: `colors.shadow` IS a design system theme token (not hardcoded)
> - A17 (export error): catch block has no bound variable — `e.message` NOT available; message is fully hardcoded
> - A23 title corrected: actual value is `'Disabled'` (not the message text)
> - Architecture decision added (§12): `ConfirmModal` stays confirmation-only; new `AlertModal` handles Error / Success / Info
> - Coverage confirmed: all `app/` directories searched — `onboarding/`, `(auth)/`, `learn/`, `_layout.tsx` all confirmed no Alert usage
> - `NotificationService.ts` `shouldShowAlert: true` confirmed as expo-notifications config, not an `Alert.alert()` call

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Project Areas Inspected](#2-project-areas-inspected)
3. [Existing Alert/Dialog Architecture](#3-existing-alertdialog-architecture)
4. [Alert/Dialog Flow Diagram](#4-alertdialog-flow-diagram)
5. [Complete Alert Inventory](#5-complete-alert-inventory)
6. [Custom Alert Architecture](#6-custom-alert-architecture)
7. [Native Alert Audit](#7-native-alert-audit)
8. [Legitimate System/Platform Dialogs](#8-legitimate-systemplatform-dialogs)
9. [Domain → Presentation Error Flows](#9-domain--presentation-error-flows)
10. [Inconsistency Analysis](#10-inconsistency-analysis)
11. [Scenario-Based Analysis](#11-scenario-based-analysis)
12. [Architecture Decision — ConfirmModal vs AlertModal](#12-architecture-decision--confirmmodal-vs-alertmodal)
13. [Migration Candidates](#13-migration-candidates)
14. [Priority Classification](#14-priority-classification)
15. [Verified Findings vs Inference vs Unknowns](#15-verified-findings-vs-inference-vs-unknowns)
16. [Files Inspected](#16-files-inspected)
17. [Audit Conclusion](#17-audit-conclusion)

---

## 1. Executive Summary

The LunaBloom codebase contains **27 distinct alert/dialog invocations** across 10 files (9 screens + 1 component). The app has **one established custom alert component** — `ConfirmModal` — that is correctly themed, uses the design system, and is rendered in 3 places. The majority of application-owned alerts (**24 out of 27**) use React Native's native `Alert.alert()`, bypassing the custom system entirely.

No toast/snackbar system exists. No shared alert utility layer exists. Every alert is invoked directly at the screen level.

**Key findings:**

| Category | Count | Notes |
|---|---|---|
| Total distinct alert/dialog invocations | 27 | See inventory in §5 |
| Custom-styled (`ConfirmModal` renders) | 3 | index.tsx, calendar.tsx, EditCycleModal |
| Native `Alert.alert()` invocations | 24 | See IDs A01–A26 in §5 |
| `Modal`-based components (non-alert) | 4 | EditCycleModal, RollerSelector, LockScreen, ConfirmModal itself |
| Toast/Snackbar system | 0 | Does not exist |

> **Count note:** 24 native `Alert.alert()` calls + 3 `ConfirmModal` renders = 27 application-owned dialog invocations. The "26 total / 22 native" figures in v1.0 were incorrect due to a summary/table mismatch; the inventory table itself was correct.

**Core problem:** `Alert.alert()` is used for errors, success confirmations, warnings, destructive confirmations, and informational messages — all rendering in the native OS appearance, completely bypassing the design system. `ConfirmModal` exists and works correctly for its current use cases, but has no single-button variant, which is why `Alert.alert()` became the default for all other semantic types (error, success, info).

---

## 2. Project Areas Inspected

All directories and files listed in Section 16 were directly opened and read. The following broad areas were covered:

- **App screens** (`app/(tabs)/`, `app/settings/`, `app/onboarding/`, `app/(auth)/`, `app/_layout.tsx`)
- **Presentation components** (`src/presentation/components/ui/`, `src/presentation/components/calendar/`, `src/presentation/components/privacy/`, `src/presentation/components/settings/`)
- **Presentation stores** (`src/presentation/stores/`)
- **Domain use cases** (`src/domain/use-cases/cycle/`)
- **Domain services** (`src/domain/services/ValidationService.ts`)
- **Application services** (`src/application/services/`)
- **Design system** (`src/design-system/tokens/`, `src/design-system/themes/`)
- **Documentation** (`docs/`)

Search patterns used: `Alert.alert`, `Alert`, `Modal`, `ConfirmModal`, `showAlert`, `showDialog`, `showError`, `showConfirm`, `showWarning`, `setModal`, `Toast`, `Snackbar`, `visible`, `onRequestClose`, `DateTimePicker`.

No abstractions hiding alert calls were found. All calls are direct and at the screen level.

---

## 3. Existing Alert/Dialog Architecture

### 3.1 Custom Alert Component: `ConfirmModal`

**File:** `src/presentation/components/ui/ConfirmModal.tsx`

The application has **one centralized custom alert component**: `ConfirmModal`. It is exported from `src/presentation/components/ui/index.ts` and is the intended standard alert system.

**Current usage:** 3 callsites — `app/(tabs)/index.tsx`, `app/(tabs)/calendar.tsx`, `src/presentation/components/calendar/EditCycleModal.tsx`.

### 3.2 Native Alert

React Native's `Alert.alert()` is imported directly in 8 screen files. There is no shared utility wrapper around it.

### 3.3 Other Modal Components

Three additional `Modal`-based components exist, none of which function as alert dialogs:

| Component | Purpose | Alert? |
|---|---|---|
| `EditCycleModal` | Full editing bottom sheet with form fields | No — it is a form sheet |
| `RollerSelector` | Scrollable picker (iOS-style) | No — it is a picker UI |
| `LockScreen` | Full-screen PIN keypad overlay | No — it is a security gate |

### 3.4 No Toast/Snackbar System

Confirmed: no toast, snackbar, or notification-overlay system exists anywhere in the codebase.

---

## 4. Alert/Dialog Flow Diagram

### Standard Error Flow (Native Alert — most common)

```
User action (button press)
        ↓
Screen handler (async inline arrow function)
        ↓
Store method call (useCycleStore / useProfileStore / etc.)
        ↓
Domain use case execution (StartPeriod, EndPeriod, EditCycleEntry, etc.)
        ↓
Domain error thrown (Error / ValidationError)
        ↓
catch (err: any) in screen handler
        ↓
Alert.alert('Error', err.message)   <- NATIVE OS ALERT
        ↓
User dismisses with OK
```

### Warning/Confirmation Flow (ConfirmModal — used correctly)

```
User action (Start/End Period, Edit Cycle)
        ↓
Screen handler
        ↓
ValidationService.getWarnings() called BEFORE store action
        ↓
Warnings array returned (SHORT_CYCLE, LONG_CYCLE, SHORT_PERIOD, LONG_PERIOD)
        ↓
if (warnings.length > 0): setWarningState(...)
        ↓
ConfirmModal rendered with isDestructive=true
        ↓
User confirms or cancels
        ↓
If confirmed: Store method called -> Domain use case executes
        ↓
If domain error: Alert.alert('Error', err.message)  <- NATIVE OS ALERT
```

### Destructive Confirmation Flow (Native Alert — privacy.tsx)

```
User taps "Remove PIN"
        ↓
handleRemovePin()
        ↓
Alert.alert('Remove PIN', '...', [{text: 'Cancel'}, {text: 'Remove', style: 'destructive'}])
        ↓
NATIVE OS ALERT with destructive button styling
        ↓
If confirmed: PrivacyService.removePin()
```

### Success Notification Flow (Native Alert — notifications.tsx, data.tsx, privacy.tsx)

```
User action completes successfully
        ↓
Alert.alert('Success', '...')   <- NATIVE OS ALERT
        ↓
User dismisses
```

---

## 5. Complete Alert Inventory

**Legend:** [CUSTOM] = ConfirmModal | [NATIVE] = Alert.alert | [PLATFORM] = System/OS-owned

| ID | File | Lines | Screen | Trigger | Type | Mechanism | Custom Styled | Message Origin | Category |
|---|---|---|---|---|---|---|---|---|---|
| A04 | `app/(tabs)/index.tsx` | 250–276 | Dashboard | "Start Period" → SHORT_CYCLE warning | Warning/Confirm | ConfirmModal | YES | ValidationService.getWarnings() | A |
| A01 | `app/(tabs)/index.tsx` | 181–185 | Dashboard | "Start Period" fails (already active / other) | Error | Alert.alert | NO | err.message from StartPeriod UC | B |
| A02 | `app/(tabs)/index.tsx` | 206–210 | Dashboard | "End Period" fails (no active period / other) | Error | Alert.alert | NO | err.message from EndPeriod UC | B |
| A03 | `app/(tabs)/index.tsx` | 263–267 | Dashboard | "Start Period" (post-ConfirmModal confirm) fails | Error | Alert.alert | NO | err.message from StartPeriod UC | B |
| A11 | `app/(tabs)/calendar.tsx` | 180–193 | Calendar | "Start/End Period" → any validation warning | Warning/Confirm | ConfirmModal | YES | ValidationService.getWarnings() | A |
| A05 | `app/(tabs)/calendar.tsx` | 106 | Calendar | "End Period" (post-warning confirm) throws | Error | Alert.alert | NO | err.message from EndPeriod UC | B |
| A06 | `app/(tabs)/calendar.tsx` | 116 | Calendar | "End Period" (no-warning path) throws | Error | Alert.alert | NO | err.message from EndPeriod UC | B |
| A07 | `app/(tabs)/calendar.tsx` | 143 | Calendar | "Start Period" (post-warning confirm) throws | Error | Alert.alert | NO | err.message from StartPeriod UC | B |
| A08 | `app/(tabs)/calendar.tsx` | 150 | Calendar | "Start Period" (no-warning path) throws | Error | Alert.alert | NO | err.message from StartPeriod UC | B |
| A09 | `app/(tabs)/calendar.tsx` | 168 | Calendar | onSave from EditCycleModal fails | Error | Alert.alert | NO | err.message from EditCycleEntry UC | B |
| A10 | `app/(tabs)/calendar.tsx` | 175 | Calendar | onDelete from EditCycleModal fails | Error | Alert.alert | NO | err.message from DeleteCycleEntry UC | B |
| A12 | `app/(tabs)/settings.tsx` | 64 | Settings | "Terms of Service" tapped | Info (placeholder) | Alert.alert | NO | Hardcoded placeholder string | B |
| A13 | `app/(tabs)/settings.tsx` | 65 | Settings | "Privacy Policy" tapped | Info (placeholder) | Alert.alert | NO | Hardcoded placeholder string | B |
| A14 | `app/settings/cycle.tsx` | 55 | Cycle Settings | handleSave fails | Error | Alert.alert | NO | Hardcoded generic error string | B |
| A15 | `app/settings/health.tsx` | 63 | Health Settings | handleSave fails | Error | Alert.alert | NO | Hardcoded generic error string | B |
| A16 | `app/settings/profile.tsx` | 104 | Profile Settings | handleSave fails | Error | Alert.alert | NO | Hardcoded generic error string | B |
| A17 | `app/settings/data.tsx` | 32 | Data Settings | exportData() throws | Error | Alert.alert | NO | Hardcoded title + dynamic e.message | B |
| A18 | `app/settings/data.tsx` | 41–70 | Data Settings | "Import Backup" tapped | Destructive Confirm | Alert.alert | NO | Hardcoded warning string | B |
| A19 | `app/settings/data.tsx` | 60 | Data Settings | Import succeeds | Success | Alert.alert | NO | Hardcoded success string | B |
| A20 | `app/settings/data.tsx` | 63 | Data Settings | Import fails | Error | Alert.alert | NO | "Import Failed" + dynamic e.message | B |
| A21 | `app/settings/notifications.tsx` | 24 | Notifications | OS permission denied | Info/Error | Alert.alert | NO | Hardcoded "go to device settings" | B |
| A22 | `app/settings/notifications.tsx` | 30 | Notifications | Reminders scheduled | Success | Alert.alert | NO | Hardcoded success string | B |
| A23 | `app/settings/notifications.tsx` | 34 | Notifications | Reminders cancelled | Info | Alert.alert | NO | Hardcoded info string | B |
| A24 | `app/settings/privacy.tsx` | 47 | Privacy Settings | PIN set attempt, length != 4 | Validation Error | Alert.alert | NO | Hardcoded: "PIN must be exactly 4 digits." | B |
| A25 | `app/settings/privacy.tsx` | 53 | Privacy Settings | PIN set successfully | Success | Alert.alert | NO | Hardcoded: "App PIN has been set." | B |
| A26 | `app/settings/privacy.tsx` | 57–63 | Privacy Settings | "Remove PIN" tapped | Destructive Confirm | Alert.alert | NO | Hardcoded confirm string | B |
| ECM | `src/.../EditCycleModal.tsx` | 279–292 | Calendar (modal) | "Save" edit form → validation warning | Warning/Confirm | ConfirmModal | YES | ValidationService.getWarnings() | A |

> **ECM** is the ConfirmModal inside EditCycleModal. It is a distinct invocation from A11.

---

## 6. Custom Alert Architecture

### 6.1 Component: `ConfirmModal`

**File:** [`src/presentation/components/ui/ConfirmModal.tsx`](file:///d:/LunaBloom/src/presentation/components/ui/ConfirmModal.tsx)

#### Props API

| Prop | Type | Default | Description |
|---|---|---|---|
| `visible` | `boolean` | — | Controls visibility |
| `title` | `string` | — | Dialog heading |
| `message` | `string` | — | Dialog body text |
| `confirmLabel` | `string` | `'Confirm'` | Confirm button label |
| `cancelLabel` | `string` | `'Cancel'` | Cancel button label |
| `isDestructive` | `boolean` | `false` | Switches icon + confirm button to danger variant |
| `onConfirm` | `() => void` | — | Confirm button callback |
| `onCancel` | `() => void` | — | Cancel and close button callback |

#### Visual Variants

The component has exactly **two visual modes** controlled by `isDestructive`:

| `isDestructive` | Icon | Icon background | Confirm button |
|---|---|---|---|
| `false` | `feather/info` | `brand.primary` at 20% opacity | `Button variant="primary"` |
| `true` | `feather/alert-triangle` | `semantic.error` at 20% opacity | `Button variant="danger"` |

#### Styling Tokens in Use

| Property | Value | Token Source |
|---|---|---|
| Overlay background | `colors.overlay` | `useTheme()` — design system token |
| Container background | `colors.background` | `useTheme()` — design system token |
| Container shadow colour | `colors.shadow` | `useTheme()` — **design system token** ✓ |
| Container shadow opacity | `shadowOpacity: 0.25` | **Hardcoded** |
| Container shadow radius | `shadowRadius: 10` | **Hardcoded** |
| Container elevation | `elevation: 5` | **Hardcoded** |
| Container border radius | `borderRadius.xl` (24pt) | Design system |
| Container padding | `spacing[6]` (24pt) | Design system |
| Container max width | `400` | **Hardcoded** |
| Title | `Heading level="h3"`, `colors.text.primary` | Design system components |
| Message | `Text variant="body"`, `colors.text.secondary` | Design system components |
| Icon size | `24` | **Hardcoded** |
| Icon container | 48×48, borderRadius 24 | **Hardcoded dimensions** |

#### Behavior

- **Back button (Android):** Calls `onCancel` via `onRequestClose`
- **Close button (top-right X):** Calls `onCancel`
- **Cancel button:** `Button variant="secondary"` — calls `onCancel`
- **Confirm button:** `Button variant="primary"` or `"danger"` — calls `onConfirm`
- **Animation:** `animationType="fade"` — not using `motion` duration tokens

#### Current Usages

| Location | Trigger | `isDestructive` | Confirm Label |
|---|---|---|---|
| `app/(tabs)/index.tsx` L250 | "Start Period" -> SHORT_CYCLE warning | `true` | "Yes, Start Period" |
| `app/(tabs)/calendar.tsx` L180 | "Start/End Period" -> any warning | `true` | "Save Anyway" |
| `src/.../EditCycleModal.tsx` L279 | "Save" edit -> any warning | `true` | "Save Anyway" |

> **Observation:** Every current usage hard-codes `isDestructive={true}`. The non-destructive (informational) variant has **never been used** in production code.

#### Identified Gaps in Current `ConfirmModal`

| Gap | Detail |
|---|---|
| No error-only variant | No mode for a single-button error dismissal (no Cancel) |
| No success variant | No success state |
| No info-only variant | No informational notice mode |
| Shadow opacity/radius/elevation hardcoded | `shadowOpacity: 0.25`, `shadowRadius: 10`, `elevation: 5` — not design system elevation tokens. Shadow colour `colors.shadow` IS a token. |
| Icon size hardcoded | Uses `24` instead of iconSize tokens |
| Icon container hardcoded | Uses `48×48/borderRadius:24` without design system tokens |
| No modal accessibility | The `Modal` has no `accessibilityViewIsModal` prop |

---

## 7. Native Alert Audit

### A01 — Dashboard: Start Period Error
- **File:** `app/(tabs)/index.tsx` L181–185
- **Trigger:** `startPeriod(todayStr)` throws — already active period or other domain error
- **Title:** `isAlreadyActive ? 'Active Period' : 'Notice'`
- **Message:** `err.message` — from `StartPeriod` domain use case
- **Domain source:** `StartPeriod.execute()` L49: `"You're already tracking a period. End it before starting a new one."`
- **Should migrate:** Yes — HIGH priority

### A02 — Dashboard: End Period Error
- **File:** `app/(tabs)/index.tsx` L206–210
- **Trigger:** `endPeriod(todayStr)` throws — no active period or other domain error
- **Title:** `isNotActive ? 'No Active Period' : 'Notice'`
- **Message:** `err.message` — from `EndPeriod` domain use case
- **Should migrate:** Yes — HIGH priority

### A03 — Dashboard: Start Period Error After ConfirmModal
- **File:** `app/(tabs)/index.tsx` L263–267
- **Trigger:** User confirmed short-cycle ConfirmModal, `startPeriod` then throws
- **Message:** `err.message` — same error codes as A01
- **Note:** This creates the jarring sequence: branded ConfirmModal -> native OS popup
- **Should migrate:** Yes — HIGH priority

### A05 — Calendar: End Period Error (post-warning path)
- **File:** `app/(tabs)/calendar.tsx` L106
- **Trigger:** End Period warning confirmed, `endPeriod(endDate)` then throws
- **Should migrate:** Yes — HIGH priority

### A06 — Calendar: End Period Error (no-warning path)
- **File:** `app/(tabs)/calendar.tsx` L116
- **Trigger:** End Period (no warnings), `endPeriod` throws directly
- **Should migrate:** Yes — HIGH priority

### A07 — Calendar: Start Period Error (post-warning path)
- **File:** `app/(tabs)/calendar.tsx` L143
- **Trigger:** Start Period warning confirmed, `startPeriod` then throws
- **Should migrate:** Yes — HIGH priority

### A08 — Calendar: Start Period Error (no-warning path)
- **File:** `app/(tabs)/calendar.tsx` L150
- **Trigger:** Start Period (no warnings), `startPeriod` throws directly
- **Should migrate:** Yes — HIGH priority

### A09 — Calendar: Edit Cycle Error
- **File:** `app/(tabs)/calendar.tsx` L168
- **Trigger:** `onSave` callback from `EditCycleModal` (`editCycle()`) throws
- **Message:** `err.message` — from `EditCycleEntry` use case
- **Should migrate:** Yes — HIGH priority

### A10 — Calendar: Delete Cycle Error
- **File:** `app/(tabs)/calendar.tsx` L175
- **Trigger:** `onDelete` callback from `EditCycleModal` (`deleteCycle()`) throws
- **Message:** `err.message` — from `DeleteCycleEntry` use case
- **Should migrate:** Yes — HIGH priority

### A12 — Settings: Terms of Service (Placeholder)
- **File:** `app/(tabs)/settings.tsx` L64
- **Title:** "Terms of Service"
- **Message:** "Available at lunabloom.app/terms (placeholder)"
- **Note:** Known placeholder. Will eventually navigate to WebView/external URL. Do not migrate until real feature is implemented.
- **Should migrate:** Defer — LOW priority

### A13 — Settings: Privacy Policy (Placeholder)
- **File:** `app/(tabs)/settings.tsx` L65
- **Message:** "Available at lunabloom.app/privacy (placeholder)"
- **Note:** Same as A12. Placeholder.
- **Should migrate:** Defer — LOW priority

### A14 — Cycle Settings: Save Error
- **File:** `app/settings/cycle.tsx` L55
- **Trigger:** `updateProfile()` (repository layer) throws
- **Message:** "Failed to save cycle info. Please try again." (hardcoded — not from domain)
- **Should migrate:** Yes — MEDIUM priority

### A15 — Health Settings: Save Error
- **File:** `app/settings/health.tsx` L63
- **Message:** "Failed to save health info. Please try again."
- **Should migrate:** Yes — MEDIUM priority

### A16 — Profile Settings: Save Error
- **File:** `app/settings/profile.tsx` L104
- **Message:** "Failed to save profile. Please try again."
- **Should migrate:** Yes — MEDIUM priority

### A17 — Data Settings: Export Error
- **File:** `app/settings/data.tsx` L31–32
- **Trigger:** `dataService.exportData()` throws
- **Catch pattern:** `catch { }` — **no bound variable; `e.message` is NOT available**
- **Title:** `'Export Failed'` (hardcoded)
- **Message:** `'An error occurred while exporting your data.'` (fully hardcoded)
- **Should migrate:** Yes — MEDIUM priority

### A18 — Data Settings: Import Destructive Confirmation
- **File:** `app/settings/data.tsx` L41–70
- **Trigger:** "Import Backup" button tapped
- **Title:** "Warning"
- **Message:** "Importing a backup will overwrite your current data. This action cannot be undone."
- **Buttons:** `[{ text: 'Cancel', style: 'cancel' }, { text: 'Import', style: 'destructive' }]`
- **Note:** This is exactly the use case `ConfirmModal` with `isDestructive=true` was designed for. This is the **highest-priority single callsite** to migrate.
- **Should migrate:** Yes — HIGH priority

### A19 — Data Settings: Import Success
- **File:** `app/settings/data.tsx` L60
- **Message:** "Data imported successfully."
- **Note:** Requires a success variant of `ConfirmModal` or a dedicated single-button component.
- **Should migrate:** Yes — MEDIUM priority

### A20 — Data Settings: Import Failed
- **File:** `app/settings/data.tsx` L63
- **Message:** "Import Failed" / dynamic `e.message`
- **Should migrate:** Yes — MEDIUM priority

### A21 — Notifications Settings: Permission Denied
- **File:** `app/settings/notifications.tsx` L24
- **Title:** "Permission Denied"
- **Message:** "Please enable notifications in your device settings."
- **Note:** OS permission response, but the displayed dialog is application-owned.
- **Should migrate:** Yes — MEDIUM priority

### A22 — Notifications Settings: Reminders Scheduled
- **File:** `app/settings/notifications.tsx` L30
- **Message:** "Local reminders have been scheduled."
- **Should migrate:** Yes (needs success variant) — MEDIUM priority

### A23 — Notifications Settings: Notifications Disabled *(v1.0 title corrected)*
- **File:** `app/settings/notifications.tsx` L34
- **Trigger:** Toggle switch set to `false`, `cancelAllNotifications()` completes
- **Title:** `'Disabled'` *(v1.0 incorrectly listed the message text as the title)*
- **Message:** `'All local reminders have been cancelled.'`
- **Should migrate:** Yes — LOW priority

### A24 — Privacy Settings: Invalid PIN Length
- **File:** `app/settings/privacy.tsx` L47
- **Trigger:** `handleSetPin()` when `pin.length !== 4`
- **Message:** "Invalid PIN" / "PIN must be exactly 4 digits."
- **Note:** This is a presentation-layer guard (not domain validation). An inline error message below the input would be more UX-appropriate than any dialog, but that is a separate design decision.
- **Should migrate:** Yes (inline preferred) — MEDIUM priority

### A25 — Privacy Settings: PIN Set Success
- **File:** `app/settings/privacy.tsx` L53
- **Message:** "App PIN has been set."
- **Should migrate:** Yes (needs success variant) — MEDIUM priority

### A26 — Privacy Settings: Remove PIN Destructive Confirmation
- **File:** `app/settings/privacy.tsx` L57–63
- **Title:** "Remove PIN"
- **Message:** "Are you sure you want to disable app lock?"
- **Buttons:** `[{ text: 'Cancel', style: 'cancel' }, { text: 'Remove', style: 'destructive' }]`
- **Note:** A destructive confirmation directly equivalent to `ConfirmModal` with `isDestructive=true`.
- **Should migrate:** Yes — HIGH priority

### Message Source Summary

| Alert IDs | Message Origin |
|---|---|
| A01–A10 | `err.message` from domain use case / Zustand store re-throw |
| A12–A13 | Hardcoded placeholder strings |
| A14–A16 | Hardcoded generic error strings (not from domain) |
| A17, A20 | Mix of hardcoded title + dynamic `e.message` |
| A18, A19 | Hardcoded strings |
| A21–A23 | Hardcoded strings triggered by service return values |
| A24–A26 | Hardcoded strings |

---

## 8. Legitimate System/Platform Dialogs

### 8.1 `LockScreen` Modal

**File:** [`src/presentation/components/privacy/LockScreen.tsx`](file:///d:/LunaBloom/src/presentation/components/privacy/LockScreen.tsx)

**Classification:** System/platform-owned in intent, application-owned in implementation.

The `LockScreen` is a full-screen non-transparent `Modal` that is a security gate, not an alert dialog. It:
- Uses the design system correctly (`useTheme`, `colors`, `spacing`, `Heading`, `Text`)
- Is rendered as a full-screen overlay outside navigation via `app/_layout.tsx` L155
- Has no confirm/cancel button pattern — it is a PIN keypad UX

**Decision: KEEP AS-IS.** Not an alert dialog. Already uses the design system.

### 8.2 `DateTimePicker`

**Files:** `EditCycleModal.tsx`, `app/settings/profile.tsx`, `app/onboarding/last-period.tsx`, `app/onboarding/name.tsx`, `app/(tabs)/log.tsx`

**Classification:** Platform/OS-owned.

`@react-native-community/datetimepicker` renders the native OS date picker. It must remain native for trust and platform consistency.

**Decision: KEEP NATIVE.** OS-provided UI; not application-owned.

### 8.3 OS Notification Permission Dialog

Triggered by `NotificationService.requestPermissions()`. Rendered by Android/iOS — the application has no control over its appearance.

**Decision: KEEP NATIVE.** Alert A21 (permission denied response) is application-owned and should migrate; the permission prompt itself is platform-owned.

### 8.4 `RollerSelector` Modal

**File:** [`src/presentation/components/ui/RollerSelector.tsx`](file:///d:/LunaBloom/src/presentation/components/ui/RollerSelector.tsx)

A custom bottom-sheet picker that uses the design system. Not an alert or confirmation dialog.

**Decision: OUT OF SCOPE.** It is a picker component, not an alert.

---

## 9. Domain → Presentation Error Flows

### 9.1 Architecture

The domain enforces business rules by throwing typed errors. Stores re-throw them. The presentation layer catches at the screen level.

```
Domain throws Error/ValidationError
    -> Store re-throws (useCycleStore methods: throw err)
    -> Screen catch block
    -> Alert.alert / ConfirmModal
```

### 9.2 Cycle Use Case Error Map

**StartPeriod.execute()**

| Condition | Origin | Error Message |
|---|---|---|
| Future start date | `ValidationService.validateHistoricalDate()` | "Date cannot be in the future" |
| Already active period | `StartPeriod.execute()` L49 | "You're already tracking a period. End it before starting a new one." |
| Date overlap | `ValidationService.validatePeriodOverlap()` | "These dates overlap with an existing period." |

**EndPeriod.execute()**

| Condition | Origin | Error Message |
|---|---|---|
| Future end date | `ValidationService.validateHistoricalDate()` | "Date cannot be in the future" |
| No active period | `EndPeriod.execute()` L26 | "There's no active period to end." |
| End before start | `EndPeriod.execute()` L30 | "End date cannot be before start date." |
| Date overlap | `ValidationService.validatePeriodOverlap()` | Dynamic overlap message |

**EditCycleEntry.execute()**

| Condition | Origin | Error Message |
|---|---|---|
| Cycle not found | `EditCycleEntry.execute()` L21 | "Cycle entry ${id} not found." |
| End before start | `EditCycleEntry.execute()` L24 | "End date cannot be before start date." |
| Future date | `ValidationService.validateHistoricalDate()` | "Date cannot be in the future" |
| Date overlap | `ValidationService.validatePeriodOverlap()` | Dynamic overlap message |

**DeleteCycleEntry.execute()**

| Condition | Origin | Error Message |
|---|---|---|
| Cycle not found | `DeleteCycleEntry.execute()` L10 | "Cycle entry ${id} not found." |

### 9.3 Warning Flow (Soft Rules — Presentation Layer)

`ValidationService.getWarnings()` returns structured `Warning[]` objects called **before** the store action:

| Code | Trigger |
|---|---|
| `SHORT_CYCLE` | New cycle started very recently |
| `LONG_CYCLE` | Unusually long time since last cycle |
| `SHORT_PERIOD` | Period ended unusually quickly |
| `LONG_PERIOD` | Period is unusually long |

Warnings are correctly consumed by `ConfirmModal` in the presentation layer. Domain use cases do **not** call `getWarnings()` — this is intentional. Warnings are soft hints; domain errors are hard invariants.

### 9.4 Presentation-Layer-Only Validation

Two validations happen exclusively in the screen (not domain):

1. **PIN length** (`privacy.tsx` L46–48): `pin.length !== 4` check. `PrivacyService` does not validate PIN length.
2. **Import pre-confirmation** (`data.tsx` L41–70): The destructive confirmation before import. `DataManagementService` has no pre-flight guard.

---

## 10. Inconsistency Analysis

### 10.1 Design System Consistency Table

| Alert | Design system colors | Design system typography | Design system spacing | Custom component |
|---|---|---|---|---|
| `ConfirmModal` (A04, A11, ECM) | Yes | Yes | Yes | Yes |
| All `Alert.alert()` invocations | No (OS renders) | No (OS renders) | No (OS renders) | No |

### 10.2 Visual Inconsistency

- **ConfirmModal** renders with LunaBloom typography (Inter/Quicksand), brand colors (`sanguinePrimary`, `semantic.error`), `borderRadius.xl`, and fade animation.
- **`Alert.alert()`** renders the native OS dialog — Material Design on Android, UIAlertController on iOS. Neither matches the LunaBloom design system in any way.
- **Result:** Users can experience a beautifully branded `ConfirmModal` warning immediately followed by a plain native OS error popup within the exact same flow (Calendar → Start/End Period).

### 10.3 Behavioral Inconsistency

| Behavior | `ConfirmModal` | `Alert.alert()` |
|---|---|---|
| Android back button | Calls `onCancel` | Native handles |
| Close button (X) | Top-right X icon | Not available |
| Animation | Fade (matches app) | OS default |
| Button order | Cancel left, Confirm right | Varies by OS |
| Destructive button | Custom `danger` variant | OS `style: 'destructive'` |
| Accessibility | Basic (button role on close) | Full native OS a11y |

### 10.4 Post-Confirmation Error Inconsistency

The core warning→confirm→error sequence creates the most jarring inconsistency:

```
Step 1: Validation warning    -> ConfirmModal (branded)   [OK]
Step 2: User confirms
Step 3: Domain error          -> Alert.alert()  (native)  [BROKEN]
```

This affects the Calendar and Dashboard screens for all Start/End Period flows.

---

## 11. Scenario-Based Analysis

### Scenario 1: "Start Period" on Dashboard — period already active

1. User taps "Start Period" grid button
2. `ValidationService.getWarnings()` runs — `SHORT_CYCLE` check is false (no active period needed)
3. `startPeriod(todayStr)` called
4. Domain: `StartPeriod.execute()` L49 finds active cycle → throws `Error("You're already tracking a period...")`
5. Store re-throws
6. Catch block: `Alert.alert(isAlreadyActive ? 'Active Period' : 'Notice', err.message, [{ text: 'OK' }])` **[NATIVE]**

**Issue:** Core blocking error shown via native OS dialog, bypassing design system.

---

### Scenario 2: "Start Period" on Dashboard — short cycle warning then domain error

1. User taps "Start Period"
2. `ValidationService.getWarnings()` detects `SHORT_CYCLE`
3. `ConfirmModal` shown with "Short Cycle Detected" **[BRANDED]**
4. User confirms
5. `startPeriod(pendingStartDate)` called → domain error thrown
6. Catch: `Alert.alert(...)` **[NATIVE]**

**Issue:** Branded modal followed immediately by native OS popup — jarring visual discontinuity.

---

### Scenario 3: "End Period" on Calendar — warnings then error

Same structure as Scenario 2 but for `endPeriod`. Warning path uses `ConfirmModal`. Error path uses `Alert.alert`.

---

### Scenario 4: "Import Backup" in Data Settings

1. User taps "Import Backup"
2. `Alert.alert('Warning', 'Importing a backup will overwrite...', [{Cancel}, {Import: destructive}])` **[NATIVE]**
3. If confirmed: import runs
4. Success: `Alert.alert('', 'Data imported successfully.')` **[NATIVE]**
5. Failure: `Alert.alert('Import Failed', e.message)` **[NATIVE]**

**Issue:** This is the exact use case `ConfirmModal` was designed for. The entire flow (confirmation + success + error) uses native OS dialogs.

---

### Scenario 5: "Remove PIN" in Privacy Settings

1. User taps "Remove PIN"
2. `Alert.alert('Remove PIN', 'Are you sure...', [{Cancel}, {Remove: destructive}])` **[NATIVE]**
3. If confirmed: `PrivacyService.removePin()`

**Issue:** Another destructive confirmation that should use `ConfirmModal isDestructive={true}`.

---

### Scenario 6: Edit Cycle in EditCycleModal — save error handling split

1. User taps "Save"
2. Field validation runs (inline errors shown correctly in form — no dialog)
3. `ValidationService.getWarnings()` → if warnings: `ConfirmModal` shown **[BRANDED]**
4. User confirms → `onSave()` callback invoked
5. Inside `EditCycleModal.handleSave()`: `catch { /* Error handled by store/parent */ }` — **silent catch**
6. Parent (`calendar.tsx`) `onSave` callback has its own `catch` → `Alert.alert('Error', err.message)` **[NATIVE]**

**Issue:** The error surface is split between the modal's silent catch (L129–131 in `EditCycleModal`) and the parent's catch (L165–169 in `calendar.tsx`). This means: if the store-level throw propagates, the parent shows a native alert; if it does not propagate, the error is silently swallowed.

---

## 12. Architecture Decision — ConfirmModal vs AlertModal

> **These are recommendations only. No code was modified.**

### Decision

**`ConfirmModal` remains confirmation/warning-only** (Cancel + Confirm). A new **`AlertModal`** component is introduced for single-button dismissal cases.

### Rationale

`ConfirmModal` is a confirmation dialog. Its two-button layout is semantically correct for that role. Extending it with type variants would require conditional rendering of buttons, icons, and layout — making it do two distinct jobs. A separate `AlertModal` keeps components focused.

| Component | Role | Buttons |
|---|---|---|
| `ConfirmModal` | Confirmation / warning before a potentially risky action | Cancel + Confirm |
| `AlertModal` | Single-outcome notification: error / success / info | Dismiss only |

### Proposed `AlertModal` API

```tsx
<AlertModal
  visible={boolean}
  type="error" | "success" | "info"
  title={string}
  message={string}
  dismissLabel?={string}   // defaults to "OK"
  onDismiss={() => void}
/>
```

| `type` | Icon | Icon bg | Button |
|---|---|---|---|
| `"error"` | `feather/alert-circle` | `semantic.error` @ 20% | `variant="danger"` |
| `"success"` | `feather/check-circle` | `semantic.success` @ 20% | `variant="primary"` |
| `"info"` | `feather/info` | `brand.primary` @ 20% | `variant="secondary"` |

Should share design tokens with `ConfirmModal` (overlay, background, `borderRadius.xl`, spacing, `Text`, `Heading` components).

### Coverage

Once `AlertModal` is built, all application-owned `Alert.alert()` calls for error, success, and info feedback can route through it. Exceptions:
- A12/A13 (Terms/Privacy placeholders) — defer until real feature
- A24 (PIN length) — prefer inline validation (button is already `disabled` when PIN length ≠ 4)

---

## 13. Migration Candidates

| ID | Screen | Alert Type | Priority |
|---|---|---|---|
| A01 | Dashboard | Error | HIGH |
| A02 | Dashboard | Error | HIGH |
| A03 | Dashboard | Error (post-confirm) | HIGH |
| A05 | Calendar | Error (post-confirm) | HIGH |
| A06 | Calendar | Error | HIGH |
| A07 | Calendar | Error (post-confirm) | HIGH |
| A08 | Calendar | Error | HIGH |
| A09 | Calendar | Error | HIGH |
| A10 | Calendar | Error | HIGH |
| A18 | Data Settings | Destructive Confirmation | HIGH |
| A26 | Privacy Settings | Destructive Confirmation | HIGH |
| A14 | Cycle Settings | Error | MEDIUM |
| A15 | Health Settings | Error | MEDIUM |
| A16 | Profile Settings | Error | MEDIUM |
| A17 | Data Settings | Error | MEDIUM |
| A19 | Data Settings | Success | MEDIUM (needs success variant) |
| A20 | Data Settings | Error | MEDIUM |
| A21 | Notifications Settings | Info | MEDIUM |
| A22 | Notifications Settings | Success | MEDIUM (needs success variant) |
| A24 | Privacy Settings | Validation Error | MEDIUM (inline preferred) |
| A25 | Privacy Settings | Success | MEDIUM (needs success variant) |
| A23 | Notifications Settings | Info | LOW |
| A12 | Settings Hub | Placeholder Info | LOW (defer until real feature) |
| A13 | Settings Hub | Placeholder Info | LOW (defer until real feature) |

**Total migration candidates: 24 out of 26 invocations.**

**Keep native / keep as-is:**
- `DateTimePicker` — OS date picker, must remain native
- `LockScreen` — full-screen security overlay, already uses design system
- `RollerSelector` — picker component, not an alert
- `EditCycleModal` — form bottom sheet (contains `ConfirmModal` correctly for warnings)
- OS notification permission prompt — system-owned

---

## 14. Priority Classification

### HIGH — Core Flows / Destructive Operations

Direct user-facing inconsistencies in the most-used app screens, or destructive operations that should use the branded confirmation pattern.

- **A01, A02, A03** — Dashboard error alerts after core cycle actions
- **A05, A06, A07, A08** — Calendar error alerts after core cycle actions
- **A09, A10** — Calendar error alerts after edit/delete cycle
- **A18** — Data import destructive confirmation
- **A26** — Remove PIN destructive confirmation

### MEDIUM — Settings Error/Success Flows

Settings screens use native alerts for all feedback. Visually inconsistent but less frequently accessed.

- **A14, A15, A16** — Save errors in settings screens
- **A17, A20** — Data export/import errors
- **A19, A22, A25** — Success notifications (require success variant)
- **A21** — Notification permission denied info
- **A23** — Notifications cancelled info
- **A24** — PIN validation (inline preferred)

### LOW — Placeholder / Informational

- **A12, A13** — Terms/Privacy placeholders (defer until real feature)

---

## 15. Verified Findings vs Inference vs Unknowns

### Verified from Code (Direct Source Inspection)

- `ConfirmModal` exists at `src/presentation/components/ui/ConfirmModal.tsx`, is exported from the UI index, and uses `useTheme()`, `borderRadius.xl`, design system `Text`, `Heading`, and `Button` components
- `ConfirmModal` is used in exactly 3 places: `index.tsx`, `calendar.tsx`, `EditCycleModal.tsx`; `isDestructive` is `true` in all three
- All 22 `Alert.alert()` calls listed in the inventory were directly confirmed in the named files at the named line ranges
- `Alert.alert()` is imported in: `index.tsx`, `calendar.tsx`, `settings.tsx`, `cycle.tsx`, `health.tsx`, `profile.tsx`, `data.tsx`, `notifications.tsx`, `privacy.tsx`
- No toast, snackbar, or notification-overlay system exists anywhere in the codebase
- No shared alert utility function exists (`showAlert`, `showError`, etc. — confirmed via codebase-wide search)
- `ValidationService.getWarnings()` returns structured `Warning[]` with `code`, `title`, and `message` fields
- `StartPeriod`, `EndPeriod`, `EditCycleEntry`, `DeleteCycleEntry` throw `Error` / `ValidationError` which propagate through the store to the screen via re-throw
- `useCycleStore` methods (`startPeriod`, `endPeriod`, `editCycle`, `deleteCycle`) all re-throw errors (verified: `catch (err) { throw err }` pattern)
- `LockScreen` is a full-screen non-transparent `Modal`, uses design system, is rendered as an overlay in `app/_layout.tsx`
- `RollerSelector` is a picker bottom sheet, uses design system
- `EditCycleModal` contains a `ConfirmModal` internally for validation warnings
- `DateTimePicker` is `@react-native-community/datetimepicker` (OS-native date picker)
- PIN length validation (A24) is a presentation-layer guard — `PrivacyService` does not validate PIN length
- Import pre-confirmation (A18) is a presentation-layer guard — `DataManagementService` has no pre-flight confirmation
- `ConfirmModal` shadow uses hardcoded values (`elevation: 5`, `shadowOpacity: 0.25`, `shadowRadius: 10`) — not the design system `elevation` tokens
- `ConfirmModal` icon size is hardcoded `24` — not from `iconSize` tokens
- `EditCycleModal.handleSave()` contains a silent `catch` (L129–131 in that file) — the parent `calendar.tsx` contains a separate `Alert.alert` catch for the same operation

### Inferred

- The `ConfirmModal` non-destructive variant (`isDestructive={false}`) is intended to work but has never been invoked in production code — inferred from prop definition, absence of any `isDestructive={false}` usage
- The hardcoded shadow values in `ConfirmModal` may be intentional (specific elevation appearance) or an oversight from when the elevation tokens were added — cannot be determined from code alone
- A12/A13 (Terms/Privacy alerts) are expected to eventually be replaced by WebView navigation — inferred from "(placeholder)" string in the alert message

### Unknown

- Whether a planned specification exists for additional `ConfirmModal` variants (success, info, error) — no documentation found
- Whether `ConfirmModal` was designed as the sole alert mechanism or intended only for confirmations while `Alert.alert` handles simple errors — no ADR or inline comment makes this explicit
- Whether the intended final behavior for A12/A13 is a WebView, external link, or separate screen — no specification found
- Whether the hardcoded shadow values in `ConfirmModal` are intentional

---

## 16. Files Inspected

### App Screens
- [`app/_layout.tsx`](file:///d:/LunaBloom/app/_layout.tsx)
- [`app/(tabs)/index.tsx`](file:///d:/LunaBloom/app/(tabs)/index.tsx)
- [`app/(tabs)/calendar.tsx`](file:///d:/LunaBloom/app/(tabs)/calendar.tsx)
- [`app/(tabs)/settings.tsx`](file:///d:/LunaBloom/app/(tabs)/settings.tsx)
- [`app/(tabs)/log.tsx`](file:///d:/LunaBloom/app/(tabs)/log.tsx) (first 50 lines — no Alert usage)
- [`app/(tabs)/insights.tsx`](file:///d:/LunaBloom/app/(tabs)/insights.tsx) (import scan — no Alert usage)
- [`app/settings/cycle.tsx`](file:///d:/LunaBloom/app/settings/cycle.tsx)
- [`app/settings/health.tsx`](file:///d:/LunaBloom/app/settings/health.tsx)
- [`app/settings/profile.tsx`](file:///d:/LunaBloom/app/settings/profile.tsx)
- [`app/settings/data.tsx`](file:///d:/LunaBloom/app/settings/data.tsx)
- [`app/settings/notifications.tsx`](file:///d:/LunaBloom/app/settings/notifications.tsx)
- [`app/settings/privacy.tsx`](file:///d:/LunaBloom/app/settings/privacy.tsx)
- [`app/(auth)/lock.tsx`](file:///d:/LunaBloom/app/(auth)/lock.tsx)

### Presentation Components
- [`src/presentation/components/ui/ConfirmModal.tsx`](file:///d:/LunaBloom/src/presentation/components/ui/ConfirmModal.tsx)
- [`src/presentation/components/ui/Button.tsx`](file:///d:/LunaBloom/src/presentation/components/ui/Button.tsx)
- [`src/presentation/components/ui/RollerSelector.tsx`](file:///d:/LunaBloom/src/presentation/components/ui/RollerSelector.tsx)
- [`src/presentation/components/calendar/EditCycleModal.tsx`](file:///d:/LunaBloom/src/presentation/components/calendar/EditCycleModal.tsx)
- [`src/presentation/components/privacy/LockScreen.tsx`](file:///d:/LunaBloom/src/presentation/components/privacy/LockScreen.tsx)

### Presentation Stores
- [`src/presentation/stores/useCycleStore.ts`](file:///d:/LunaBloom/src/presentation/stores/useCycleStore.ts)

### Domain
- [`src/domain/use-cases/cycle/StartPeriod.ts`](file:///d:/LunaBloom/src/domain/use-cases/cycle/StartPeriod.ts)
- [`src/domain/use-cases/cycle/EndPeriod.ts`](file:///d:/LunaBloom/src/domain/use-cases/cycle/EndPeriod.ts)
- [`src/domain/use-cases/cycle/EditCycleEntry.ts`](file:///d:/LunaBloom/src/domain/use-cases/cycle/EditCycleEntry.ts)
- [`src/domain/use-cases/cycle/DeleteCycleEntry.ts`](file:///d:/LunaBloom/src/domain/use-cases/cycle/DeleteCycleEntry.ts)
- [`src/domain/services/ValidationService.ts`](file:///d:/LunaBloom/src/domain/services/ValidationService.ts)

### Design System
- [`src/design-system/index.ts`](file:///d:/LunaBloom/src/design-system/index.ts)
- [`src/design-system/tokens/colors.ts`](file:///d:/LunaBloom/src/design-system/tokens/colors.ts)
- [`src/design-system/tokens/typography.ts`](file:///d:/LunaBloom/src/design-system/tokens/typography.ts)
- [`src/design-system/tokens/borderRadius.ts`](file:///d:/LunaBloom/src/design-system/tokens/borderRadius.ts)
- [`src/design-system/themes/light.ts`](file:///d:/LunaBloom/src/design-system/themes/light.ts)

### Documentation
- [`docs/README.md`](file:///d:/LunaBloom/docs/README.md)
- [`docs/05_Design_System.md`](file:///d:/LunaBloom/docs/05_Design_System.md)
- [`docs/19_Architecture_Audit.md`](file:///d:/LunaBloom/docs/19_Architecture_Audit.md)
- [`docs/manual_testing.md`](file:///d:/LunaBloom/docs/manual_testing.md)

### Codebase-Wide Searches Performed
- `Alert.alert` — entire workspace
- `ConfirmModal` — entire workspace
- `Modal` — entire workspace
- `Toast`, `Snackbar`, `toast`, `snackbar` — entire workspace
- `showAlert`, `showDialog`, `showError`, `showConfirm`, `showWarning`, `setModal` — `src/`
- `DateTimePicker` — entire workspace
- `import.*Alert` — entire workspace

---

## 17. Audit Conclusion

### What the Audit Found

LunaBloom has a well-built custom alert component (`ConfirmModal`) that correctly implements the design system. It is used in the 3 places where it was intentionally integrated.

However, **22 of 26 user-facing alert invocations bypass `ConfirmModal`** and use native `Alert.alert()`. This produces a highly inconsistent experience: a branded, theme-aware modal for cycle validation warnings, followed by a plain native OS popup for errors in the exact same user flow.

The most critical inconsistencies are:

1. **Destructive confirmations in `data.tsx` (A18) and `privacy.tsx` (A26)** use native alerts despite `ConfirmModal` being purpose-built for exactly these patterns.
2. **All domain error alerts in Calendar and Dashboard** (A01–A03, A05–A10) create the jarring sequence: branded ConfirmModal -> native OS error popup.
3. **`ConfirmModal` lacks variants** for error-only (single button) and success notifications, which is why `Alert.alert()` was used as a fallback for those semantic types.

### Is the Custom Alert System Currently Sufficient?

- **For confirmation/warning dialogs:** Yes. `ConfirmModal` works correctly for its current use cases.
- **For error-only and success alerts:** No. `ConfirmModal` requires two buttons (confirm + cancel). A single-button dismissal variant (or separate `AlertModal` component) does not currently exist.

### Recommended First Step

Before migrating any native alerts, extend `ConfirmModal` with a single-button dismissal mode (`type="error"` / `type="success"` / `type="info"`). Once that exists, migrate alerts in priority order: HIGH first (Dashboard/Calendar errors and the two destructive confirmations), then MEDIUM (settings screens), then LOW (placeholders — defer until features are real).

The domain/presentation separation is architecturally correct and should not change. The only modification needed is routing existing `Alert.alert()` calls to the custom component.

---

*Audit completed 2026-08-09. All findings are derived from direct static analysis of production source code. No production code was modified during this audit.*

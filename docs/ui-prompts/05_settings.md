# Screen: Settings

**Route:** `/(tabs)/settings`  
**File:** `app/(tabs)/settings.tsx`  
**Stitch Project:** `3929023419273108988`  
**Status:** ✅ Design Generated | 🔲 Not Implemented  
**Milestone:** Phase 2 (v0.7-dashboard)

---

## Acceptance Criteria

### Profile Section
- [ ] All profile fields display current values from `useProfileStore`
- [ ] Tapping any row navigates to an edit screen
- [ ] Changes persist via `IUserProfileRepository.update()`

### Notifications
- [ ] Toggles connect to `useNotificationStore`
- [ ] Toggling off a notification cancels its scheduled local notification
- [ ] 'Reminder Time' opens a time picker bottom sheet

### Privacy & Security
- [ ] PIN toggle: enabling opens PIN setup flow; disabling confirms with current PIN
- [ ] Biometric toggle only visible if device supports biometrics
- [ ] Auto-lock options: Immediately | 1 min | 5 min | 15 min | Off

### Data Export/Import
- [ ] 'Export PDF' calls `DataExportService.exportPDF()` — shows loading state
- [ ] 'Export CSV' calls `DataExportService.exportCSV()`
- [ ] Both share via native share sheet after generation
- [ ] 'Import' opens file picker, calls `DataImportService.import()`

### Delete All Data
- [ ] 'Delete All Data' requires 3-step confirmation:
  1. Info sheet: "This permanently deletes all your health data"
  2. Offer export before deleting
  3. Type 'DELETE' to confirm
- [ ] On confirm: wipes database, MMKV, SecureStore, resets to onboarding
- [ ] This is the ONLY hard-delete operation in the app

### Appearance
- [ ] Theme segmented control: Light | Dark | System
- [ ] System default selected by default
- [ ] Change takes effect immediately without restart

---

## Component Mapping

| UI Element | Component | Token |
|---|---|---|
| Settings row | `SettingsRow` | `colors.surface`, `colors.border` |
| Toggle | `SettingsToggle` | `colors.brand.primary` (on) |
| Section header | `SettingsSectionHeader` | `colors.text.tertiary` |
| Danger row | `SettingsRow` variant=danger | `colors.semantic.error` |
| Segmented control | `SegmentedControl` | `colors.brand.primary` |

---

## Data Dependencies

```typescript
useProfileStore()       → profile, updateProfile
useNotificationStore()  → preferences, toggleNotification
useSecurityStore()      → pinEnabled, biometricEnabled, autoLock
useThemeStore()         → themeMode, setThemeMode
DataExportService       → exportPDF, exportCSV
```

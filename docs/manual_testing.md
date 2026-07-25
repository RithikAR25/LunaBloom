# LunaBloom Manual Testing Guide

## 1. Introduction

This document serves as the official Quality Assurance (QA) Manual Testing Guide for LunaBloom v1.0. 
The purpose of this guide is to ensure that a tester, developer, or QA engineer who has never interacted with the application before can systematically verify every implemented feature from start to finish without requiring additional developer guidance or codebase inspection.

### Supported Platforms
- Android (via Expo Go or compiled APK)
- iOS (via Simulator or compiled IPA)

### Test Environment
Testing should primarily be conducted on a real device to accurately test hardware-bound features (e.g., biometric authentication, notifications, and local file system exports). A simulator is acceptable for UI and logic flow verification.

### Required Setup
- Node.js and npm installed.
- Expo CLI (`npx expo start`).
- Expo Go installed on a physical device, OR a development build.

### Fresh Install vs Existing Installation
For the initial pass, it is strictly required to test from a **fresh install**. This means entirely wiping the app data or deleting the app and reinstalling it before beginning Section 3 to verify the onboarding flow.

---

## 2. Pre-Test Checklist

Before beginning the manual testing execution, confirm the following prerequisites:

- [ ] App is a completely fresh install (no existing database).
- [ ] Running the latest v1.0.0 build/tag.
- [ ] Device has notification permissions enabled/promptable.
- [ ] Device has biometric capabilities available and configured (FaceID / TouchID / Fingerprint).
- [ ] Internet is **disabled** (Airplane Mode on) to verify the offline-first architecture.

---

## 3. Complete User Journey

The following test cases represent the chronological flow of a user experiencing the app for the first time.

### App Launch

**Purpose**
Verify the application initializes properly and renders the correct entry points.

**Preconditions**
- Fresh app install.

**Steps**
1. Launch the application.
2. Observe the splash screen transition.
3. Observe the initial screen presented.

**Expected Result**
- Splash screen displays correctly without stretching.
- App respects the system theme (Light/Dark mode).
- If the app is locked (Settings > Privacy), the Lock Screen intercepts the launch.
- If fresh install, the Onboarding flow begins.

**Edge Cases**
- Rapidly minimizing and foregrounding during launch.

**Status**
- [ ] Pass
- [ ] Fail

---

### First Launch (Onboarding)

**Purpose**
Verify a new user can successfully complete onboarding and persist their profile.

**Preconditions**
- Fresh app install.
- No existing database.

**Steps**
1. Complete the Name & Date of Birth step.
2. Complete the Cycle Information step (enter valid historical data or select "I don't know").
3. Select primary tracking goals.
4. Select medical conditions (or skip) and accept the medical disclaimer.
5. Finish onboarding.
6. Force close the app and restart it.

**Expected Result**
- Dashboard opens immediately after onboarding.
- Profile data is saved to the local database.
- Upon restarting, the app launches directly to the Dashboard (onboarding never appears again).

**Edge Cases**
- Invalid age or birth date in the future.
- Empty name submission.
- Extreme height/weight values.

**Status**
- [ ] Pass
- [ ] Fail

---

### Dashboard

**Purpose**
Verify the main dashboard aggregates and displays relevant daily information.

**Preconditions**
- Onboarding completed.

**Steps**
1. Navigate to the Dashboard tab.
2. Review the personalized greeting.
3. Review the current phase card.
4. Review the health tip of the day.
5. Tap the quick action buttons (Log Today).

**Expected Result**
- Greeting uses the preferred name from onboarding.
- Current phase card accurately reflects the user's cycle calculation.
- Quick action buttons route to the correct screens.
- Health tips rotate based on the current cycle phase.

**Edge Cases**
- Navigating to the dashboard with zero logged cycles.
- Long inactivity (should show a "Welcome back" prompt if implemented).

**Status**
- [ ] Pass
- [ ] Fail

---

### Calendar

**Purpose**
Verify the calendar accurately displays historical, current, and predicted cycle phases.

**Preconditions**
- At least one active cycle exists.

**Steps**
1. Navigate to the Calendar tab.
2. Swipe left and right to navigate between previous and future months.
3. Tap on a predicted period date.
4. Tap on a historical period date.

**Expected Result**
- Current cycle period days are highlighted.
- Future predictions (period and fertile window) are visibly distinct from confirmed days.
- Selecting dates updates the daily detail view below the calendar.

**Edge Cases**
- Leap years.
- Month boundaries (cycles crossing from Jan 31 to Feb 1).

**Status**
- [ ] Pass
- [ ] Fail

---

### Cycle Tracking

**Purpose**
Verify the user can log, edit, and manage entire cycle entries.

**Preconditions**
- Dashboard or Calendar tab open.

**Steps**
1. Tap "Start Period" to log a new period starting today.
2. Navigate to the Calendar and verify the days are marked as a period.
3. Tap "End Period" on the current date.
4. Edit the cycle to change the start date retroactively.
5. Delete the cycle entry entirely.

**Expected Result**
- Starting/Ending periods instantly updates the UI across Calendar and Dashboard.
- Editing a cycle recalculates future predictions immediately.
- Deleting a cycle removes it and recalculates averages.

**Edge Cases**
- Overlapping cycles (starting a new cycle before the previous one ends).
- Extremely short cycles (< 15 days).
- **Boundary Condition**: Starting a cycle exactly 14 days after the previous start date (should trigger warning), and exactly 15 days after (should NOT trigger warning).
- Extremely long cycles (> 60 days).
- Deleting a cycle correctly recalculates the gap between remaining cycles.
- Importing data from a backup correctly restores `isExcludedFromPredictions` toggles.

**Status**
- [ ] Pass
- [ ] Fail

---

### Daily Logging

**Purpose**
Verify every parameter of the daily wellness log functions and saves correctly.

**Preconditions**
- An active date selected on the Calendar or Dashboard.

**Steps**
1. Open the Daily Log for today.
2. Select a flow intensity.
3. Select multiple symptoms and moods.
4. Adjust the pain and energy scales.
5. Enter sleep hours and water intake.
6. Add a custom free-text note.
7. Save the log.
8. Reopen the same log and edit a value.
9. Delete the log contents.

**Expected Result**
- All selections are visually confirmed upon tapping.
- Saving provides haptic feedback and closes the sheet/screen.
- Reopening the log retrieves the exact state previously saved.
- Deleting removes the log icon from the Calendar view.

**Edge Cases**
- Logging duplicate entries for the same date (should update, not duplicate).
- Logging data outside of any known cycle.

**Status**
- [ ] Pass
- [ ] Fail

---

### Insights

**Purpose**
Verify the analytics engine processes and visualizes cycle history.

**Preconditions**
- At least 3 completed cycles logged in the database.

**Steps**
1. Navigate to the Insights tab.
2. Review the Overview cycle statistics.
3. Review Symptom trends and Mood trends.
4. Review Wellbeing charts (Sleep/Energy).
5. Clear the database and return to Insights to view the empty state.

**Expected Result**
- Charts render without crashing.
- Averages (Cycle length, Period duration) match the historical data.
- If less than 2 cycles exist, a user-friendly empty state or "insufficient data" message appears.

**Edge Cases**
- Exactly 2 cycles.
- Cycles with zero logged symptoms.
- **Excluded Cycles**: Verify that manually toggling a cycle to "Exclude from Predictions" successfully recalculates the Dashboard average without needing an app restart.
- **All Cycles Excluded**: If every single cycle in the database is manually excluded, the prediction engine should gracefully fall back to the default average (28 days) without crashing.

**Status**
- [ ] Pass
- [ ] Fail

---

### Learn

**Purpose**
Verify the educational content is accessible and well-structured.

**Preconditions**
- Navigate to the Learn tab.

**Steps**
1. Open the Learn Home.
2. Navigate through the 4 Phase pages (Menstrual, Follicular, Ovulatory, Luteal).
3. Toggle the "Learn Mode" preference.
4. View the Glossary.
5. Check for the medical disclaimer.

**Expected Result**
- Content loads quickly and formatting is readable.
- Learn Mode toggle dynamically adjusts content depth across the app.
- Expandable sections function smoothly.
- Medical disclaimer is prominently displayed.

**Edge Cases**
- Rapidly switching tabs while content is expanding.

**Status**
- [ ] Pass
- [ ] Fail

---

### Settings

**Purpose**
Verify user profile and preferences can be updated.

**Preconditions**
- Navigate to the Settings tab.

**Steps**
1. Edit Profile (Name, Height, Weight).
2. Edit Cycle Settings (Avg Length, Period Duration).
3. Toggle Learn Mode.
4. Force close and restart the app.

**Expected Result**
- Changes are saved immediately.
- Restarting the app persists all changes.
- Dashboard greeting updates instantly if the name was changed.

**Edge Cases**
- Leaving required fields blank.
- Entering non-numeric data in numeric fields.

**Status**
- [ ] Pass
- [ ] Fail

---

### Privacy

**Purpose**
Verify the app can be securely locked to protect health data.

**Preconditions**
- Navigate to Settings > Privacy.

**Steps**
1. Enable the PIN and set a 4-digit code.
2. Background the app and return to the foreground.
3. Enter the correct PIN to unlock.
4. Background the app again.
5. Enter an incorrect PIN.
6. Enable Biometrics in Privacy settings.
7. Background and foreground the app to trigger a Biometric prompt.
8. Disable the PIN.

**Expected Result**
- The Lock Screen immediately covers the UI upon foregrounding if PIN is enabled.
- Incorrect PIN triggers an error animation (shake) and rejects entry.
- Biometrics instantly unlock the app without requiring the PIN.
- Disabling the PIN removes the lock screen entirely.

**Edge Cases**
- Canceling the biometric authentication prompt (should fall back to PIN).
- Biometrics unavailable on the device.
- Rapid background/foreground cycling.

**Status**
- [ ] Pass
- [ ] Fail

---

### Notifications

**Purpose**
Verify local reminders are scheduled securely.

**Preconditions**
- Navigate to Settings > Notifications.

**Steps**
1. Enable Cycle Reminders.
2. Accept the OS permission prompt.
3. Change a cycle start date in the Calendar.
4. Disable Cycle Reminders.

**Expected Result**
- OS Permission is requested only when toggled, not on app launch.
- Editing a cycle recalculates and silently reschedules future notifications.
- Disabling reminders cancels all pending scheduled notifications.

**Edge Cases**
- Permission denied at the OS level (should show in-app guidance).

**Status**
- [ ] Pass
- [ ] Fail

---

### Data Management

**Purpose**
Verify data portability and backup integrity.

**Preconditions**
- App contains Profile, Cycles, and Daily Logs.
- Navigate to Settings > Data Management.

#### Export
**Steps**
1. Tap Export Backup.
2. Wait for the OS Share Sheet to appear.
3. Save the JSON file to the device.

**Expected Result**
- JSON file is successfully generated.
- Share sheet opens natively.
- The JSON file contains valid `version`, `exportDate`, `profile`, `cycles`, and `dailyLogs` arrays.

#### Import
**Steps**
1. Modify the local app state (e.g., change your name, delete a cycle).
2. Tap Import Backup.
3. Select the previously exported JSON file.
4. Accept the overwrite warning.

**Expected Result**
- App restores exactly to the state captured in the backup.
- UI automatically reloads to reflect the restored data.

**Edge Cases**
- Importing an invalid/corrupted JSON file.
- Importing a JSON file with an older or unsupported schema version.
- Canceling the file picker.

**Status**
- [ ] Pass
- [ ] Fail

---

### Accessibility

**Purpose**
Verify the application is inclusive and usable for all individuals.

**Preconditions**
- Device Accessibility settings open.

**Steps**
1. Enable Dynamic Type (Large Text) in OS settings and navigate through the app.
2. Enable VoiceOver (iOS) or TalkBack (Android).
3. Navigate the Calendar and Dashboard using only screen reader gestures.

**Expected Result**
- UI does not break, clip, or severely overlap when text is enlarged.
- Screen reader announces elements logically (especially the Calendar grid dates).
- Interactive touch targets are comfortably sized (minimum 44x44).
- Color contrast between text and backgrounds remains highly legible.

**Edge Cases**
- Extremely large accessibility text sizing.

**Status**
- [ ] Pass
- [ ] Fail

---

### Offline Mode

**Purpose**
Verify the offline-first architecture.

**Preconditions**
- Disable WiFi and Cellular Data.

**Steps**
1. Launch the app.
2. Log a period and a daily symptom.
3. View Insights and Learn content.
4. Export data.

**Expected Result**
- The app operates flawlessly with zero latency.
- No network error banners or crashes occur.
- All data is saved and retrieved locally via SQLite without issue.

**Status**
- [ ] Pass
- [ ] Fail

---

## 4. End-to-End Regression Checklist

Use this high-level checklist for subsequent rapid regression passes before a release.

- [ ] Fresh install
- [ ] Onboarding
- [ ] Dashboard
- [ ] Calendar
- [ ] Start period
- [ ] End period
- [ ] Daily log
- [ ] Insights
- [ ] Learn
- [ ] Settings
- [ ] Privacy
- [ ] Notifications
- [ ] Export
- [ ] Import
- [ ] Accessibility
- [ ] Offline mode
- [ ] Restart persistence
- [ ] App upgrade (installing over an older version)
- [ ] Database integrity

---

## 5. Edge Case Testing

Ensure these specific outlier scenarios do not crash the app or corrupt data:

- [ ] Very short cycles (under 15 days, check 14 vs 15 day boundary).
- [ ] Exclude all cycles from predictions (fallback math check).
- [ ] Very long cycles (over 60 days).
- [ ] Multiple retroactive cycle edits causing overlaps.
- [ ] Duplicate daily logs for the same date.
- [ ] Missing non-required profile fields.
- [ ] Empty database (zero cycles).
- [ ] Large database (5+ years of historical cycle data).
- [ ] Corrupted import file selected in Data Management.
- [ ] Notification permission denied at the OS level.
- [ ] Biometric hardware unavailable or disabled.
- [ ] Device rotation (if supported).
- [ ] Background/foreground state transitions during active navigation.

---

## 6. Performance Testing

Verify the application remains highly performant under load.

- [ ] **Cold launch:** App should be usable within 2-3 seconds.
- [ ] **Warm launch:** Instant resume.
- [ ] **Navigation smoothness:** No frame drops when switching tabs.
- [ ] **Calendar scrolling:** 60fps scrolling through years of data.
- [ ] **Large history performance:** Insights load rapidly even with 50+ cycles.
- [ ] **Export performance:** Serialization completes without locking the UI thread excessively.

---

## 7. Release Sign-off

| Category | Status | Notes |
|----------|--------|------|
| Architecture | ☐ | |
| Functionality | ☐ | |
| UI | ☐ | |
| Accessibility | ☐ | |
| Privacy | ☐ | |
| Notifications | ☐ | |
| Backup & Restore | ☐ | |
| Offline Support | ☐ | |
| Performance | ☐ | |

*Tester Signature: _______________________ Date: ___________*

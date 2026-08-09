# Alert/Dialog Standardization Implementation Plan

## 1. Objective
Standardize all application-owned alerts and dialogs across the LunaBloom codebase to use the established design system. Currently, the app relies heavily on native OS `Alert.alert()` calls which bypass the design system, creating visual and behavioral inconsistencies. This plan defines the migration strategy to replace these native alerts with branded custom modal components.

## 2. Current Verified Architecture
The current architecture relies on a domain → presentation error flow:
1. Domain use cases (e.g., `StartPeriod`, `EndPeriod`) throw typed errors enforcing business rules.
2. Presentation stores (e.g., `useCycleStore`) re-throw these errors.
3. Screen-level handlers catch the errors and invoke native OS `Alert.alert()`.

There is one custom, themed component, `ConfirmModal`, which is correctly implemented and used for validation warnings and confirmations. However, it requires two buttons (Cancel + Confirm) and lacks a single-button dismissal variant, which is why developers fell back to `Alert.alert()` for simple errors, successes, and info messages.

Legitimate platform-owned UI (like `DateTimePicker` and OS permission dialogs) and full-screen UI gates (like `LockScreen`) are also present and correctly implemented.

## 3. Audit Verification Results
The findings in `docs/20_AlertDialogAudit.md` have been fully verified against the source code:
- **Verified counts:** 24 `Alert.alert()` invocations and 3 `ConfirmModal` renders were found in the codebase.
- **Discrepancies:** No discrepancies were found with the corrected v1.1 audit.
- **New findings:** None. The audit is comprehensive.
- **Obsolete findings:** None.
- **Ambiguous cases (A24 Verified):** The `A24` (PIN length validation) alert triggers if the length is not 4. However, the UI submit button `<Button label="Set PIN" disabled={pin.length !== 4} />` natively disables interaction when the length is not 4. There is no other path calling the handler and no `onSubmitEditing` hook on the `TextInput`. Therefore, `A24` is completely unreachable and will be safely removed.

## 4. Target Architecture
The target architecture introduces a dual-modal system:
- **`ConfirmModal`:** Used strictly for two-action flows (Cancel + Confirm) such as warnings and destructive actions.
- **`AlertModal` (NEW):** Used for single-action dismissals (Error, Success, Info).

The domain → presentation error flow will remain entirely untouched. Only the final presentation mechanism (the UI component) will change from `Alert.alert()` to `AlertModal` or `ConfirmModal`.

## 5. ConfirmModal Responsibility
`ConfirmModal` will remain responsible for:
- Confirmations
- Pre-flight warnings (e.g., cycle validation warnings)
- Destructive confirmations (e.g., deleting data, removing PIN)
- Two-action interactions (Cancel + Confirm)

It will NOT be modified to support single-button dismissals.

## 6. AlertModal Responsibility
A new reusable `AlertModal` component will be created, responsible for:
- Displaying single-dismissal dialogs.
- Presenting Error, Success, and Info messages.
- Ensuring visual consistency with the LunaBloom design system (sharing tokens with `ConfirmModal`).

## 7. AlertModal Proposed API
The proposed API for `AlertModal` (`src/presentation/components/ui/AlertModal.tsx`):
```tsx
import { View, StyleSheet, Modal, TouchableOpacity } from 'react-native';
// imports ...

interface AlertModalProps {
  visible: boolean;
  type: 'error' | 'success' | 'info';
  title: string;
  message: string;
  dismissLabel?: string; // defaults to 'OK'
  onDismiss: () => void;
}
```
Visual mapping based on `type`:
- `error`: `feather/alert-circle` icon, `semantic.error` background (20% opacity), `variant="danger"` button.
- `success`: `feather/check-circle` icon, `semantic.success` background (20% opacity), `variant="primary"` button.
- `info`: `feather/info` icon, `brand.primary` background (20% opacity), `variant="secondary"` button.

*(Note: `alert-circle`, `check-circle`, and `info` have been verified to exist in the `@expo/vector-icons` Feather library already in use.)*

## 8. Design-System Integration
`AlertModal` will use the exact same structural design tokens as `ConfirmModal`:
- `colors.overlay` for the backdrop.
- `colors.background` for the modal container.
- `colors.shadow` for the shadow color (with the same hardcoded elevation/opacity for consistency).
- `borderRadius.xl` and `spacing[6]` for the container layout.
- `Heading level="h3"` and `Text variant="body"` for typography.

## 9. Migration Matrix

| ID | File | Current Mechanism | Current Purpose | Target | Reason | Priority |
|----|------|-------------------|-----------------|--------|--------|----------|
| A01 | `index.tsx` | `Alert.alert` | Start Period Error | `ALERTMODAL_ERROR` | Domain error feedback | High |
| A02 | `index.tsx` | `Alert.alert` | End Period Error | `ALERTMODAL_ERROR` | Domain error feedback | High |
| A03 | `index.tsx` | `Alert.alert` | Start Period Error (post-confirm) | `ALERTMODAL_ERROR` | Domain error feedback | High |
| A05 | `calendar.tsx` | `Alert.alert` | End Period Error (post-confirm) | `ALERTMODAL_ERROR` | Domain error feedback | High |
| A06 | `calendar.tsx` | `Alert.alert` | End Period Error | `ALERTMODAL_ERROR` | Domain error feedback | High |
| A07 | `calendar.tsx` | `Alert.alert` | Start Period Error (post-confirm) | `ALERTMODAL_ERROR` | Domain error feedback | High |
| A08 | `calendar.tsx` | `Alert.alert` | Start Period Error | `ALERTMODAL_ERROR` | Domain error feedback | High |
| A09 | `calendar.tsx` | `Alert.alert` | Edit Cycle Error | `ALERTMODAL_ERROR` | Domain error feedback | High |
| A10 | `calendar.tsx` | `Alert.alert` | Delete Cycle Error | `ALERTMODAL_ERROR` | Domain error feedback | High |
| A18 | `data.tsx` | `Alert.alert` | Import Backup Confirmation | `CONFIRMMODAL` | Destructive action confirmation | High |
| A26 | `privacy.tsx` | `Alert.alert` | Remove PIN Confirmation | `CONFIRMMODAL` | Destructive action confirmation | High |
| A14 | `cycle.tsx` | `Alert.alert` | Save Error | `ALERTMODAL_ERROR` | Unexpected error feedback | Medium |
| A15 | `health.tsx` | `Alert.alert` | Save Error | `ALERTMODAL_ERROR` | Unexpected error feedback | Medium |
| A16 | `profile.tsx` | `Alert.alert` | Save Error | `ALERTMODAL_ERROR` | Unexpected error feedback | Medium |
| A17 | `data.tsx` | `Alert.alert` | Export Error | `ALERTMODAL_ERROR` | Action failure feedback | Medium |
| A19 | `data.tsx` | `Alert.alert` | Import Success | `ALERTMODAL_SUCCESS` | Action success feedback | Medium |
| A20 | `data.tsx` | `Alert.alert` | Import Error | `ALERTMODAL_ERROR` | Action failure feedback | Medium |
| A21 | `notifications.tsx` | `Alert.alert` | Permission Denied | `ALERTMODAL_INFO` | OS denied feedback | Medium |
| A22 | `notifications.tsx` | `Alert.alert` | Reminders Scheduled | `ALERTMODAL_SUCCESS` | Action success feedback | Medium |
| A25 | `privacy.tsx` | `Alert.alert` | PIN Set Success | `ALERTMODAL_SUCCESS` | Action success feedback | Medium |
| A23 | `notifications.tsx` | `Alert.alert` | Notifications Disabled | `ALERTMODAL_INFO` | Toggle feedback | Low |
| A24 | `privacy.tsx` | `Alert.alert` | Invalid PIN Length | `REMOVE` | Redundant / unreachable | Low |
| A12 | `settings.tsx` | `Alert.alert` | Terms of Service Placeholder | `DEFER` | Unimplemented feature | Low |
| A13 | `settings.tsx` | `Alert.alert` | Privacy Policy Placeholder | `DEFER` | Unimplemented feature | Low |

## 10. Implementation Phases

**Phase 1 — Core/high-risk flows**
1. Create `AlertModal` component and export it.
2. Migrate A18 and A26 to use `ConfirmModal`.
3. Migrate A01-A10 (Dashboard and Calendar) to use `AlertModal type="error"`.

**Phase 2 — Settings and secondary flows**
1. Migrate Settings errors (A14-A17, A20) to `AlertModal type="error"`.
2. Migrate Settings success/info alerts (A19, A21, A22, A25) to `AlertModal`.

**Phase 3 — Cleanup/deferred**
1. Remove A24 (Privacy PIN length check) as it's unreachable.
2. Migrate A23 to `AlertModal type="info"`.
3. Leave A12 and A13 as `Alert.alert()` for now (deferred).

## 11. File-by-File Changes

`src/presentation/components/ui/AlertModal.tsx`
- **NEW FILE**
- **Purpose:** Reusable single-dismissal application alert.
- **Supports:** `error`, `success`, `info` variants.
- **Does not:** Handle confirmations.

`src/presentation/components/ui/index.ts`
- **Changes:** Export `AlertModal`.

`app/(tabs)/index.tsx`
- **Changes:** Add local `useState` to manage modal visibility, title, and message. Replace `Alert.alert` calls (A01, A02, A03) with state updates that trigger `<AlertModal type="error" />`.
- **Dependencies:** Needs `AlertModal`.

`app/(tabs)/calendar.tsx`
- **Changes:** Add local `useState` for error tracking. Replace `Alert.alert` calls (A05-A10) with `<AlertModal type="error" />` via state updates.
- **Dependencies:** Needs `AlertModal`.

`app/settings/data.tsx`
- **Changes:** Add local state variables for import confirmation (`ConfirmModal`), success/error states (`AlertModal`). Replace A17, A18, A19, A20 with these components.
- **Dependencies:** Needs `ConfirmModal`, `AlertModal`.

`app/settings/privacy.tsx`
- **Changes:** Add local state variables for remove PIN confirmation (`ConfirmModal`) and success (`AlertModal`). Replace A25, A26. Remove A24 completely.
- **Dependencies:** Needs `ConfirmModal`, `AlertModal`.

`app/settings/cycle.tsx`, `app/settings/health.tsx`, `app/settings/profile.tsx`
- **Changes:** Add local `errorState` and `<AlertModal type="error" />`. Replace A14, A15, A16.
- **Dependencies:** Needs `AlertModal`.

`app/settings/notifications.tsx`
- **Changes:** Add local state for info/success modals (`AlertModal`). Replace A21, A22, A23.
- **Dependencies:** Needs `AlertModal`.

*(Note on state management: We have verified there is no existing global modal-state hook or provider pattern in `src/presentation/hooks/` or elsewhere. Using standard local `useState` is appropriate and preferable to over-engineering a global store merely for this migration.)*

## 12. Domain/Presentation Boundaries
This implementation plan strictly preserves the existing boundaries. Domain use cases and services will continue throwing typed errors. The presentation components will catch these errors and update local state to render `AlertModal` or `ConfirmModal`. No validation logic will be moved into the presentation layer.

## 13. Sequential Modal Behavior
**CRITICAL:** When transitioning from a `ConfirmModal` directly to an `AlertModal` (e.g. Confirm Import -> Import Success/Error), we must ensure the `ConfirmModal` is closed *before* showing the `AlertModal`.
The flow must be:
1. `setConfirmVisible(false)`
2. `await performOperation()` (if asynchronous)
3. `setAlertVisible(true)`
This prevents multiple modals from being active simultaneously.

## 14. Message Text Preservation
**CRITICAL:** No user-facing message text should be changed during this migration unless strictly required for correctness. The objective is visual/interaction standardization, not rewriting the application's messaging.

## 15. Testing Strategy
**AlertModal:**
- Manually trigger all three variants (`error`, `success`, `info`) in a dummy screen or via existing flows to verify visual rendering, icon colors, button labels, and dismissal behavior.
- Ensure the Android back button triggers `onDismiss`.

**ConfirmModal:**
- Verify existing validation flows (e.g., Short Cycle warning in Dashboard) still work correctly.

**Migrated flows:**
- Test the "Import Backup" and "Remove PIN" flows to ensure `ConfirmModal` works, executes the correct callbacks, handles success/error subsequent modals cleanly, and prevents simultaneous modal rendering.
- Trigger domain errors (e.g., starting a period when one is active) to ensure the `AlertModal` renders the correct message.

## 16. Manual Verification
- Deploy to iOS Simulator and Android Emulator.
- Verify safe area and keyboard interactions (if any modal overlaps with keyboard).
- Verify the modal background fades in correctly and matches `ConfirmModal`.

## 17. Remaining Native Alerts
After this migration, the only expected `Alert.alert()` calls in the codebase will be A12 and A13 (Terms/Privacy placeholders). Legitimate platform UI like `DateTimePicker` and OS permission prompts will remain untouched.

## 18. Risks and Trade-offs
- **State Management Overhead:** Replacing inline `Alert.alert()` (which halts execution and blocks UI natively) with React components requires introducing new local state (`visible`, `title`, `message`) in every file that needs an alert. This adds boilerplate but is necessary for custom UI.
- **Sequential Modals:** Handled correctly via the steps in Section 13.

## 19. Rollback / Safety Considerations
Because we are only replacing UI calls and introducing local component state, we can easily rollback any file individually if a custom modal introduces bugs. Business logic remains untouched.

## 20. Files Expected to Change
- `src/presentation/components/ui/AlertModal.tsx` (New)
- `src/presentation/components/ui/index.ts`
- `app/(tabs)/index.tsx`
- `app/(tabs)/calendar.tsx`
- `app/settings/data.tsx`
- `app/settings/privacy.tsx`
- `app/settings/cycle.tsx`
- `app/settings/health.tsx`
- `app/settings/profile.tsx`
- `app/settings/notifications.tsx`

## 21. Final Implementation Checklist
- [ ] Create `AlertModal`.
- [ ] Migrate `data.tsx` and `privacy.tsx` destructive actions to `ConfirmModal`.
- [ ] Migrate Dashboard and Calendar errors to `AlertModal`.
- [ ] Migrate Settings screen alerts to `AlertModal`.
- [ ] Remove A24 `Alert.alert`.
- [ ] Ensure sequential modals do not overlap.
- [ ] Preserve all user-facing message text exactly.
- [ ] Preserve the existing control flow and timing of every alert.
- [ ] Only replace the presentation mechanism; do not change when an error, success, warning, or informational message is triggered.
- [ ] Test all flows manually.
- [ ] Search for `Alert.alert` to verify only A12/A13 remain.

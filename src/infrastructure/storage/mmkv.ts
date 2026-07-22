/**
 * MMKV storage instance — fast synchronous key-value store.
 * Uses react-native-mmkv v3+ API: createMMKV() factory function.
 *
 * Used for: app settings, theme preference, onboarding flag (fast gate check).
 * IMPORTANT: MMKV is synchronous — do NOT use for large blobs or health records.
 * Health data lives in SQLite (via repositories). MMKV is for lightweight config.
 *
 * ADR Reference: docs/adr/0002-use-sqlite.md
 */
import { createMMKV } from 'react-native-mmkv';
import type { MMKV } from 'react-native-mmkv';

/**
 * Singleton MMKV instance for app settings.
 * Encryption key added in Phase 6 (auth/PIN) via expo-secure-store.
 */
export const storage: MMKV = createMMKV({ id: 'lunabloom-settings' });

/**
 * Typed MMKV helpers — avoids raw string key usage throughout the app.
 */
export const AppStorage = {
  // Onboarding
  getOnboardingComplete: (): boolean =>
    storage.getBoolean('onboarding.completed') ?? false,
  setOnboardingComplete: (value: boolean): void =>
    storage.set('onboarding.completed', value),

  // Theme
  getThemeMode: (): 'light' | 'dark' | 'system' =>
    (storage.getString('app.themeMode') as 'light' | 'dark' | 'system') ?? 'system',
  setThemeMode: (mode: 'light' | 'dark' | 'system'): void =>
    storage.set('app.themeMode', mode),

  // Profile (lightweight, for quick reads — full profile in SQLite)
  getPreferredName: (): string | null =>
    storage.getString('profile.preferredName') ?? null,
  setPreferredName: (name: string): void =>
    storage.set('profile.preferredName', name),

  // Security
  getPINEnabled: (): boolean =>
    storage.getBoolean('security.pinEnabled') ?? false,
  setPINEnabled: (value: boolean): void =>
    storage.set('security.pinEnabled', value),
  getBiometricEnabled: (): boolean =>
    storage.getBoolean('security.biometricEnabled') ?? false,
  setBiometricEnabled: (value: boolean): void =>
    storage.set('security.biometricEnabled', value),
  getAutoLock: (): number =>
    storage.getNumber('security.autoLockMs') ?? 0,
  setAutoLock: (ms: number): void =>
    storage.set('security.autoLockMs', ms),

  // Clears ALL MMKV data — only used during "Delete All Data"
  clearAll: (): void => storage.clearAll(),
} as const;

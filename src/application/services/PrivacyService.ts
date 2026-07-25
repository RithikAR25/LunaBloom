import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import * as LocalAuthentication from 'expo-local-authentication';
import { AppState, AppStateStatus } from 'react-native';

const PIN_HASH_KEY = 'lunabloom_pin_hash';
const BIOMETRICS_ENABLED_KEY = 'lunabloom_biometrics_enabled';
const PIN_SALT = 'lunabloom_salt_2026';

export class PrivacyService {
  private static isLocked = false;
  private static lockListeners: ((locked: boolean) => void)[] = [];
  
  /**
   * Initializes privacy listeners and checks initial lock state on startup.
   */
  static async initialize() {
    AppState.addEventListener('change', this.handleAppStateChange);
    
    // Check if the app should be locked on cold start
    const hasPin = await this.hasPinSet();
    if (hasPin) {
      this.setLocked(true);
    }
  }

  private static handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (nextAppState === 'background' || nextAppState === 'inactive') {
      const hasPin = await this.hasPinSet();
      if (hasPin) {
        this.setLocked(true);
      }
    }
  };

  /**
   * Generates a salted hash for the PIN.
   */
  private static async hashPin(pin: string): Promise<string> {
    const salted = `${PIN_SALT}_${pin}`;
    return await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, salted);
  }

  /**
   * Sets or updates the user's PIN.
   */
  static async setPin(pin: string): Promise<void> {
    const hash = await this.hashPin(pin);
    await SecureStore.setItemAsync(PIN_HASH_KEY, hash);
  }

  /**
   * Validates the provided PIN against the stored hash.
   */
  static async validatePin(pin: string): Promise<boolean> {
    const storedHash = await SecureStore.getItemAsync(PIN_HASH_KEY);
    if (!storedHash) return false;
    
    const inputHash = await this.hashPin(pin);
    const isValid = storedHash === inputHash;
    if (isValid) {
      this.setLocked(false);
    }
    return isValid;
  }

  /**
   * Removes the PIN and disables biometrics.
   */
  static async removePin(): Promise<void> {
    await SecureStore.deleteItemAsync(PIN_HASH_KEY);
    await this.setBiometricsEnabled(false);
    this.setLocked(false);
  }

  /**
   * Returns true if a PIN is currently configured.
   */
  static async hasPinSet(): Promise<boolean> {
    const storedHash = await SecureStore.getItemAsync(PIN_HASH_KEY);
    return !!storedHash;
  }

  /**
   * Enables or disables biometric authentication.
   */
  static async setBiometricsEnabled(enabled: boolean): Promise<void> {
    await SecureStore.setItemAsync(BIOMETRICS_ENABLED_KEY, enabled ? 'true' : 'false');
  }

  /**
   * Returns true if biometric authentication is enabled in the app.
   */
  static async isBiometricsEnabled(): Promise<boolean> {
    const val = await SecureStore.getItemAsync(BIOMETRICS_ENABLED_KEY);
    return val === 'true';
  }

  /**
   * Checks if the device supports biometric authentication.
   */
  static async canUseBiometrics(): Promise<boolean> {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    return hasHardware && isEnrolled;
  }

  /**
   * Attempts to authenticate using biometrics.
   */
  static async authenticateWithBiometrics(): Promise<boolean> {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Unlock LunaBloom',
      cancelLabel: 'Use PIN',
      fallbackLabel: 'Use PIN',
      disableDeviceFallback: true, // We want them to use our PIN fallback, not device passcode
    });

    if (result.success) {
      this.setLocked(false);
    }
    return result.success;
  }

  // --- Lock State Management ---

  static getIsLocked(): boolean {
    return this.isLocked;
  }

  static setLocked(locked: boolean) {
    this.isLocked = locked;
    this.notifyListeners();
  }

  static subscribe(listener: (locked: boolean) => void): () => void {
    this.lockListeners.push(listener);
    // Initial call
    listener(this.isLocked);
    return () => {
      this.lockListeners = this.lockListeners.filter(l => l !== listener);
    };
  }

  private static notifyListeners() {
    this.lockListeners.forEach(listener => listener(this.isLocked));
  }
}

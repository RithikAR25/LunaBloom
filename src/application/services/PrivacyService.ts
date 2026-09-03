import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import * as LocalAuthentication from 'expo-local-authentication';
import { AppState, AppStateStatus } from 'react-native';
import crypto from 'react-native-quick-crypto';
import { Buffer } from '@craftzdog/react-native-buffer';

// Constants
const PIN_HASH_KEY = 'lunabloom_pin_hash';
const PIN_SALT_KEY = 'lunabloom_pin_salt';
const PIN_VERSION_KEY = 'lunabloom_pin_hash_version';
const PIN_ITERATIONS_KEY = 'lunabloom_pin_kdf_iterations';

const FAILED_ATTEMPTS_KEY = 'lunabloom_failed_attempts';
const LOCKOUT_UNTIL_KEY = 'lunabloom_lockout_until';

const BIOMETRICS_ENABLED_KEY = 'lunabloom_biometrics_enabled';

// Legacy V1 Salt
const V1_PIN_SALT = 'lunabloom_salt_2026';

// Security Policy
const V2_TARGET_ITERATIONS = 600000;
const MAX_LOCKOUT_MINUTES = 60;

export type PinValidationResult = 
  | { status: 'success' }
  | { status: 'invalid'; attempts: number }
  | { status: 'locked'; lockoutUntil: number };

export class PrivacyService {
  private static isLocked = false;
  private static lockListeners: ((locked: boolean) => void)[] = [];
  
  /**
   * Initializes privacy listeners and checks initial lock state on startup.
   */
  static async initialize() {
    AppState.addEventListener('change', this.handleAppStateChange);
    
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

  // --- Lockout Management ---

  static async getLockoutState(): Promise<{ failedAttempts: number; lockoutUntil: number | null }> {
    const attemptsStr = await SecureStore.getItemAsync(FAILED_ATTEMPTS_KEY);
    const lockoutStr = await SecureStore.getItemAsync(LOCKOUT_UNTIL_KEY);
    
    return {
      failedAttempts: attemptsStr ? parseInt(attemptsStr, 10) : 0,
      lockoutUntil: lockoutStr ? parseInt(lockoutStr, 10) : null,
    };
  }

  private static async recordFailedAttempt(): Promise<number> {
    const state = await this.getLockoutState();
    const newAttempts = state.failedAttempts + 1;
    
    let newLockoutUntil = state.lockoutUntil;

    // Apply progressive lockout math: 1, 2, 4, 8... (starts at attempt 3)
    if (newAttempts >= 3) {
      const lockMinutes = Math.min(Math.pow(2, newAttempts - 3), MAX_LOCKOUT_MINUTES);
      newLockoutUntil = Date.now() + lockMinutes * 60 * 1000;
      await SecureStore.setItemAsync(LOCKOUT_UNTIL_KEY, newLockoutUntil.toString());
    }

    await SecureStore.setItemAsync(FAILED_ATTEMPTS_KEY, newAttempts.toString());
    return newAttempts;
  }

  static async resetLockoutState(): Promise<void> {
    await SecureStore.deleteItemAsync(FAILED_ATTEMPTS_KEY);
    await SecureStore.deleteItemAsync(LOCKOUT_UNTIL_KEY);
  }

  // --- Cryptography & Migrations ---

  /**
   * Sets a new PIN using the V2 PBKDF2 format.
   */
  static async setPin(pin: string): Promise<void> {
    // Generate 16 bytes of cryptographically secure random data
    const saltBytes = await Crypto.getRandomBytesAsync(16);
    const saltHex = Buffer.from(saltBytes).toString('hex');
    
    // Hash with PBKDF2
    const hashBuffer = crypto.pbkdf2Sync(pin, saltHex, V2_TARGET_ITERATIONS, 32, 'sha256');
    const hashHex = hashBuffer.toString('hex');
    
    // Transactional save (Version last)
    await SecureStore.setItemAsync(PIN_SALT_KEY, saltHex);
    await SecureStore.setItemAsync(PIN_ITERATIONS_KEY, V2_TARGET_ITERATIONS.toString());
    await SecureStore.setItemAsync(PIN_HASH_KEY, hashHex);
    await SecureStore.setItemAsync(PIN_VERSION_KEY, '2');
  }

  /**
   * Validates the provided PIN against the stored hash, handling version migration if necessary.
   */
  static async validatePin(pin: string): Promise<PinValidationResult> {
    // 1. Enforce Lockout Policy First
    const lockoutState = await this.getLockoutState();
    if (lockoutState.lockoutUntil && Date.now() < lockoutState.lockoutUntil) {
      return { status: 'locked', lockoutUntil: lockoutState.lockoutUntil };
    }

    const version = await SecureStore.getItemAsync(PIN_VERSION_KEY) || '1';
    let isValid = false;

    if (version === '1') {
      isValid = await this.verifyV1Hash(pin);
      if (isValid) {
        // Upgrade to V2 immediately on success
        await this.setPin(pin);
      }
    } else {
      isValid = await this.verifyV2Hash(pin);
    }

    if (isValid) {
      await this.resetLockoutState();
      this.setLocked(false);
      return { status: 'success' };
    } else {
      const attempts = await this.recordFailedAttempt();
      return { status: 'invalid', attempts };
    }
  }

  private static async verifyV1Hash(pin: string): Promise<boolean> {
    const storedHash = await SecureStore.getItemAsync(PIN_HASH_KEY);
    if (!storedHash) return false;
    const salted = `${V1_PIN_SALT}_${pin}`;
    const inputHash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, salted);
    return storedHash === inputHash;
  }

  private static async verifyV2Hash(pin: string): Promise<boolean> {
    const storedHashHex = await SecureStore.getItemAsync(PIN_HASH_KEY);
    const storedSaltHex = await SecureStore.getItemAsync(PIN_SALT_KEY);
    const storedIterationsStr = await SecureStore.getItemAsync(PIN_ITERATIONS_KEY);
    
    if (!storedHashHex || !storedSaltHex || !storedIterationsStr) {
      return false; // Corrupted V2 state
    }

    const iterations = parseInt(storedIterationsStr, 10);
    
    try {
      const inputHashBuffer = crypto.pbkdf2Sync(pin, storedSaltHex, iterations, 32, 'sha256');
      const storedHashBuffer = Buffer.from(storedHashHex, 'hex');
      
      // Constant-time comparison requires equal length buffers
      if (inputHashBuffer.length !== storedHashBuffer.length) {
        return false;
      }
      return crypto.timingSafeEqual(inputHashBuffer, storedHashBuffer);
    } catch (e) {
      // Graceful fallback if crypto library throws on invalid lengths/formats
      return false;
    }
  }

  /**
   * Removes the PIN and clears security state.
   */
  static async removePin(): Promise<void> {
    await SecureStore.deleteItemAsync(PIN_HASH_KEY);
    await SecureStore.deleteItemAsync(PIN_SALT_KEY);
    await SecureStore.deleteItemAsync(PIN_VERSION_KEY);
    await SecureStore.deleteItemAsync(PIN_ITERATIONS_KEY);
    await this.resetLockoutState();
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

  // --- Biometrics ---

  static async setBiometricsEnabled(enabled: boolean): Promise<void> {
    await SecureStore.setItemAsync(BIOMETRICS_ENABLED_KEY, enabled ? 'true' : 'false');
  }

  static async isBiometricsEnabled(): Promise<boolean> {
    const val = await SecureStore.getItemAsync(BIOMETRICS_ENABLED_KEY);
    return val === 'true';
  }

  static async canUseBiometrics(): Promise<boolean> {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    return hasHardware && isEnrolled;
  }

  static async authenticateWithBiometrics(): Promise<boolean> {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Unlock LunaBloom',
      cancelLabel: 'Use PIN',
      fallbackLabel: 'Use PIN',
      disableDeviceFallback: true,
    });

    if (result.success) {
      // A successful biometric login resets the PIN lockout penalty
      await this.resetLockoutState();
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
    listener(this.isLocked);
    return () => {
      this.lockListeners = this.lockListeners.filter(l => l !== listener);
    };
  }

  private static notifyListeners() {
    this.lockListeners.forEach(listener => listener(this.isLocked));
  }
}

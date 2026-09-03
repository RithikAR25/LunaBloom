import { useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Animated, AppState } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { spacing } from '@/design-system';
import { Text } from '../ui/Text';
import { Heading } from '../ui/Heading';
import { Ionicons } from '@expo/vector-icons';
import { PrivacyService } from '../../../application/services/PrivacyService';
import * as Haptics from 'expo-haptics';

export function LockScreen() {
  const { colors } = useTheme();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [canUseBiometrics, setCanUseBiometrics] = useState(false);
  
  // Lockout State
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);

  // Local state for modal visibility and animation lifecycle
  const [modalVisible, setModalVisible] = useState(false);
  const modalVisibleRef = useRef(false);
  const isExitingRef = useRef(false);
  
  // Animation values
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const unlockProgress = useRef(new Animated.Value(0)).current;
  const modalOpacity = useRef(new Animated.Value(1)).current;
  const modalScale = useRef(new Animated.Value(1)).current;

  const fetchLockoutState = useCallback(async () => {
    const state = await PrivacyService.getLockoutState();
    setLockoutUntil(state.lockoutUntil);
  }, []);

  // Update timer based on absolute Date.now() difference
  useEffect(() => {
    if (!lockoutUntil) {
      setRemainingSeconds(null);
      return;
    }

    const updateTimer = () => {
      const remaining = Math.ceil((lockoutUntil - Date.now()) / 1000);
      if (remaining <= 0) {
        setLockoutUntil(null);
        setRemainingSeconds(null);
      } else {
        setRemainingSeconds(remaining);
      }
    };
    
    updateTimer(); // Initial calculation
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [lockoutUntil]);

  // Recalculate timer immediately if app comes to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active' && modalVisibleRef.current) {
        fetchLockoutState();
      }
    });
    return () => subscription.remove();
  }, [fetchLockoutState]);

  const playUnlockAnimation = useCallback(() => {
    if (isExitingRef.current) return;
    isExitingRef.current = true;
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

    Animated.timing(unlockProgress, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(modalOpacity, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(modalScale, {
            toValue: 1.05,
            duration: 250,
            useNativeDriver: true,
          }),
        ]).start(() => {
          modalVisibleRef.current = false;
          setModalVisible(false);
          isExitingRef.current = false;
        });
      }, 150);
    });
  }, [unlockProgress, modalOpacity, modalScale]);

  const handleBiometrics = useCallback(async () => {
    if (isExitingRef.current) return;
    await PrivacyService.authenticateWithBiometrics();
    // If successful, PrivacyService sets lock to false, which triggers our subscriber to run playUnlockAnimation.
  }, []);

  const checkBiometrics = useCallback(async () => {
    const isEnabled = await PrivacyService.isBiometricsEnabled();
    const canUse = await PrivacyService.canUseBiometrics();
    setCanUseBiometrics(isEnabled && canUse);

    if (isEnabled && canUse) {
      setTimeout(() => {
        handleBiometrics();
      }, 500);
    }
  }, [handleBiometrics]);

  useEffect(() => {
    const unsubscribe = PrivacyService.subscribe(locked => {
      if (locked) {
        setPin('');
        setError(false);
        isExitingRef.current = false;
        modalVisibleRef.current = true;
        setModalVisible(true);
        
        unlockProgress.setValue(0);
        modalOpacity.setValue(1);
        modalScale.setValue(1);
        shakeAnim.setValue(0);
        
        fetchLockoutState();
        checkBiometrics();
      } else {
        if (modalVisibleRef.current && !isExitingRef.current) {
          playUnlockAnimation();
        } else {
          modalVisibleRef.current = false;
          setModalVisible(false);
        }
      }
    });
    
    return () => {
      unsubscribe();
      unlockProgress.stopAnimation();
      modalOpacity.stopAnimation();
      modalScale.stopAnimation();
      shakeAnim.stopAnimation();
    };
  }, [checkBiometrics, playUnlockAnimation, fetchLockoutState, unlockProgress, modalOpacity, modalScale, shakeAnim]);

  const triggerShake = () => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true })
    ]).start();
  };

  const handleKeyPress = async (key: string) => {
    if (isExitingRef.current || remainingSeconds) return;

    if (key === 'delete') {
      if (pin.length > 0) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        setPin(prev => prev.slice(0, -1));
        setError(false);
      }
      return;
    }

    if (pin.length < 4) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      const newPin = pin + key;
      setPin(newPin);
      setError(false);

      if (newPin.length === 4) {
        const result = await PrivacyService.validatePin(newPin);
        
        if (result.status === 'invalid') {
          setError(true);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
          triggerShake();
          setTimeout(() => setPin(''), 500);
          
          // Check if we hit the lockout threshold
          await fetchLockoutState();
        } else if (result.status === 'locked') {
          setLockoutUntil(result.lockoutUntil);
          triggerShake();
          setPin('');
        }
      }
    }
  };

  if (!modalVisible) return null;

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Modal visible={modalVisible} transparent={true} statusBarTranslucent animationType="fade">
      <Animated.View style={[
        styles.container, 
        { 
          backgroundColor: colors.background,
          opacity: modalOpacity,
          transform: [{ scale: modalScale }]
        }
      ]}>
        <View style={styles.content}>
          <Animated.View style={[styles.iconContainer, { transform: [{ translateX: shakeAnim }] }]}>
            <View style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }}>
              <Animated.View style={{
                position: 'absolute',
                opacity: unlockProgress.interpolate({ inputRange: [0, 1], outputRange: [1, 0] })
              }}>
                <Ionicons name="lock-closed" size={48} color={colors.brand.primary} />
              </Animated.View>
              <Animated.View style={{
                position: 'absolute',
                opacity: unlockProgress,
                transform: [
                  { scale: unlockProgress.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.92, 1.05, 1] }) }
                ]
              }}>
                <Ionicons name="lock-open" size={48} color={colors.brand.primary} />
              </Animated.View>
            </View>
          </Animated.View>
          
          <Heading level="h2" style={{ color: colors.text.primary, marginBottom: spacing[2] }}>
            App Locked
          </Heading>
          <Text variant="body" style={{ color: colors.text.secondary, marginBottom: spacing[8] }}>
            {remainingSeconds ? 'Too many failed attempts' : 'Enter your PIN to unlock LunaBloom'}
          </Text>

          <Animated.View style={[styles.dotsContainer, { transform: [{ translateX: shakeAnim }] }]}>
            {[0, 1, 2, 3].map(i => (
              <View 
                key={i} 
                style={[
                  styles.dot, 
                  { 
                    borderColor: (error || remainingSeconds) ? colors.semantic.error : colors.border,
                    backgroundColor: pin.length > i 
                      ? (error || remainingSeconds ? colors.semantic.error : colors.brand.primary) 
                      : 'transparent'
                  }
                ]} 
              />
            ))}
          </Animated.View>
        </View>

        <View style={styles.bottomSection}>
          {remainingSeconds ? (
            <View style={styles.lockoutContainer}>
              <Heading level="h3" style={{ color: colors.semantic.error, marginBottom: spacing[2] }}>
                Try again in
              </Heading>
              <Heading level="h1" style={{ color: colors.text.primary, marginBottom: spacing[8] }}>
                {formatTime(remainingSeconds)}
              </Heading>
              
              {canUseBiometrics && (
                <TouchableOpacity 
                  accessibilityRole="button"
                  onPress={handleBiometrics}
                  style={styles.biometricFallbackButton}
                >
                  <Ionicons name="finger-print" size={48} color={colors.brand.primary} />
                  <Text style={{ color: colors.brand.primary, marginTop: spacing[2], fontWeight: '500' }}>
                    Use Biometrics
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.keypad}>
              {[['1','2','3'], ['4','5','6'], ['7','8','9'], [canUseBiometrics ? 'bio' : '', '0', 'delete']].map((row, i) => (
                <View key={i} style={styles.row}>
                  {row.map((key, j) => (
                    <TouchableOpacity accessibilityRole="button"
                      key={j}
                      style={styles.key}
                      onPress={() => key === 'bio' ? handleBiometrics() : (key ? handleKeyPress(key) : null)}
                      disabled={!key}
                    >
                      {key === 'bio' ? (
                        <Ionicons name="finger-print" size={32} color={colors.text.primary} />
                      ) : key === 'delete' ? (
                        <Ionicons name="backspace-outline" size={28} color={colors.text.primary} />
                      ) : (
                        <Text style={[styles.keyText, { color: colors.text.primary }]}>{key}</Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </View>
          )}
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  iconContainer: {
    marginBottom: spacing[4],
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: spacing[4],
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
  },
  keypad: {
    paddingHorizontal: spacing[8],
  },
  bottomSection: {
    minHeight: 420,
    paddingBottom: 60,
    justifyContent: 'flex-start',
  },
  lockoutContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: spacing[8],
  },
  biometricFallbackButton: {
    alignItems: 'center',
    padding: spacing[4],
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing[4],
  },
  key: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyText: {
    fontSize: 28,
    fontWeight: '500',
  },
});

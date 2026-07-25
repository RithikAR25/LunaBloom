import { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Animated } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { spacing } from '@/design-system';
import { Text } from '../ui/Text';
import { Heading } from '../ui/Heading';
import { Ionicons } from '@expo/vector-icons';
import { PrivacyService } from '../../../application/services/PrivacyService';

export function LockScreen() {
  const { colors } = useTheme();
  const [isLocked, setIsLocked] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [canUseBiometrics, setCanUseBiometrics] = useState(false);
  
  // Shake animation for error
  const shakeAnim = new Animated.Value(0);

  const handleBiometrics = useCallback(async () => {
    await PrivacyService.authenticateWithBiometrics();
  }, []);

  const checkBiometrics = useCallback(async () => {
    const isEnabled = await PrivacyService.isBiometricsEnabled();
    const canUse = await PrivacyService.canUseBiometrics();
    setCanUseBiometrics(isEnabled && canUse);

    if (isEnabled && canUse) {
      // Auto-prompt biometrics when locking screen appears
      setTimeout(() => {
        handleBiometrics();
      }, 500);
    }
  }, [handleBiometrics]);

  useEffect(() => {
    // Subscribe to lock state
    const unsubscribe = PrivacyService.subscribe(locked => {
      setIsLocked(locked);
      if (locked) {
        setPin('');
        setError(false);
        checkBiometrics();
      }
    });
    return unsubscribe;
  }, [checkBiometrics]);

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true })
    ]).start();
  };

  const handleKeyPress = async (key: string) => {
    if (key === 'delete') {
      setPin(prev => prev.slice(0, -1));
      setError(false);
      return;
    }

    if (pin.length < 4) {
      const newPin = pin + key;
      setPin(newPin);
      setError(false);

      if (newPin.length === 4) {
        const isValid = await PrivacyService.validatePin(newPin);
        if (!isValid) {
          setError(true);
          triggerShake();
          setTimeout(() => setPin(''), 500);
        }
      }
    }
  };

  if (!isLocked) return null;

  return (
    <Modal visible={isLocked} animationType="fade" statusBarTranslucent>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name="lock-closed" size={48} color={colors.brand.primary} />
          </View>
          <Heading level="h2" style={{ color: colors.text.primary, marginBottom: spacing[2] }}>
            App Locked
          </Heading>
          <Text variant="body" style={{ color: colors.text.secondary, marginBottom: spacing[8] }}>
            Enter your PIN to unlock LunaBloom
          </Text>

          <Animated.View style={[styles.dotsContainer, { transform: [{ translateX: shakeAnim }] }]}>
            {[0, 1, 2, 3].map(i => (
              <View 
                key={i} 
                style={[
                  styles.dot, 
                  { 
                    borderColor: error ? colors.semantic.error : colors.border,
                    backgroundColor: pin.length > i 
                      ? (error ? colors.semantic.error : colors.brand.primary) 
                      : 'transparent'
                  }
                ]} 
              />
            ))}
          </Animated.View>
        </View>

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
      </View>
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
    paddingBottom: 60,
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

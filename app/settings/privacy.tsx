import { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TextInput, Switch } from 'react-native';
import { useTheme } from '../../src/presentation/hooks/useTheme';
import { spacing, borderRadius, fontSize, letterSpacing } from '@/design-system';
import { Text } from '../../src/presentation/components/ui/Text';
import { Button } from '../../src/presentation/components/ui/Button';
import { ConfirmModal } from '../../src/presentation/components/ui/ConfirmModal';
import { AlertModal } from '../../src/presentation/components/ui/AlertModal';
import { PrivacyService } from '../../src/application/services/PrivacyService';

export default function PrivacySettingsScreen() {
  const { colors } = useTheme();
  const [hasPin, setHasPin] = useState(false);
  const [pin, setPin] = useState('');
  const [canUseBiometrics, setCanUseBiometrics] = useState(false);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [alertState, setAlertState] = useState<{ visible: boolean; type: 'error' | 'success' | 'info'; title: string; message: string; }>({
    visible: false,
    type: 'success',
    title: '',
    message: ''
  });

  const loadPrivacyState = useCallback(async () => {
    const pinSet = await PrivacyService.hasPinSet();
    setHasPin(pinSet);
    
    const bioAvailable = await PrivacyService.canUseBiometrics();
    setCanUseBiometrics(bioAvailable);
    
    if (bioAvailable) {
      const bioEnabled = await PrivacyService.isBiometricsEnabled();
      setBiometricsEnabled(bioEnabled);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    PrivacyService.hasPinSet().then(pinSet => {
      if (mounted) setHasPin(pinSet);
    });
    PrivacyService.canUseBiometrics().then(bioAvailable => {
      if (mounted) setCanUseBiometrics(bioAvailable);
      if (bioAvailable) {
        PrivacyService.isBiometricsEnabled().then(bioEnabled => {
          if (mounted) setBiometricsEnabled(bioEnabled);
        });
      }
    });
    return () => { mounted = false; };
  }, []);

  const handleSetPin = async () => {
    await PrivacyService.setPin(pin);
    setPin('');
    await loadPrivacyState();
    setAlertState({
      visible: true,
      type: 'success',
      title: 'Success',
      message: 'App PIN has been set.'
    });
  };

  const handleRemovePin = async () => {
    setConfirmVisible(true);
  };

  const confirmRemovePin = async () => {
    setConfirmVisible(false);
    await PrivacyService.removePin();
    await loadPrivacyState();
  };

  const toggleBiometrics = async (val: boolean) => {
    await PrivacyService.setBiometricsEnabled(val);
    setBiometricsEnabled(val);
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      
      <View style={styles.section}>
        <Text variant="caption" weight="bold" style={[styles.label, { color: colors.text.secondary }]}>
          APP LOCK (PIN)
        </Text>
        
        {hasPin ? (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.borderSubtle, padding: spacing[4] }]}>
            <Text style={{ color: colors.text.primary, marginBottom: spacing[4] }}>
              Your app is currently locked with a PIN.
            </Text>
            <Button label="Remove PIN" variant="danger" onPress={handleRemovePin} />
          </View>
        ) : (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.borderSubtle, padding: spacing[4] }]}>
            <TextInput 
              accessibilityLabel="Text input field"
              accessibilityHint="Enter your 4 digit PIN"
              style={[styles.input, { backgroundColor: colors.background, color: colors.text.primary, borderColor: colors.borderSubtle }]}
              value={pin}
              onChangeText={(t) => setPin(t.replace(/[^0-9]/g, ''))}
              placeholder="Enter 4-digit PIN"
              placeholderTextColor={colors.text.tertiary}
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry
            />
            <View style={{ marginTop: spacing[4] }}>
              <Button label="Set PIN" onPress={handleSetPin} disabled={pin.length !== 4} />
            </View>
          </View>
        )}
      </View>

      {hasPin && canUseBiometrics && (
        <View style={styles.section}>
          <Text variant="caption" weight="bold" style={[styles.label, { color: colors.text.secondary }]}>
            BIOMETRICS
          </Text>
          <View style={[styles.card, styles.row, { backgroundColor: colors.surface, borderColor: colors.borderSubtle }]}>
            <Text style={{ color: colors.text.primary }}>Use Face ID / Touch ID</Text>
            <Switch
              value={biometricsEnabled}
              onValueChange={toggleBiometrics}
              trackColor={{ false: colors.overlaySubtle, true: colors.brand.primary }}
              thumbColor={colors.text.inverse}
            />
          </View>
        </View>
      )}

      <ConfirmModal
        visible={confirmVisible}
        title="Remove PIN"
        message="Are you sure you want to disable app lock?"
        isDestructive={true}
        confirmLabel="Remove"
        onCancel={() => setConfirmVisible(false)}
        onConfirm={confirmRemovePin}
      />

      <AlertModal
        visible={alertState.visible}
        type={alertState.type}
        title={alertState.title}
        message={alertState.message}
        onDismiss={() => setAlertState(prev => ({ ...prev, visible: false }))}
      />

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing[4],
    paddingBottom: spacing[8],
  },
  section: {
    marginBottom: spacing[6],
  },
  label: {
    marginBottom: spacing[2],
    marginLeft: spacing[1],
  },
  card: {
    borderWidth: 1,
    borderRadius: borderRadius.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing[4],
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing[4],
    fontSize: fontSize.bodyLg,
    letterSpacing: letterSpacing.pin,
    textAlign: 'center',
  },
});

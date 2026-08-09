import { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Switch } from 'react-native';
import { useTheme } from '../../src/presentation/hooks/useTheme';
import { spacing, borderRadius, fontFamily } from '@/design-system';
import { Text } from '../../src/presentation/components/ui/Text';
import { NotificationService } from '../../src/application/services/NotificationService';
import { useCycleStore } from '../../src/presentation/stores/useCycleStore';
import { AlertModal } from '../../src/presentation/components/ui/AlertModal';

export default function NotificationsSettingsScreen() {
  const { colors } = useTheme();
  const [enabled, setEnabled] = useState(false);
  const cycles = useCycleStore((state) => state.cycles);

  const [alertState, setAlertState] = useState<{ visible: boolean; type: 'error' | 'success' | 'info'; title: string; message: string; }>({
    visible: false,
    type: 'info',
    title: '',
    message: ''
  });

  useEffect(() => {
    // Currently, there's no native "are scheduled?" check in expo-notifications that is fully synchronous 
    // without tracking it in our own store, so we'll just prompt for permission when they toggle it.
    // In a real app, we'd store the "Notifications Enabled" pref in SecureStore or useProfileStore.
  }, []);

  const toggleNotifications = async (val: boolean) => {
    if (val) {
      const hasPermission = await NotificationService.requestPermissions();
      if (!hasPermission) {
        setAlertState({ visible: true, type: 'info', title: 'Permission Denied', message: 'Please enable notifications in your device settings.' });
        setEnabled(false);
        return;
      }
      setEnabled(true);
      await NotificationService.scheduleReminders(cycles);
      setAlertState({ visible: true, type: 'success', title: 'Success', message: 'Local reminders have been scheduled.' });
    } else {
      setEnabled(false);
      await NotificationService.cancelAllNotifications();
      setAlertState({ visible: true, type: 'info', title: 'Disabled', message: 'All local reminders have been cancelled.' });
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      
      <View style={styles.section}>
        <Text variant="caption" weight="bold" style={[styles.label, { color: colors.text.secondary }]}>
          CYCLE REMINDERS
        </Text>
        <View style={[styles.card, styles.row, { backgroundColor: colors.surface, borderColor: colors.borderSubtle }]}>
          <View style={styles.textContainer}>
            <Text style={{ color: colors.text.primary, fontFamily: fontFamily.medium, marginBottom: 2 }}>Smart Predictions</Text>
            <Text variant="caption" style={{ color: colors.text.tertiary }}>
              Receive local, offline alerts 2 days before your period and when your fertile window starts.
            </Text>
          </View>
          <Switch
            value={enabled}
            onValueChange={toggleNotifications}
            trackColor={{ false: colors.overlaySubtle, true: colors.brand.primary }}
            thumbColor={colors.text.inverse}
          />
        </View>
      </View>

      <View style={styles.infoBox}>
        <Text variant="caption" style={{ color: colors.text.secondary, textAlign: 'center' }}>
          LunaBloom uses completely offline local notifications. 
          Your cycle data is never sent to a push notification server.
        </Text>
      </View>

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
  textContainer: {
    flex: 1,
    paddingRight: spacing[4],
  },
  infoBox: {
    marginTop: spacing[4],
    paddingHorizontal: spacing[4],
  },
});

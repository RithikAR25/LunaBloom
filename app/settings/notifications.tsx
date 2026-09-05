import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Switch, Pressable } from 'react-native';
import { TimePickerModal } from '../../src/presentation/components/ui/TimePickerModal';
import { useTheme } from '../../src/presentation/hooks/useTheme';
import { useScaling, spacing, borderRadius, fontFamily } from '@/design-system';
import { Text } from '../../src/presentation/components/ui/Text';
import { NotificationService } from '../../src/application/services/NotificationService';
import { useProfileStore } from '../../src/presentation/stores/useProfileStore';
import { AlertModal } from '../../src/presentation/components/ui/AlertModal';

export default function NotificationsSettingsScreen() {
  const { colors } = useTheme();
  const { scale } = useScaling();
  
  const { profile, updateProfile } = useProfileStore();

  const [alertState, setAlertState] = useState<{ visible: boolean; type: 'error' | 'success' | 'info'; title: string; message: string; }>({
    visible: false,
    type: 'info',
    title: '',
    message: ''
  });
  
  const [showTimePicker, setShowTimePicker] = useState(false);

  const cycleEnabled = profile?.cycleRemindersEnabled ?? false;
  const intimacyEnabled = profile?.intimacyReminderEnabled ?? false;
  const intimacyTimeStr = profile?.intimacyReminderTime ?? '21:00';



  const requestPermissionAndSave = async (key: 'cycleRemindersEnabled' | 'intimacyReminderEnabled', val: boolean) => {
    if (val) {
      const hasPermission = await NotificationService.requestPermissions();
      if (!hasPermission) {
        setAlertState({ visible: true, type: 'info', title: 'Permission Denied', message: 'Please enable notifications in your device settings to use reminders.' });
        return;
      }
    }
    await updateProfile({ [key]: val });
  };

  const handleTimeChange = async (time: string) => {
    setShowTimePicker(false);
    await updateProfile({ intimacyReminderTime: time });
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      
      <View style={styles.section}>
        <Text variant="caption" weight="bold" style={[styles.label, { color: colors.text.secondary }]}>
          CYCLE REMINDERS
        </Text>
        <View style={[styles.card, styles.row, { backgroundColor: colors.surface, borderColor: colors.borderSubtle }]}>
          <View style={styles.textContainer}>
            <Text style={{ color: colors.text.primary, fontFamily: fontFamily.medium, marginBottom: scale(2) }}>Smart Predictions</Text>
            <Text variant="caption" style={{ color: colors.text.tertiary }}>
              Receive local, offline alerts 2 days before your period and when your fertile window starts.
            </Text>
          </View>
          <Switch
            value={cycleEnabled}
            onValueChange={(val) => requestPermissionAndSave('cycleRemindersEnabled', val)}
            trackColor={{ false: colors.overlaySubtle, true: colors.brand.primary }}
            thumbColor={colors.text.inverse}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text variant="caption" weight="bold" style={[styles.label, { color: colors.text.secondary }]}>
          DAILY REMINDERS
        </Text>
        
        <View style={[styles.cardGroup, { backgroundColor: colors.surface, borderColor: colors.borderSubtle }]}>
          <View style={[styles.row, intimacyEnabled && styles.borderBottom, { borderBottomColor: colors.borderSubtle }]}>
            <View style={styles.textContainer}>
              <Text style={{ color: colors.text.primary, fontFamily: fontFamily.medium, marginBottom: scale(2) }}>Log Intimacy</Text>
              <Text variant="caption" style={{ color: colors.text.tertiary }}>
                Take a moment to log today's intimacy.
              </Text>
            </View>
            <Switch
              value={intimacyEnabled}
              onValueChange={(val) => requestPermissionAndSave('intimacyReminderEnabled', val)}
              trackColor={{ false: colors.overlaySubtle, true: colors.brand.primary }}
              thumbColor={colors.text.inverse}
            />
          </View>

          {intimacyEnabled && (
            <React.Fragment>
              <Pressable 
                style={[styles.row, { paddingVertical: spacing[4] }]}
                onPress={() => setShowTimePicker(true)}
              >
                <View style={styles.textContainer}>
                  <Text style={{ color: colors.text.primary, fontFamily: fontFamily.medium }}>Reminder time</Text>
                </View>
                <Text style={{ color: colors.brand.primary, fontFamily: fontFamily.medium, padding: spacing[2] }}>
                  {formatToAmPm(intimacyTimeStr)}
                </Text>
              </Pressable>
              <TimePickerModal
                visible={showTimePicker}
                value={intimacyTimeStr}
                onConfirm={handleTimeChange}
                onCancel={() => setShowTimePicker(false)}
              />
            </React.Fragment>
          )}
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
  cardGroup: {
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  borderBottom: {
    borderBottomWidth: 1,
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

function formatToAmPm(timeStr: string) {
  const parts = timeStr.split(':').map(Number);
  let hh = parts[0] ?? 21;
  const mm = (parts[1] ?? 0).toString().padStart(2, '0');
  const isPm = hh >= 12;
  
  let displayHour = hh % 12;
  if (displayHour === 0) displayHour = 12;

  return `${displayHour}:${mm} ${isPm ? 'PM' : 'AM'}`;
}

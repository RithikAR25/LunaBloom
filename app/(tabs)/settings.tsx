import { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/presentation/hooks/useTheme';
import { spacing } from '@/design-system';
import { Heading } from '../../src/presentation/components/ui/Heading';
import { SettingsSection } from '../../src/presentation/components/settings/SettingsSection';
import { SettingsRow } from '../../src/presentation/components/settings/SettingsRow';
import { SettingsToggle } from '../../src/presentation/components/settings/SettingsToggle';
import { useProfileStore } from '../../src/presentation/stores/useProfileStore';
import { Text } from '../../src/presentation/components/ui/Text';
import { BottomPickerModal } from '../../src/presentation/components/ui/BottomPickerModal';
import { WheelPicker, LIST_HEIGHT, ITEM_HEIGHT } from '../../src/presentation/components/ui/WheelPicker';

export default function SettingsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const profile = useProfileStore((state) => state.profile);
  const updateProfile = useProfileStore((state) => state.updateProfile);

  const [isThemeModalVisible, setIsThemeModalVisible] = useState(false);
  const [draftThemeIndex, setDraftThemeIndex] = useState(0);

  const themeOptions = ['System Default', 'Light', 'Dark'];
  const themeValues = ['SYSTEM', 'LIGHT', 'DARK'] as const;

  const currentThemeIndex = themeValues.indexOf(profile?.themePreference || 'SYSTEM');

  const openThemeModal = () => {
    setDraftThemeIndex(Math.max(0, currentThemeIndex));
    setIsThemeModalVisible(true);
  };

  const handleConfirmTheme = () => {
    const theme = themeValues[draftThemeIndex];
    if (theme) {
      updateProfile({ themePreference: theme });
    }
    setIsThemeModalVisible(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Heading level="h1" style={{ color: colors.text.primary }}>Settings</Heading>
        </View>

        <SettingsSection title="Account">
          <SettingsRow 
            icon="person-outline" 
            label="Profile" 
            value={profile?.preferredName || 'Setup'}
            onPress={() => router.push('/settings/profile' as any)} 
          />
          <SettingsRow 
            icon="calendar-outline" 
            label="Cycle Info" 
            onPress={() => router.push('/settings/cycle' as any)} 
          />
          <SettingsRow 
            icon="fitness-outline" 
            label="Health & Goals" 
            onPress={() => router.push('/settings/health' as any)} 
            isLast
          />
        </SettingsSection>

        <SettingsSection title="Preferences">
          <SettingsToggle 
            icon="book-outline" 
            label="Detailed Learn Mode" 
            value={profile?.learnModeEnabled ?? true}
            onValueChange={(val) => updateProfile({ learnModeEnabled: val })}
            isLast
          />
        </SettingsSection>

        <SettingsSection title="App">
          <SettingsRow 
            icon="color-palette-outline" 
            label="App Theme" 
            value={themeOptions[Math.max(0, currentThemeIndex)] ?? 'System Default'}
            onPress={openThemeModal} 
          />
          <SettingsRow 
            icon="hardware-chip-outline" 
            label="LunaBloom AI Storage" 
            onPress={() => router.push('/settings/ai' as any)} 
          />
          <SettingsRow icon="notifications-outline" label="Notifications" onPress={() => router.push('/settings/notifications' as any)} />
          <SettingsRow icon="lock-closed-outline" label="Privacy & PIN" onPress={() => router.push('/settings/privacy' as any)} />
          <SettingsRow icon="download-outline" label="Data Export & Import" onPress={() => router.push('/settings/data' as any)} isLast />
        </SettingsSection>

        <SettingsSection title="About">
          <SettingsRow icon="information-circle-outline" label="About LunaBloom" onPress={() => router.push('/settings/about' as any)} />
          <SettingsRow icon="document-text-outline" label="Terms of Service" onPress={() => Alert.alert('Terms of Service', 'Available at lunabloom.app/terms (placeholder)')} />
          <SettingsRow icon="shield-checkmark-outline" label="Privacy Policy" onPress={() => Alert.alert('Privacy Policy', 'Available at lunabloom.app/privacy (placeholder)')} isLast />
        </SettingsSection>

        <SettingsSection title="Developer (Debug Only)">
          <SettingsRow 
            icon="bug-outline" 
            label="AI Evaluation Runner" 
            onPress={() => router.push('/settings/eval' as any)} 
            isLast 
          />
        </SettingsSection>
        
        <View style={styles.footer}>
          <Text variant="caption" style={{ color: colors.text.tertiary }}>
            LunaBloom v1.1.3 
          </Text>
        </View>
      </ScrollView>

      <BottomPickerModal
        visible={isThemeModalVisible}
        onCancel={() => setIsThemeModalVisible(false)}
        onConfirm={handleConfirmTheme}
      >
        <View style={{ height: LIST_HEIGHT, width: '100%', position: 'relative' }}>
          {/* Continuous Center Highlight */}
          <View 
            style={{
              position: 'absolute',
              left: 16,
              right: 16,
              borderRadius: 8,
              opacity: 0.5,
              backgroundColor: colors.surfaceElevated,
              height: ITEM_HEIGHT,
              top: (LIST_HEIGHT - ITEM_HEIGHT) / 2,
            }} 
            pointerEvents="none"
          />
          <View style={{ flexDirection: 'row', width: '100%', height: '100%' }}>
            <WheelPicker
              items={themeOptions}
              selectedIndex={draftThemeIndex}
              onChange={setDraftThemeIndex}
            />
          </View>
        </View>
      </BottomPickerModal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing[4],
    paddingBottom: spacing[8],
  },
  header: {
    marginBottom: spacing[6],
    marginTop: spacing[2],
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing[4],
    marginBottom: spacing[8],
  },
});


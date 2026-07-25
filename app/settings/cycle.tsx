import { useState } from 'react';
import { View, StyleSheet, ScrollView, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/presentation/hooks/useTheme';
import { spacing, borderRadius, fontSize, lineHeight } from '@/design-system';
import { Text } from '../../src/presentation/components/ui/Text';
import { Button } from '../../src/presentation/components/ui/Button';
import { useProfileStore } from '../../src/presentation/stores/useProfileStore';

export default function CycleSettingsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  
  const profile = useProfileStore((state) => state.profile);
  const updateProfile = useProfileStore((state) => state.updateProfile);
  const isUpdating = useProfileStore((state) => state.isLoading);

  const [cycleLength, setCycleLength] = useState(profile?.avgCycleLength.toString() || '28');
  const [periodDuration, setPeriodDuration] = useState(profile?.avgPeriodDuration.toString() || '5');

  const handleSave = async () => {
    const cycle = parseInt(cycleLength, 10);
    const period = parseInt(periodDuration, 10);

    if (isNaN(cycle) || cycle < 15 || cycle > 60) {
      Alert.alert('Invalid Input', 'Average cycle length should be between 15 and 60 days.');
      return;
    }
    if (isNaN(period) || period < 1 || period > 14) {
      Alert.alert('Invalid Input', 'Average period duration should be between 1 and 14 days.');
      return;
    }

    try {
      await updateProfile({
        avgCycleLength: cycle,
        avgPeriodDuration: period,
      });
      router.back();
    } catch {
      Alert.alert('Error', 'Failed to save cycle info. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
        
        <View style={[styles.infoBox, { backgroundColor: colors.semantic.info + '20' }]}>
          <Text variant="caption" style={{ color: colors.semantic.info, lineHeight: fontSize.caption * lineHeight.normal }}>
            Updating these values will recalculate your future cycle predictions. Past logs will not be affected.
          </Text>
        </View>

        <View style={styles.section}>
          <Text variant="caption" weight="bold" style={[styles.label, { color: colors.text.secondary }]}>
            AVERAGE CYCLE LENGTH (DAYS)
          </Text>
          <TextInput 
            accessibilityLabel="Text input field"
            accessibilityHint="Enter your average cycle length in days"
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text.primary, borderColor: colors.borderSubtle }]}
            value={cycleLength}
            onChangeText={setCycleLength}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.section}>
          <Text variant="caption" weight="bold" style={[styles.label, { color: colors.text.secondary }]}>
            AVERAGE PERIOD DURATION (DAYS)
          </Text>
          <TextInput 
            accessibilityLabel="Text input field"
            accessibilityHint="Enter your average period duration in days"
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text.primary, borderColor: colors.borderSubtle }]}
            value={periodDuration}
            onChangeText={setPeriodDuration}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.saveButton}>
          <Button 
            label="Save Changes" 
            onPress={handleSave} 
            disabled={isUpdating}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  infoBox: {
    padding: spacing[4],
    borderRadius: borderRadius.md,
    marginBottom: spacing[6],
  },
  section: {
    marginBottom: spacing[4],
  },
  label: {
    marginBottom: spacing[2],
    marginLeft: spacing[1],
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing[4],
    fontSize: fontSize.bodyMd,
  },
  saveButton: {
    marginTop: spacing[4],
  },
});

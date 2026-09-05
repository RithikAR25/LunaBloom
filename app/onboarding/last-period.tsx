import { useState, useEffect } from 'react';
import { View, StyleSheet, Switch } from 'react-native';
import { useRouter } from 'expo-router';

import { OnboardingLayout } from '../../src/presentation/components/onboarding/OnboardingLayout';
import { useOnboardingStore } from '../../src/presentation/stores/useOnboardingStore';
import { useTheme } from '../../src/presentation/hooks/useTheme';
import { Text } from '../../src/presentation/components/ui/Text';
import { Button } from '../../src/presentation/components/ui/Button';
import { spacing } from '../../src/design-system';
import { todayISO, parseISODateLocal } from '../../src/utils/dateUtils';
import { DatePickerModal } from '../../src/presentation/components/ui';

export default function LastPeriodScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { lastPeriodDate, isPeriodActive, updateField } = useOnboardingStore();
  const [showPicker, setShowPicker] = useState(false);

  // Default to today if nothing is selected yet
  useEffect(() => {
    if (!lastPeriodDate) {
      updateField('lastPeriodDate', todayISO());
    }
  }, [lastPeriodDate, updateField]);

  const handleContinue = () => {
    router.push('/onboarding/goal');
  };

  const handleBack = () => {
    router.back();
  };

  const handleDateConfirm = (selectedDate: string) => {
    setShowPicker(false);
    updateField('lastPeriodDate', selectedDate);
  };

  const isContinueDisabled = !lastPeriodDate;

  return (
    <OnboardingLayout
      currentStep={4}
      totalSteps={5}
      title="Last Period"
      subtitle="When did your last period start?"
      onContinue={handleContinue}
      onBack={handleBack}
      isContinueDisabled={isContinueDisabled}
    >
      <View style={styles.content}>
        <View style={styles.dateContainer}>
          <View>
            <Button
              variant="primary"
              label={lastPeriodDate ? parseISODateLocal(lastPeriodDate).toLocaleDateString() : 'Select Date'}
              onPress={() => setShowPicker(true)}
            />
            <DatePickerModal
              visible={showPicker}
              value={lastPeriodDate}
              maxDate={todayISO()}
              onConfirm={handleDateConfirm}
              onCancel={() => setShowPicker(false)}
            />
          </View>
        </View>

        <View style={[styles.toggleContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text variant="body" style={{ color: colors.text.primary, flex: 1 }}>
            My period is currently active
          </Text>
          <Switch
            value={isPeriodActive}
            onValueChange={(val) => updateField('isPeriodActive', val)}
            trackColor={{ false: colors.border, true: colors.brand.primary }}
          />
        </View>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  dateContainer: {
    marginBottom: spacing[8],
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    borderWidth: 1,
    borderRadius: 12,
  },
});

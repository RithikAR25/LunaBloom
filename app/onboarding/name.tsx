import { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { OnboardingLayout } from '../../src/presentation/components/onboarding/OnboardingLayout';
import { useOnboardingStore } from '../../src/presentation/stores/useOnboardingStore';
import { TextInput } from '../../src/presentation/components/ui/TextInput';
import { Text } from '../../src/presentation/components/ui/Text';
import { Button } from '../../src/presentation/components/ui/Button';
import { spacing } from '../../src/design-system';

export default function NameScreen() {
  const router = useRouter();
  const { preferredName, dateOfBirth, updateField } = useOnboardingStore();
  const [showPicker, setShowPicker] = useState(false);

  const handleContinue = () => {
    router.push('/onboarding/cycle');
  };

  const handleBack = () => {
    router.back();
  };

  const onDateChange = (_event: any, selectedDate?: Date) => {
    setShowPicker(Platform.OS === 'ios');
    if (selectedDate) {
      updateField('dateOfBirth', selectedDate.toISOString().split('T')[0] || null);
    }
  };

  return (
    <OnboardingLayout
      currentStep={2}
      totalSteps={5}
      title="About You"
      subtitle="What should we call you? When were you born?"
      onContinue={handleContinue}
      onBack={handleBack}
      onSkip={handleContinue}
      skipLabel="Skip this step"
    >
      <View style={styles.content}>
        <TextInput
          label="Preferred Name (Optional)"
          value={preferredName || ''}
          onChangeText={(text) => updateField('preferredName', text)}
          placeholder="e.g. Luna"
        />

        <View style={styles.dateContainer}>
          <Text variant="body" style={styles.label}>Date of Birth (Optional)</Text>
          {Platform.OS === 'ios' ? (
            <DateTimePicker
              value={dateOfBirth ? new Date(dateOfBirth) : new Date()}
              mode="date"
              display="default"
              onChange={onDateChange}
              maximumDate={new Date()}
            />
          ) : (
            <View>
              <Button
                variant="primary"
                label={dateOfBirth ? new Date(dateOfBirth).toLocaleDateString() : 'Select Date'}
                onPress={() => setShowPicker(true)}
              />
              {showPicker && (
                <DateTimePicker
                  value={dateOfBirth ? new Date(dateOfBirth) : new Date()}
                  mode="date"
                  display="default"
                  onChange={onDateChange}
                  maximumDate={new Date()}
                />
              )}
            </View>
          )}
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
    marginTop: spacing[4],
  },
  label: {
    marginBottom: spacing[2],
  },
});

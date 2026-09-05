import { useState, useMemo } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { OnboardingLayout } from '../../src/presentation/components/onboarding/OnboardingLayout';
import { useOnboardingStore } from '../../src/presentation/stores/useOnboardingStore';
import { TextInput } from '../../src/presentation/components/ui/TextInput';
import { Text } from '../../src/presentation/components/ui/Text';
import { Button } from '../../src/presentation/components/ui/Button';
import { spacing } from '../../src/design-system';
import { ValidationService } from '../../src/domain/services/ValidationService';
import { useTheme } from '../../src/presentation/hooks/useTheme';
import { formatDateToISO, parseISODateLocal } from '../../src/utils/dateUtils';

export default function NameScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { preferredName, dateOfBirth, updateField } = useOnboardingStore();
  const [showPicker, setShowPicker] = useState(false);
  const validationService = useMemo(() => new ValidationService(), []);

  const [nameError, setNameError] = useState('');
  const [dobError, setDobError] = useState('');

  const handleContinue = () => {
    setNameError('');
    setDobError('');
    let hasError = false;

    if (preferredName) {
      const res = validationService.validateName(preferredName);
      if (!res.isValid) {
        setNameError(res.error!);
        hasError = true;
      }
    }

    if (dateOfBirth) {
      const res = validationService.validateDateOfBirth(dateOfBirth);
      if (!res.isValid) {
        setDobError(res.error!);
        hasError = true;
      }
    }

    if (hasError) return;
    router.push('/onboarding/cycle');
  };

  const handleBack = () => {
    router.back();
  };

  const onDateChange = (_event: any, selectedDate?: Date) => {
    setShowPicker(Platform.OS === 'ios');
    if (selectedDate) {
      updateField('dateOfBirth', formatDateToISO(selectedDate));
      setDobError('');
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
      onSkip={() => router.push('/onboarding/cycle')}
      skipLabel="Skip this step"
    >
      <View style={styles.content}>
        <View style={styles.inputGroup}>
          <TextInput 
            accessibilityLabel="Text input field"
            accessibilityHint="Enter your preferred name"
            label="Preferred Name (Optional)"
            value={preferredName || ''}
            onChangeText={(text) => { updateField('preferredName', text); setNameError(''); }}
            placeholder="e.g. Luna"
          />
          {!!nameError && <Text variant="caption" style={{ color: colors.semantic.error, marginTop: spacing[1], marginLeft: spacing[1] }}>{nameError}</Text>}
        </View>

        <View style={styles.dateContainer}>
          <Text variant="body" weight="medium" style={styles.label}>Date of Birth (Optional)</Text>
          {Platform.OS === 'ios' ? (
            <DateTimePicker
              value={dateOfBirth ? parseISODateLocal(dateOfBirth) : new Date()}
              mode="date"
              display="default"
              onChange={onDateChange}
              maximumDate={new Date()}
            />
          ) : (
            <View>
              <Button
                variant="secondary"
                label={dateOfBirth ? parseISODateLocal(dateOfBirth).toLocaleDateString() : 'Select Date'}
                onPress={() => setShowPicker(true)}
              />
              {showPicker && (
                <DateTimePicker
                  value={dateOfBirth ? parseISODateLocal(dateOfBirth) : new Date()}
                  mode="date"
                  display="default"
                  onChange={onDateChange}
                  maximumDate={new Date()}
                />
              )}
            </View>
          )}
          {!!dobError && <Text variant="caption" style={{ color: colors.semantic.error, marginTop: spacing[1], marginLeft: spacing[1] }}>{dobError}</Text>}
        </View>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: spacing[4],
  },
  dateContainer: {
    marginTop: spacing[2],
  },
  label: {
    marginBottom: spacing[2],
  },
});

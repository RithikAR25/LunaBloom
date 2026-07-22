
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingLayout } from '../../src/presentation/components/onboarding/OnboardingLayout';
import { useOnboardingStore } from '../../src/presentation/stores/useOnboardingStore';
import { NumberStepper } from '../../src/presentation/components/ui/NumberStepper';
import { spacing } from '../../src/design-system';

export default function CycleScreen() {
  const router = useRouter();
  const { avgCycleLength, avgPeriodDuration, updateField } = useOnboardingStore();

  const handleContinue = () => {
    router.push('/onboarding/last-period');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <OnboardingLayout
      currentStep={3}
      totalSteps={5}
      title="Your Cycle"
      subtitle="This helps us make accurate predictions."
      onContinue={handleContinue}
      onBack={handleBack}
      onSkip={handleContinue}
      skipLabel="I don't know (Skip)"
    >
      <View style={styles.content}>
        <View style={styles.section}>
          <NumberStepper
            label="Average Cycle Length"
            value={avgCycleLength}
            onChange={(val) => updateField('avgCycleLength', val)}
            min={15}
            max={60}
            suffix=" days"
          />
        </View>

        <View style={styles.section}>
          <NumberStepper
            label="Average Period Duration"
            value={avgPeriodDuration}
            onChange={(val) => updateField('avgPeriodDuration', val)}
            min={1}
            max={14}
            suffix=" days"
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
  section: {
    marginBottom: spacing[6],
  },
});

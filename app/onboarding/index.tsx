
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingLayout } from '../../src/presentation/components/onboarding/OnboardingLayout';
import { useProfileStore } from '../../src/presentation/stores/useProfileStore';
import { useOnboardingStore } from '../../src/presentation/stores/useOnboardingStore';
import { Text } from '../../src/presentation/components/ui/Text';
import { spacing } from '../../src/design-system';

export default function WelcomeScreen() {
  const router = useRouter();
  const { completeOnboardingFlow } = useProfileStore();
  const resetOnboarding = useOnboardingStore(s => s.reset);

  const handleContinue = () => {
    router.push('/onboarding/name');
  };

  const handleSkip = async () => {
    resetOnboarding();
    await completeOnboardingFlow({});
    router.replace('/(tabs)');
  };

  return (
    <OnboardingLayout
      currentStep={1}
      totalSteps={5}
      title="Welcome to LunaBloom"
      subtitle="Let's personalize your experience. We'll ask a few questions to tailor the app to your needs."
      onContinue={handleContinue}
      continueLabel="Get Started"
      onSkip={handleSkip}
      skipLabel="Skip Setup"
    >
      <View style={styles.content}>
        <View style={styles.imagePlaceholder} />
        <Text variant="body" style={styles.description}>
          LunaBloom is designed to respect your privacy. Your data stays on your device unless you choose to sync it.
        </Text>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#E2E8F0', // slate200
    marginBottom: spacing[8],
  },
  description: {
    textAlign: 'center',
    paddingHorizontal: spacing[4],
  },
});

import { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProfileStore } from '../../src/presentation/stores/useProfileStore';
import { useOnboardingStore } from '../../src/presentation/stores/useOnboardingStore';
import { Text } from '../../src/presentation/components/ui/Text';
import { Heading } from '../../src/presentation/components/ui/Heading';
import { Button } from '../../src/presentation/components/ui/Button';
import { useTheme } from '../../src/presentation/hooks/useTheme';
import { useScaling, spacing, SCREEN_HORIZONTAL_PADDING } from '../../src/design-system';

export default function CompleteScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { scale } = useScaling();
  const { completeOnboardingFlow } = useProfileStore();
  const onboardingState = useOnboardingStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      const params: any = {
        preferredName: onboardingState.preferredName,
        dateOfBirth: onboardingState.dateOfBirth,
        avgCycleLength: onboardingState.avgCycleLength,
        avgPeriodDuration: onboardingState.avgPeriodDuration,
        conditions: onboardingState.conditions,
        lastPeriodDate: onboardingState.lastPeriodDate,
        isPeriodActive: onboardingState.isPeriodActive,
      };
      if (onboardingState.primaryGoal) {
        params.primaryGoal = onboardingState.primaryGoal;
      }
      await completeOnboardingFlow(params);
      // Clear the temporary store once complete
      onboardingState.reset();
      
      // Navigate to tabs
      router.replace('/(tabs)');
    } catch (e) {
      console.error('Failed to complete onboarding:', e);
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Heading level="h1" style={{ color: colors.text.primary, marginBottom: spacing[2], textAlign: 'center' }}>
            You&apos;re all set!
          </Heading>
          <Text variant="body" style={{ color: colors.text.secondary, textAlign: 'center' }}>
            Just one last thing before we begin.
          </Text>
        </View>

        <View style={[styles.disclaimerBox, { backgroundColor: colors.surface, borderColor: colors.borderSubtle, borderRadius: scale(16) }]}>
          <Heading level="h3" style={{ color: colors.text.primary, marginBottom: spacing[3] }}>
            Medical Disclaimer
          </Heading>
          <Text variant="body" style={{ color: colors.text.secondary, marginBottom: spacing[2] }}>
            LunaBloom is a cycle tracking and informational tool. It is not intended to replace professional medical advice, diagnosis, or treatment.
          </Text>
          <Text variant="body" style={{ color: colors.text.secondary }}>
            Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button 
          variant="primary" 
          label="I Understand — Let's Go!" 
          onPress={handleFinish} 
          disabled={isSubmitting}
        />
        <Button 
          variant="ghost" 
          label="Back" 
          onPress={() => router.back()} 
          disabled={isSubmitting}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing[10],
  },
  disclaimerBox: {
    padding: spacing[6],
    // borderRadius: 16,
    borderWidth: 1,
  },
  footer: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingVertical: spacing[4],
  },
});

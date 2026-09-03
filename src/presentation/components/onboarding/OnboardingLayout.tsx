
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/presentation/hooks/useTheme';
import { spacing, SCREEN_HORIZONTAL_PADDING } from '@/design-system';
import { OnboardingProgress } from './OnboardingProgress';
import { Text } from '../ui/Text';
import { Heading } from '../ui/Heading';
import { Button } from '../ui/Button';

interface OnboardingLayoutProps {
  currentStep: number;
  totalSteps: number;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onContinue: () => void;
  continueLabel?: string;
  isContinueDisabled?: boolean;
  onSkip?: () => void;
  skipLabel?: string;
  onBack?: () => void;
}

export function OnboardingLayout({
  currentStep,
  totalSteps,
  title,
  subtitle,
  children,
  onContinue,
  continueLabel = 'Continue',
  isContinueDisabled = false,
  onSkip,
  skipLabel = 'Skip',
  onBack,
}: OnboardingLayoutProps) {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <View style={styles.header}>
        {onBack ? (
          <View style={styles.backButton as any}>
            <Button variant="ghost" label="Back" onPress={onBack} />
          </View>
        ) : (
          <View style={styles.backButtonPlaceholder} />
        )}
        <OnboardingProgress currentStep={currentStep} totalSteps={totalSteps} />
        <View style={styles.backButtonPlaceholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} bounces={false}>
        <View style={styles.titleContainer}>
          <Heading level="h1" style={{ color: colors.text.primary, marginBottom: spacing[2] }}>
            {title}
          </Heading>
          {subtitle && (
            <Text variant="body" style={{ color: colors.text.secondary }}>
              {subtitle}
            </Text>
          )}
        </View>

        <View style={styles.content}>
          {children}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button 
          variant="primary" 
          label={continueLabel} 
          onPress={onContinue} 
          disabled={isContinueDisabled} 
        />
        {onSkip && (
          <View style={styles.skipButton as any}>
            <Button 
              variant="ghost" 
              label={skipLabel} 
              onPress={onSkip} 
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    height: 56,
  },
  backButton: {
    paddingHorizontal: 0,
    minWidth: 60,
    alignItems: 'flex-start',
  },
  backButtonPlaceholder: {
    width: 60,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingBottom: spacing[6],
  },
  titleContainer: {
    marginTop: spacing[4],
    marginBottom: spacing[8],
  },
  content: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingVertical: spacing[4],
  },
  skipButton: {
    marginTop: spacing[2],
  },
});

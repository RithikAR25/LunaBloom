import { View, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingLayout } from '../../src/presentation/components/onboarding/OnboardingLayout';
import { useOnboardingStore } from '../../src/presentation/stores/useOnboardingStore';
import { useContentStore } from '../../src/presentation/stores/useContentStore';
import { GoalCard } from '../../src/presentation/components/onboarding/GoalCard';
import { UserGoal } from '../../src/domain/models/index';
import { Text } from '../../src/presentation/components/ui/Text';
import { Heading } from '../../src/presentation/components/ui/Heading';
import { useTheme } from '../../src/presentation/hooks/useTheme';
import { useScaling, spacing, borderRadius } from '../../src/design-system';

const GOAL_OPTIONS = [
  { value: UserGoal.TrackCycle, title: 'Track My Cycle', description: 'Monitor my period, symptoms, and phases.' },
  { value: UserGoal.Conceive, title: 'Try to Conceive', description: 'Find my fertile window and ovulation day.' },
  { value: UserGoal.AvoidPregnancy, title: 'Avoid Pregnancy', description: 'Track safe days based on fertility.' },
  { value: UserGoal.GeneralHealth, title: 'Understand My Health', description: 'Learn about my body and cycle patterns.' },
];

export default function GoalScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { scale } = useScaling();
  const { primaryGoal, conditions, updateField } = useOnboardingStore();
  const { medicalConditions: medicalConditionsData } = useContentStore();

  const handleContinue = () => {
    router.push('/onboarding/complete');
  };

  const handleBack = () => {
    router.back();
  };

  const toggleCondition = (conditionId: string) => {
    if (conditions.includes(conditionId)) {
      updateField('conditions', conditions.filter(c => c !== conditionId));
    } else {
      updateField('conditions', [...conditions, conditionId]);
    }
  };

  return (
    <OnboardingLayout
      currentStep={5}
      totalSteps={5}
      title="Your Goals & Health"
      subtitle="What brings you to LunaBloom?"
      onContinue={handleContinue}
      onBack={handleBack}
      isContinueDisabled={!primaryGoal}
    >
      <View style={styles.section}>
        <Heading level="h3" style={[styles.sectionTitle, { color: colors.text.primary }]}>
          Primary Goal (Required)
        </Heading>
        {GOAL_OPTIONS.map((goal) => (
          <GoalCard
            key={goal.value}
            title={goal.title}
            description={goal.description}
            isSelected={primaryGoal === goal.value}
            onSelect={() => updateField('primaryGoal', goal.value)}
          />
        ))}
      </View>

      <View style={styles.section}>
        <Heading level="h3" style={[styles.sectionTitle, { color: colors.text.primary }]}>
          Medical Conditions (Optional)
        </Heading>
        <Text variant="body" style={[styles.sectionSubtitle, { color: colors.text.secondary }]}>
          Select any that apply so we can better tailor your insights.
        </Text>
        
        {medicalConditionsData.map((condition: any) => {
          const isSelected = conditions.includes(condition.id);
          return (
            <Pressable accessibilityRole="button"
              key={condition.id}
              onPress={() => toggleCondition(condition.id)}
              style={[
                styles.conditionCard,
                { backgroundColor: colors.surface, borderColor: isSelected ? colors.brand.primary : colors.border }
              ]}
            >
              <View style={styles.checkboxContainer}>
                <View style={[
                  styles.checkbox,
                  { borderColor: isSelected ? colors.brand.primary : colors.borderSubtle, width: scale(24), height: scale(24), borderRadius: scale(4) },
                  isSelected && { backgroundColor: colors.brand.primary }
                ]}>
                  {isSelected && <Text style={{ color: 'white', fontSize: scale(12) }}>✓</Text>}
                </View>
              </View>
              <View style={styles.conditionTextContainer}>
                <Text variant="body" style={{ color: colors.text.primary }}>
                  {condition.label}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing[8],
  },
  sectionTitle: {
    marginBottom: spacing[2],
  },
  sectionSubtitle: {
    marginBottom: spacing[4],
  },
  conditionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    borderWidth: 1,
    borderRadius: borderRadius.md,
    marginBottom: spacing[2],
  },
  checkboxContainer: {
    marginRight: spacing[3],
  },
  checkbox: {
    // width: 24,
    // height: 24,
    borderWidth: 2,
    // borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  conditionTextContainer: {
    flex: 1,
  },
});

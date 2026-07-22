
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/presentation/hooks/useTheme';
import { spacing } from '@/design-system';

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
}

export function OnboardingProgress({ currentStep, totalSteps }: OnboardingProgressProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {Array.from({ length: totalSteps }).map((_, index) => {
        const isActive = index + 1 === currentStep;
        const isPast = index + 1 < currentStep;
        
        return (
          <View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor: isActive || isPast ? colors.brand.primary : colors.border,
                opacity: isPast ? 0.5 : 1,
                width: isActive ? 24 : 8,
              }
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    marginVertical: spacing[4],
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
});


import { View, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '@/presentation/hooks/useTheme';
import { spacing, borderRadius } from '@/design-system';
import { Text } from './Text';
import { Heading } from './Heading';

export interface NumberStepperProps {
  value: number;
  onChange: (newValue: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  suffix?: string;
  decrementAccessibilityLabel?: string;
  incrementAccessibilityLabel?: string;
  decrementAccessibilityHint?: string;
  incrementAccessibilityHint?: string;
}

export function NumberStepper({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  suffix = '',
  decrementAccessibilityLabel = 'Decrease value',
  incrementAccessibilityLabel = 'Increase value',
  decrementAccessibilityHint = 'Lowers the current value by one step',
  incrementAccessibilityHint = 'Raises the current value by one step',
}: NumberStepperProps) {
  const { colors } = useTheme();

  const handleDecrease = () => {
    if (value - step >= min) {
      onChange(value - step);
    }
  };

  const handleIncrease = () => {
    if (value + step <= max) {
      onChange(value + step);
    }
  };

  const isDecreaseDisabled = value - step < min;
  const isIncreaseDisabled = value + step > max;

  return (
    <View style={styles.container}>
      {label && <Text variant="body" style={[styles.label, { color: colors.text.secondary }]}>{label}</Text>}
      
      <View style={[styles.stepperContainer, { borderColor: colors.border, backgroundColor: colors.surface }]}>
        <Pressable 
          accessibilityRole="button"
          accessibilityLabel={decrementAccessibilityLabel}
          accessibilityHint={decrementAccessibilityHint}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: pressed ? colors.borderSubtle : 'transparent' },
            isDecreaseDisabled && { opacity: 0.5 }
          ]}
          onPress={handleDecrease}
          disabled={isDecreaseDisabled}
        >
          <Heading level="h3" style={{ color: colors.text.primary }}>-</Heading>
        </Pressable>
        
        <View style={styles.valueContainer}>
          <Heading level="h2" style={{ color: colors.text.primary }}>
            {value}
            <Text variant="body" style={{ color: colors.text.secondary }}>{suffix}</Text>
          </Heading>
        </View>
        
        <Pressable 
          accessibilityRole="button"
          accessibilityLabel={incrementAccessibilityLabel}
          accessibilityHint={incrementAccessibilityHint}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: pressed ? colors.borderSubtle : 'transparent' },
            isIncreaseDisabled && { opacity: 0.5 }
          ]}
          onPress={handleIncrease}
          disabled={isIncreaseDisabled}
        >
          <Heading level="h3" style={{ color: colors.text.primary }}>+</Heading>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    marginBottom: spacing[2],
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    height: 56,
  },
  button: {
    width: 56,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
});

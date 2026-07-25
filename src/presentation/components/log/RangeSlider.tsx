import { View, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '@/presentation/hooks/useTheme';
import { spacing, borderRadius } from '@/design-system';
import { Text } from '../ui/Text';
import * as Haptics from 'expo-haptics';

interface RangeSliderProps {
  value: number | null;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  color?: string;
}

export function RangeSlider({ value, onValueChange, min = 1, max = 10, color }: RangeSliderProps) {
  const { colors } = useTheme();
  const activeColor = color || colors.brand.primary;

  const handlePress = (val: number) => {
    Haptics.selectionAsync();
    onValueChange(val);
  };

  const values = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {values.map((val) => {
          const isSelected = value === val;
          return (
            <Pressable
              key={val}
              onPress={() => handlePress(val)}
              style={[
                styles.item,
                { backgroundColor: isSelected ? activeColor : colors.surface },
                !isSelected && { borderWidth: 1, borderColor: colors.borderSubtle }
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`Level ${val}`}
              accessibilityHint={`Sets the severity level to ${val}`}
            >
              <Text variant="label" style={{ color: isSelected ? colors.text.inverse : colors.text.secondary }}>
                {val}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.labels}>
        <Text variant="caption" style={{ color: colors.text.tertiary }}>None</Text>
        <Text variant="caption" style={{ color: colors.text.tertiary }}>Severe</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing[2],
  },
  item: {
    width: 28,
    height: 36,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

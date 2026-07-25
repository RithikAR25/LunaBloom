import { View, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '@/presentation/hooks/useTheme';
import { spacing } from '@/design-system';
import * as Haptics from 'expo-haptics';

interface DotRatingProps {
  value: number | null;
  onValueChange: (value: number) => void;
  max?: number;
  color?: string;
  size?: number;
}

export function DotRating({ value, onValueChange, max = 5, color, size = 32 }: DotRatingProps) {
  const { colors } = useTheme();
  const activeColor = color || colors.brand.primary;

  const handlePress = (val: number) => {
    Haptics.selectionAsync();
    onValueChange(val);
  };

  const dots = Array.from({ length: max }, (_, i) => i + 1);

  return (
    <View style={styles.container}>
      {dots.map((val) => {
        const isSelected = value !== null && val <= value;
        return (
          <Pressable
            key={val}
            onPress={() => handlePress(val)}
            style={[
              styles.dotContainer,
              { width: size, height: size }
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Rate ${val} out of ${max}`}
            accessibilityHint={`Sets the rating to ${val}`}
          >
            <View 
              style={[
                styles.dot, 
                { 
                  width: size * 0.6, 
                  height: size * 0.6,
                  borderRadius: size * 0.3,
                  backgroundColor: isSelected ? activeColor : colors.surface,
                  borderWidth: isSelected ? 0 : 2,
                  borderColor: isSelected ? 'transparent' : colors.borderSubtle
                }
              ]} 
            />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: spacing[4],
  },
  dotContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    // Styling applied dynamically
  },
});

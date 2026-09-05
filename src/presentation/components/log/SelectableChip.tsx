import { StyleSheet, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/presentation/hooks/useTheme';
import { useScaling, spacing, borderRadius } from '@/design-system';
import { Text } from '../ui/Text';

interface SelectableChipProps {
  label: string;
  icon?: keyof typeof Feather.glyphMap;
  selected: boolean;
  onPress: () => void;
  variant: 'mood' | 'symptom';
}

export function SelectableChip({ label, icon, selected, onPress, variant }: SelectableChipProps) {
  const { colors } = useTheme();
  const { scale } = useScaling();
  
  const activeColor = variant === 'mood' ? colors.brand.primary : colors.brand.secondary;
  const backgroundColor = selected ? activeColor : 'transparent';
  const textColor = selected ? colors.text.inverse : colors.text.primary;
  const iconColor = selected ? colors.text.inverse : activeColor;
  
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.container,
        { backgroundColor, borderWidth: selected ? 0 : 2 },
        !selected && { borderColor: colors.borderSubtle }
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      {icon && <Feather name={icon} size={scale(16)} color={iconColor} style={styles.icon} />}
      <Text variant="label" style={{ color: textColor }}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.full,
    marginRight: spacing[2],
    marginBottom: spacing[2],
  },
  icon: {
    marginRight: spacing[2],
  },
});

import { StyleSheet, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/presentation/hooks/useTheme';
import { spacing, borderRadius, fontFamily } from '@/design-system';
import { Text } from '../ui/Text';

interface GridActionButtonProps {
  label: string;
  icon: keyof typeof Feather.glyphMap;
  variant?: 'primary' | 'secondary';
  onPress: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export function GridActionButton({ 
  label, 
  icon, 
  variant = 'secondary', 
  onPress, 
  accessibilityLabel,
  accessibilityHint
}: GridActionButtonProps) {
  const { colors } = useTheme();

  const isPrimary = variant === 'primary';
  const bgColor = isPrimary ? colors.brand.primary : colors.surface;
  const fgColor = isPrimary ? colors.text.inverse : colors.brand.primary;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: bgColor },
        pressed && { opacity: 0.8 },
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      accessibilityHint={accessibilityHint}
    >
      <Feather name={icon} size={24} color={fgColor} style={styles.icon} />
      <Text style={[styles.label, { color: fgColor }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    aspectRatio: 1.5,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    margin: spacing.xs,
  },
  icon: {
    marginBottom: spacing.xs,
  },
  label: {
    fontFamily: fontFamily.headingBold,
    fontSize: 12,
    textAlign: 'center',
  },
});

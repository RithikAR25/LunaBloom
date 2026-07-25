import { View, StyleSheet, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/presentation/hooks/useTheme';
import { spacing, borderRadius } from '@/design-system';
import { Text } from '../ui/Text';

interface QuickActionButtonProps {
  label: string;
  icon: keyof typeof Feather.glyphMap;
  color: string;
  onPress: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export function QuickActionButton({ label, icon, color, onPress, accessibilityLabel, accessibilityHint }: QuickActionButtonProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: colors.surface },
        pressed && { opacity: 0.8 },
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      accessibilityHint={accessibilityHint}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
        <Feather name={icon} size={24} color={color} />
      </View>
      <Text variant="label" style={{ color: colors.text.primary, textAlign: 'center', marginTop: spacing[2] }}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: '45%',
    padding: spacing[3],
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

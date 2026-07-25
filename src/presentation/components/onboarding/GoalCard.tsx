
import { StyleSheet, Pressable } from 'react-native';
import { useTheme } from '@/presentation/hooks/useTheme';
import { spacing, borderRadius } from '@/design-system';
import { Text } from '../ui/Text';
import { Heading } from '../ui/Heading';

interface GoalCardProps {
  title: string;
  description: string;
  isSelected: boolean;
  onSelect: () => void;
}

export function GoalCard({ title, description, isSelected, onSelect }: GoalCardProps) {
  const { colors } = useTheme();

  return (
    <Pressable accessibilityRole="button"
      onPress={onSelect}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: isSelected ? colors.brand.primary + '15' : colors.surface,
          borderColor: isSelected ? colors.brand.primary : colors.border,
          borderWidth: 2,
        },
        pressed && !isSelected && { backgroundColor: colors.borderSubtle }
      ]}
    >
      <Heading level="h3" style={{ color: colors.text.primary, marginBottom: spacing[1] }}>
        {title}
      </Heading>
      <Text variant="body" style={{ color: colors.text.secondary }}>
        {description}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing[4],
    borderRadius: borderRadius.md,
    marginBottom: spacing[3],
  },
});

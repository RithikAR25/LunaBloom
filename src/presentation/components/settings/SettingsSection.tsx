import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { spacing, borderRadius } from '@/design-system';
import { Text } from '../ui/Text';

interface SettingsSectionProps {
  title?: string;
  children: React.ReactNode;
}

export function SettingsSection({ title, children }: SettingsSectionProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {title && (
        <Text variant="caption" weight="bold" style={[styles.title, { color: colors.text.secondary }]}>
          {title.toUpperCase()}
        </Text>
      )}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.borderSubtle }]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing[6],
  },
  title: {
    marginBottom: spacing[2],
    marginLeft: spacing[4],
  },
  card: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
});

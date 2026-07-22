import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';

type EmptyStateScenario = 'no-cycles' | 'insufficient-cycles' | 'no-logs';

interface Props {
  scenario: EmptyStateScenario;
}

export function InsightsEmptyState({ scenario }: Props) {
  const { colors } = useTheme();

  const getContent = () => {
    switch (scenario) {
      case 'no-cycles':
        return {
          icon: 'calendar-outline' as const,
          title: 'Not enough data yet',
          message: 'Log your first period to start tracking your cycle and unlock insights.',
        };
      case 'insufficient-cycles':
        return {
          icon: 'bar-chart-outline' as const,
          title: 'Building your profile',
          message: 'We need at least 3 completed cycles to show reliable trends. Keep logging!',
        };
      case 'no-logs':
        return {
          icon: 'add-circle-outline' as const,
          title: 'No daily logs found',
          message: 'Start logging your daily symptoms and mood to see wellbeing trends over time.',
        };
    }
  };

  const { icon, title, message } = getContent();

  return (
    <View style={styles.container} accessible={true} accessibilityLabel={`Empty state: ${title}. ${message}`}>
      <View style={[styles.iconContainer, { backgroundColor: colors.surface }]}>
        <Ionicons name={icon} size={32} color={colors.brand.primary} />
      </View>
      <Text style={[styles.title, { color: colors.text.primary }]}>{title}</Text>
      <Text style={[styles.message, { color: colors.text.secondary }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

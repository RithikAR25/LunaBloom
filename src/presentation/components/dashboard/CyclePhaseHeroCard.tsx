import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { Text } from '../ui/Text';
import { Heading } from '../ui/Heading';
import { ProgressBar } from '../ui/ProgressBar';
import { useTheme } from '@/presentation/hooks/useTheme';
import { spacing, borderRadius, letterSpacing } from '@/design-system';

export interface CyclePhaseHeroCardProps {
  phaseName: string;
  phaseIcon: keyof typeof Feather.glyphMap;
  phaseColor: string;
  cycleDay: number;
  totalDays: number;
  periodCountdown: number | null;
}

export function CyclePhaseHeroCard({
  phaseName,
  phaseIcon,
  phaseColor,
  cycleDay,
  totalDays,
  periodCountdown,
}: CyclePhaseHeroCardProps) {
  const { colors } = useTheme();
  // Progress is clamped between 0 and 1
  const progress = Math.min(Math.max(cycleDay / totalDays, 0), 1) * 100;

  return (
    <LinearGradient
      colors={[colors.brand.primary, colors.brand.secondary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, { borderRadius: borderRadius.DEFAULT }]}
    >
      <View style={styles.header}>
        <View style={[styles.badge, { backgroundColor: phaseColor }]}>
          <Feather name={phaseIcon} size={14} color={colors.text.inverse} />
          <Text variant="micro" weight="bold" style={[styles.badgeText, { color: colors.text.inverse }]}>
            {phaseName.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <Heading level="display" style={{ color: colors.text.inverse }}>
          Day {cycleDay}
        </Heading>
      </View>

      <View style={styles.progressContainer}>
        <ProgressBar progress={progress} color={colors.text.inverse} height={8} />
      </View>

      <View style={[styles.statsRow, { backgroundColor: colors.overlaySubtle }]}>
        <View style={styles.stat}>
          <Text variant="caption" style={[styles.statLabel, { color: colors.onPrimarySubtle }]}>Period in</Text>
          <Text variant="body" weight="bold" style={{ color: colors.text.inverse }}>
            {periodCountdown !== null ? `${periodCountdown}d` : '--'}
          </Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.onPrimaryOverlay }]} />
        <View style={styles.stat}>
          <Text variant="caption" style={[styles.statLabel, { color: colors.onPrimarySubtle }]}>Cycle Day</Text>
          <Text variant="body" weight="bold" style={{ color: colors.text.inverse }}>
            {cycleDay}
          </Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.onPrimaryOverlay }]} />
        <View style={styles.stat}>
          <Text variant="caption" style={[styles.statLabel, { color: colors.onPrimarySubtle }]}>Cycle Length</Text>
          <Text variant="body" weight="bold" style={{ color: colors.text.inverse }}>
            {totalDays}d
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: spacing[2],
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.full,
    gap: spacing[1],
  },
  badgeText: {
    letterSpacing: letterSpacing.wide,
  },
  content: {
    alignItems: 'center',
    marginVertical: spacing[4],
  },
  progressContainer: {
    marginBottom: spacing[4],
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: borderRadius.DEFAULT,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 24,
  },
  statLabel: {
    marginBottom: spacing[1],
  },
});

import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { Text } from '../ui/Text';
import { Heading } from '../ui/Heading';
import { ProgressBar } from '../ui/ProgressBar';
import { spacing, borderRadius } from '@/design-system';

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
  // Progress is clamped between 0 and 1
  const progress = Math.min(Math.max(cycleDay / totalDays, 0), 1) * 100;

  return (
    <LinearGradient
      colors={['#7C3AED', '#1E1E35']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, { borderRadius: borderRadius.xl }]}
    >
      <View style={styles.header}>
        <View style={[styles.badge, { backgroundColor: phaseColor }]}>
          <Feather name={phaseIcon} size={14} color="#FFF" />
          <Text variant="micro" weight="bold" style={styles.badgeText}>
            {phaseName.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <Heading level="display" style={styles.dayText}>
          Day {cycleDay}
        </Heading>
      </View>

      <View style={styles.progressContainer}>
        <ProgressBar progress={progress} color="#A78BFA" height={8} />
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text variant="caption" style={styles.statLabel}>Period in</Text>
          <Text variant="body" weight="bold" style={styles.statValue}>
            {periodCountdown !== null ? `${periodCountdown}d` : '--'}
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text variant="caption" style={styles.statLabel}>Cycle Day</Text>
          <Text variant="body" weight="bold" style={styles.statValue}>
            {cycleDay}
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text variant="caption" style={styles.statLabel}>Cycle Length</Text>
          <Text variant="body" weight="bold" style={styles.statValue}>
            {totalDays}d
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing[4],
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
    color: '#FFF',
    letterSpacing: 0.5,
  },
  content: {
    alignItems: 'center',
    marginVertical: spacing[4],
  },
  dayText: {
    color: '#FFF',
  },
  progressContainer: {
    marginBottom: spacing[4],
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: spacing[3],
    borderRadius: borderRadius.lg,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.7)',
    marginBottom: spacing[1],
  },
  statValue: {
    color: '#FFF',
  },
});

import { View, StyleSheet } from 'react-native';
import { Text } from '../ui/Text';
import { useTheme } from '@/presentation/hooks/useTheme';
import { spacing, borderRadius, fontFamily, letterSpacing } from '@/design-system';

export interface MinimalCycleHeroProps {
  phaseName: string;
  cycleDay: number;
  totalDays: number;
  periodCountdown: number | null;
}

export function MinimalCycleHero({
  phaseName,
  cycleDay,
  totalDays,
  periodCountdown,
}: MinimalCycleHeroProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.phaseTitle, { color: colors.brand.primary }]}>
        {phaseName.toUpperCase()}
      </Text>
      
      <Text style={[styles.dayText, { color: colors.brand.primary }]}>
        Day {cycleDay}
      </Text>

      <View style={styles.pillsContainer}>
        <View style={[styles.pill, { backgroundColor: colors.surfaceElevated }]}>
          <Text style={[styles.pillText, { color: colors.text.primary }]}>
            Period in {periodCountdown !== null ? `${periodCountdown}d` : '--'}
          </Text>
        </View>

        <View style={[styles.pill, { backgroundColor: colors.surfaceElevated }]}>
          <Text style={[styles.pillText, { color: colors.text.primary }]}>
            Cycle Day {cycleDay}
          </Text>
        </View>
      </View>
      
      <View style={[styles.pill, { backgroundColor: colors.surfaceElevated, marginTop: spacing.sm, alignSelf: 'center' }]}>
        <Text style={[styles.pillText, { color: colors.text.primary }]}>
          Cycle Length {totalDays}d
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.lg * 0.9,
  },
  phaseTitle: {
    fontFamily: fontFamily.headingBold,
    fontSize: 12,
    letterSpacing: letterSpacing.wide,
    textAlign: 'center',
  },
  dayText: {
    fontFamily: fontFamily.headingBold,
    fontSize: 64,
    lineHeight: 72,
    textAlign: 'center',
    marginVertical: spacing.sm * 0.9,
  },
  pillsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md * 0.9,
    marginTop: spacing.md * 0.9,
  },
  pill: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
  },
  pillText: {
    fontFamily: fontFamily.headingSemiBold,
    fontSize: 12,
  },
});

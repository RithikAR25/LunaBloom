import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { fontSize, fontFamily } from '@/design-system';
import { useTheme } from '../../hooks/useTheme';
import type { CycleStatistics } from '../../../domain/models/Insights';

interface Props {
  stats: CycleStatistics;
}

export function CycleTab({ stats }: Props) {
  const { colors } = useTheme();

  if (stats.averageCycleLength === null || stats.averagePeriodDuration === null) {
    return null;
  }

  // Calculate phase durations based on the CyclePhaseService logic
  const total = stats.averageCycleLength;
  const menstrual = stats.averagePeriodDuration;
  const luteal = 14; // Default Luteal
  const ovulatory = 4;
  const follicular = Math.max(0, total - menstrual - luteal);

  // Percentages for the stacked bar
  const menstrualPct = (menstrual / total) * 100;
  const follicularPct = (follicular / total) * 100;
  const ovulatoryPct = (ovulatory / total) * 100;
  const lutealPct = (luteal / total) * 100;

  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      accessible={true}
      accessibilityLabel={`Cycle Tab. Average phase breakdown: Menstrual ${menstrual} days, Follicular ${follicular} days, Ovulatory ${ovulatory} days, Luteal ${luteal} days.`}
      accessibilityHint="Provides a breakdown of your average cycle phases"
    >
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Text style={[styles.cardTitle, { color: colors.text.primary }]}>Average Phase Breakdown</Text>
        <Text style={[styles.cardSubtitle, { color: colors.text.secondary }]}>Based on your {total}-day average cycle</Text>

        {/* Stacked Bar Chart */}
        <View style={styles.chartContainer} accessible={true} accessibilityLabel="Horizontal bar chart showing cycle phases." accessibilityHint="Visual representation of the phase lengths">
          <View style={[styles.barSegment, { width: `${menstrualPct}%`, backgroundColor: colors.phase.menstrual }]} />
          <View style={[styles.barSegment, { width: `${follicularPct}%`, backgroundColor: colors.phase.follicular }]} />
          <View style={[styles.barSegment, { width: `${ovulatoryPct}%`, backgroundColor: colors.phase.ovulatory }]} />
          <View style={[styles.barSegment, { width: `${lutealPct}%`, backgroundColor: colors.phase.luteal, borderTopRightRadius: 8, borderBottomRightRadius: 8 }]} />
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.phase.menstrual }]} />
            <Text style={[styles.legendText, { color: colors.text.primary }]}>Menstrual</Text>
            <Text style={[styles.legendDays, { color: colors.text.secondary }]}>{menstrual}d</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.phase.follicular }]} />
            <Text style={[styles.legendText, { color: colors.text.primary }]}>Follicular</Text>
            <Text style={[styles.legendDays, { color: colors.text.secondary }]}>{follicular}d</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.phase.ovulatory }]} />
            <Text style={[styles.legendText, { color: colors.text.primary }]}>Ovulatory</Text>
            <Text style={[styles.legendDays, { color: colors.text.secondary }]}>{ovulatory}d</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.phase.luteal }]} />
            <Text style={[styles.legendText, { color: colors.text.primary }]}>Luteal</Text>
            <Text style={[styles.legendDays, { color: colors.text.secondary }]}>{luteal}d</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 16 },
  card: { borderRadius: 16, padding: 16 },
  cardTitle: { fontSize: fontSize.bodyMd, fontFamily: fontFamily.semiBold, marginBottom: 4 },
  cardSubtitle: { fontSize: fontSize.caption, marginBottom: 16 },
  chartContainer: {
    height: 24,
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  barSegment: {
    height: '100%',
  },
  legend: {
    flexDirection: 'column',
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    flex: 1,
    fontSize: fontSize.labelMd,
  },
  legendDays: {
    fontSize: fontSize.labelMd,
    fontFamily: fontFamily.medium,
  },
});

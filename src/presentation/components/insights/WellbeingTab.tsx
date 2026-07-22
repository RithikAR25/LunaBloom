import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useContentStore } from '../../stores/useContentStore';
import type { PhaseWellbeingTrends, PhaseMoodTrends } from '../../../domain/models/Insights';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  wellbeing: PhaseWellbeingTrends[];
  moods: PhaseMoodTrends[];
}

export function WellbeingTab({ wellbeing, moods }: Props) {
  const { colors } = useTheme();
  const { symptomsData } = useContentStore();

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'MENSTRUAL': return '#ef4444';
      case 'FOLLICULAR': return '#3b82f6';
      case 'OVULATORY': return '#a855f7';
      case 'LUTEAL': return '#f59e0b';
      default: return '#9ca3af';
    }
  };

  const getPhaseName = (phase: string) => {
    if (phase === 'UNKNOWN') return 'Outside Cycle';
    return phase.charAt(0) + phase.slice(1).toLowerCase();
  };

  const getMoodName = (id: string) => {
    const md = symptomsData?.moods.find((m: any) => m.id === id);
    return md ? md.label : id;
  };

  const renderMetric = (label: string, icon: string, avg: number | null, samples: number, color: string) => {
    if (avg === null) return null;
    return (
      <View 
        style={styles.metricCard} 
        accessible={true} 
        accessibilityLabel={`${label}. Average is ${avg} out of 5, based on ${samples} logs.`}
      >
        <Ionicons name={icon as any} size={24} color={color} />
        <Text style={[styles.metricValue, { color: colors.text.primary }]}>{avg.toFixed(1)}</Text>
        <Text style={[styles.metricLabel, { color: colors.text.secondary }]}>{label}</Text>
        <Text style={[styles.sampleCount, { color: colors.text.secondary }]}>({samples} logs)</Text>
      </View>
    );
  };

  const isEmpty = wellbeing.every(w => w.metrics.painSampleCount === 0 && w.metrics.energySampleCount === 0 && w.metrics.sleepSampleCount === 0) 
    && moods.every(m => m.topMoods.length === 0);

  if (isEmpty) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: colors.background }]} accessible={true} accessibilityLabel="No wellbeing data logged.">
        <Text style={{ color: colors.text.secondary }}>No wellbeing data logged yet.</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      accessible={true}
      accessibilityLabel="Wellbeing Tab. Shows average pain, energy, sleep, and top moods grouped by cycle phase."
    >
      {wellbeing.map((trend) => {
        const hasMetrics = trend.metrics.painSampleCount > 0 || trend.metrics.energySampleCount > 0 || trend.metrics.sleepSampleCount > 0;
        const moodTrend = moods.find(m => m.phase === trend.phase);
        const hasMoods = moodTrend && moodTrend.topMoods.length > 0;

        if (!hasMetrics && !hasMoods) return null;

        return (
          <View key={trend.phase} style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={styles.cardHeader}>
              <View style={[styles.phaseDot, { backgroundColor: getPhaseColor(trend.phase) }]} />
              <Text style={[styles.cardTitle, { color: colors.text.primary }]}>
                {getPhaseName(trend.phase)} Phase
              </Text>
            </View>

            {hasMetrics && (
              <View style={styles.metricsRow}>
                {renderMetric('Pain', 'medical-outline', trend.metrics.averagePain, trend.metrics.painSampleCount, '#ef4444')}
                {renderMetric('Energy', 'flash-outline', trend.metrics.averageEnergy, trend.metrics.energySampleCount, '#eab308')}
                {renderMetric('Sleep', 'moon-outline', trend.metrics.averageSleep, trend.metrics.sleepSampleCount, '#3b82f6')}
              </View>
            )}

            {hasMoods && (
              <View style={styles.moodsSection}>
                <Text style={[styles.sectionTitle, { color: colors.text.secondary }]}>Top Moods</Text>
                <View style={styles.moodChips}>
                  {moodTrend.topMoods.map((m: any) => (
                    <View key={m.moodId} style={[styles.moodChip, { backgroundColor: 'rgba(150,150,150,0.1)' }]}>
                      <Text style={[styles.moodName, { color: colors.text.primary }]}>{getMoodName(m.moodId)}</Text>
                      <Text style={[styles.moodCount, { color: colors.text.secondary }]}>{m.count}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 16 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { borderRadius: 16, padding: 16 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  phaseDot: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
  cardTitle: { fontSize: 16, fontWeight: '600' },
  metricsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 },
  metricCard: { alignItems: 'center', gap: 4 },
  metricValue: { fontSize: 20, fontWeight: 'bold' },
  metricLabel: { fontSize: 12 },
  sampleCount: { fontSize: 10 },
  moodsSection: { marginTop: 8 },
  sectionTitle: { fontSize: 13, marginBottom: 8 },
  moodChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  moodChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, gap: 6 },
  moodName: { fontSize: 14, fontWeight: '500' },
  moodCount: { fontSize: 12 },
});

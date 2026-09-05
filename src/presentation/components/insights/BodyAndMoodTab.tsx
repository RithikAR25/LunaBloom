import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useScaling, fontSize, fontFamily } from '@/design-system';
import { useTheme } from '../../hooks/useTheme';
import { useContentStore } from '../../stores/useContentStore';
import type { PhaseSymptomTrends, PhaseWellbeingTrends, PhaseMoodTrends } from '../../../domain/models/Insights';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  trends: PhaseSymptomTrends[];
  wellbeing: PhaseWellbeingTrends[];
  moods: PhaseMoodTrends[];
}

export function BodyAndMoodTab({ trends, wellbeing, moods }: Props) {
  const { colors } = useTheme();
  const { scale } = useScaling();
  const { symptomsData } = useContentStore();

  const dotSize = scale(12);
  const dotRadius = Math.round(dotSize / 2);

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'MENSTRUAL': return colors.phase.menstrual;
      case 'FOLLICULAR': return colors.phase.follicular;
      case 'OVULATORY': return colors.phase.ovulatory;
      case 'LUTEAL': return colors.phase.luteal;
      default: return colors.text.disabled;
    }
  };

  const getPhaseName = (phase: string) => {
    if (phase === 'UNKNOWN') return 'Outside Cycle';
    return phase.charAt(0) + phase.slice(1).toLowerCase();
  };

  const getSymptomName = (id: string) => {
    const sym = symptomsData?.symptoms.find((s: any) => s.id === id);
    return sym ? sym.label : id;
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
        accessibilityHint="Shows your average rating for this metric during this phase"
      >
        <Ionicons name={icon as any} size={scale(24)} color={color} />
        <Text style={[styles.metricValue, { color: colors.text.primary }]}>{avg.toFixed(1)}</Text>
        <Text style={[styles.metricLabel, { color: colors.text.secondary }]}>{label}</Text>
        <Text style={[styles.sampleCount, { color: colors.text.secondary }]}>({samples} logs)</Text>
      </View>
    );
  };

  // Find the absolute maximum symptom count to scale the bars globally
  let maxSymptomCount = 0;
  trends.forEach(t => {
    t.topSymptoms.forEach(s => {
      if (s.count > maxSymptomCount) maxSymptomCount = s.count;
    });
  });

  const isEmpty = wellbeing.every(w => w.metrics.painSampleCount === 0 && w.metrics.energySampleCount === 0 && w.metrics.sleepSampleCount === 0) 
    && moods.every(m => m.topMoods.length === 0)
    && trends.every(t => t.topSymptoms.length === 0);

  if (isEmpty) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: colors.background }]} accessible={true} accessibilityLabel="No body or mood data logged." accessibilityHint="Indicates no symptoms, moods, or wellbeing data have been logged yet">
        <Text style={{ color: colors.text.secondary }}>No body or mood data logged yet.</Text>
      </View>
    );
  }

  // Iterate over phases using trends as the base list
  return (
    <ScrollView showsVerticalScrollIndicator={false} 
      contentContainerStyle={styles.container}
      accessible={true}
      accessibilityLabel="Body and Mood Tab. Shows top moods, average wellbeing metrics, and top symptoms grouped by cycle phase."
      accessibilityHint="Displays health and mood trends grouped by cycle phase"
    >
      {trends.map(symptomTrend => {
        const phase = symptomTrend.phase;
        
        const wbTrend = wellbeing.find(w => w.phase === phase);
        const hasMetrics = wbTrend && (wbTrend.metrics.painSampleCount > 0 || wbTrend.metrics.energySampleCount > 0 || wbTrend.metrics.sleepSampleCount > 0);
        
        const moodTrend = moods.find(m => m.phase === phase);
        const hasMoods = moodTrend && moodTrend.topMoods.length > 0;
        
        const hasSymptoms = symptomTrend.topSymptoms.length > 0;

        if (!hasMetrics && !hasMoods && !hasSymptoms) return null;

        return (
          <View key={phase} style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={styles.cardHeader}>
              <View style={[styles.phaseDot, { backgroundColor: getPhaseColor(phase), width: dotSize, height: dotSize, borderRadius: dotRadius }]} />
              <Text style={[styles.cardTitle, { color: colors.text.primary }]}>
                {getPhaseName(phase)} Phase
              </Text>
            </View>

            {hasMoods && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text.secondary }]}>MOOD</Text>
                <View style={styles.moodChips}>
                  {moodTrend!.topMoods.map((m: any) => (
                    <View key={m.moodId} style={[styles.moodChip, { backgroundColor: colors.surfaceNeutral }]}>
                      <Text style={[styles.moodName, { color: colors.text.primary }]}>{getMoodName(m.moodId)}</Text>
                      <Text style={[styles.moodCount, { color: colors.text.secondary }]}>{m.count}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {hasMetrics && (
              <View style={[styles.section, (hasMoods) && styles.sectionWithTopDivider, { borderTopColor: colors.border }]}>
                <Text style={[styles.sectionTitle, { color: colors.text.secondary }]}>WELLBEING</Text>
                <View style={styles.metricsRow}>
                  {renderMetric('Pain', 'medical-outline', wbTrend!.metrics.averagePain, wbTrend!.metrics.painSampleCount, colors.semantic.error)}
                  {renderMetric('Energy', 'flash-outline', wbTrend!.metrics.averageEnergy, wbTrend!.metrics.energySampleCount, colors.semantic.warning)}
                  {renderMetric('Sleep', 'moon-outline', wbTrend!.metrics.averageSleep, wbTrend!.metrics.sleepSampleCount, colors.semantic.info)}
                </View>
              </View>
            )}

            {hasSymptoms && (
              <View style={[styles.section, (hasMoods || hasMetrics) && styles.sectionWithTopDivider, { borderTopColor: colors.border }]}>
                <Text style={[styles.sectionTitle, { color: colors.text.secondary }]}>TOP SYMPTOMS</Text>
                <View style={styles.symptomsList}>
                  {symptomTrend.topSymptoms.map((symp: any) => {
                    const widthPct = maxSymptomCount > 0 ? (symp.count / maxSymptomCount) * 100 : 0;
                    
                    return (
                      <View 
                        key={symp.symptomId} 
                        style={styles.barContainer}
                        accessible={true}
                        accessibilityLabel={`${getSymptomName(symp.symptomId)}, logged ${symp.count} times.`}
                        accessibilityHint="Shows the frequency of this symptom in this phase"
                      >
                        <View style={styles.barLabelRow}>
                          <Text style={[styles.symptomName, { color: colors.text.primary }]}>
                            {getSymptomName(symp.symptomId)}
                          </Text>
                          <Text style={[styles.symptomCount, { color: colors.text.secondary }]}>
                            {symp.count} logs
                          </Text>
                        </View>
                        <View style={[styles.barBackground, { backgroundColor: colors.surfaceNeutral }]}>
                          <View style={[styles.barFill, { width: `${widthPct}%`, backgroundColor: getPhaseColor(phase) }]} />
                        </View>
                      </View>
                    );
                  })}
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
  phaseDot: { marginRight: 8 },
  cardTitle: { fontSize: fontSize.bodyMd, fontFamily: fontFamily.semiBold },
  section: { marginTop: 8 },
  sectionWithTopDivider: { paddingTop: 16, marginTop: 16, borderTopWidth: StyleSheet.hairlineWidth },
  sectionTitle: { fontSize: fontSize.caption, marginBottom: 12, fontFamily: fontFamily.semiBold, letterSpacing: 0.5 },
  metricsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  metricCard: { alignItems: 'center', gap: 4 },
  metricValue: { fontSize: fontSize.headlineSm, fontFamily: fontFamily.bold },
  metricLabel: { fontSize: fontSize.caption },
  sampleCount: { fontSize: 10 },
  moodChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  moodChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, gap: 6 },
  moodName: { fontSize: fontSize.labelMd, fontFamily: fontFamily.medium },
  moodCount: { fontSize: fontSize.caption },
  symptomsList: { gap: 12 },
  barContainer: { gap: 6 },
  barLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  symptomName: { fontSize: fontSize.labelMd, fontFamily: fontFamily.medium },
  symptomCount: { fontSize: fontSize.caption },
  barBackground: { height: 8, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
});

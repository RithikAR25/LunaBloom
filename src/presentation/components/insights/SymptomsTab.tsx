import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useContentStore } from '../../stores/useContentStore';
import type { PhaseSymptomTrends } from '../../../domain/models/Insights';

interface Props {
  trends: PhaseSymptomTrends[];
}

export function SymptomsTab({ trends }: Props) {
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

  const getSymptomName = (id: string) => {
    const sym = symptomsData?.symptoms.find((s: any) => s.id === id);
    return sym ? sym.label : id;
  };

  // Find the absolute maximum count to scale the bars
  let maxCount = 0;
  trends.forEach(t => {
    t.topSymptoms.forEach(s => {
      if (s.count > maxCount) maxCount = s.count;
    });
  });

  if (maxCount === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: colors.background }]} accessible={true} accessibilityLabel="No symptoms logged.">
        <Text style={{ color: colors.text.secondary }}>No symptoms logged yet.</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      accessible={true}
      accessibilityLabel="Symptoms Tab. Shows top symptoms grouped by cycle phase."
    >
      {trends.map(trend => {
        if (trend.topSymptoms.length === 0) return null;

        return (
          <View key={trend.phase} style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={styles.cardHeader}>
              <View style={[styles.phaseDot, { backgroundColor: getPhaseColor(trend.phase) }]} />
              <Text style={[styles.cardTitle, { color: colors.text.primary }]}>
                {getPhaseName(trend.phase)} Phase
              </Text>
            </View>

            <View style={styles.list}>
              {trend.topSymptoms.map((symp: any) => {
                const widthPct = maxCount > 0 ? (symp.count / maxCount) * 100 : 0;
                
                return (
                  <View 
                    key={symp.symptomId} 
                    style={styles.barContainer}
                    accessible={true}
                    accessibilityLabel={`${getSymptomName(symp.symptomId)}, logged ${symp.count} times.`}
                  >
                    <View style={styles.barLabelRow}>
                      <Text style={[styles.symptomName, { color: colors.text.primary }]}>
                        {getSymptomName(symp.symptomId)}
                      </Text>
                      <Text style={[styles.symptomCount, { color: colors.text.secondary }]}>
                        {symp.count} logs
                      </Text>
                    </View>
                    <View style={styles.barBackground}>
                      <View style={[styles.barFill, { width: `${widthPct}%`, backgroundColor: getPhaseColor(trend.phase) }]} />
                    </View>
                  </View>
                );
              })}
            </View>
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
  list: { gap: 12 },
  barContainer: { gap: 6 },
  barLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  symptomName: { fontSize: 14, fontWeight: '500' },
  symptomCount: { fontSize: 12 },
  barBackground: { height: 8, backgroundColor: 'rgba(150,150,150,0.1)', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
});

import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import type { CycleStatistics } from '../../../domain/models/Insights';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  stats: CycleStatistics;
}

export function OverviewTab({ stats }: Props) {
  const { colors } = useTheme();

  // If there's no data at all, return null (handled by parent's EmptyState)
  if (stats.averageCycleLength === null) {
    return null;
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'INCREASING': return 'trending-up';
      case 'DECREASING': return 'trending-down';
      case 'STABLE': return 'remove';
      default: return 'help';
    }
  };

  const getTrendText = (trend: string) => {
    switch (trend) {
      case 'INCREASING': return 'Lengthening trend';
      case 'DECREASING': return 'Shortening trend';
      case 'STABLE': return 'Stable length';
      default: return 'Not enough data for trend';
    }
  };

  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      accessible={true}
      accessibilityLabel={`Overview Tab. Average cycle length is ${stats.averageCycleLength} days. Average period is ${stats.averagePeriodDuration} days. Consistency score is ${stats.regularityScore ?? 'unknown'}. Cycle length trend is ${getTrendText(stats.cycleLengthTrend)}.`}
    >
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: colors.text.primary }]}>Averages</Text>
        </View>
        
        <View style={styles.row}>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: colors.brand.primary }]}>{stats.averageCycleLength}</Text>
            <Text style={[styles.statLabel, { color: colors.text.secondary }]}>Avg Cycle (days)</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: colors.brand.secondary }]}>{stats.averagePeriodDuration}</Text>
            <Text style={[styles.statLabel, { color: colors.text.secondary }]}>Avg Period (days)</Text>
          </View>
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: colors.text.primary }]}>Consistency</Text>
        </View>
        
        <View style={styles.row}>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: stats.regularityScore !== null ? colors.text.primary : colors.text.secondary }]}>
              {stats.regularityScore !== null ? `${stats.regularityScore}%` : '--'}
            </Text>
            <Text style={[styles.statLabel, { color: colors.text.secondary }]}>Regularity Score</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statBox}>
            <View style={styles.trendRow}>
              <Ionicons 
                name={getTrendIcon(stats.cycleLengthTrend) as any} 
                size={20} 
                color={stats.cycleLengthTrend !== 'UNKNOWN' ? colors.brand.primary : colors.text.secondary} 
              />
              <Text style={[styles.statValue, { fontSize: 18, color: stats.cycleLengthTrend !== 'UNKNOWN' ? colors.text.primary : colors.text.secondary }]}>
                {stats.cycleLengthTrend !== 'UNKNOWN' ? stats.cycleLengthTrend : 'N/A'}
              </Text>
            </View>
            <Text style={[styles.statLabel, { color: colors.text.secondary }]}>{getTrendText(stats.cycleLengthTrend)}</Text>
          </View>
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: colors.text.primary }]}>Extremes</Text>
        </View>
        
        <View style={styles.row}>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: colors.text.primary }]}>{stats.shortestCycle}</Text>
            <Text style={[styles.statLabel, { color: colors.text.secondary }]}>Shortest (days)</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: colors.text.primary }]}>{stats.longestCycle}</Text>
            <Text style={[styles.statLabel, { color: colors.text.secondary }]}>Longest (days)</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  card: {
    borderRadius: 16,
    padding: 16,
  },
  cardHeader: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(150, 150, 150, 0.2)',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});

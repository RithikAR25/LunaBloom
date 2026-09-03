import { View, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { spacing, borderRadius } from '@/design-system';
import { Text } from '../ui/Text';
import { Heading } from '../ui/Heading';
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
      accessibilityHint="Provides an overview of your cycle statistics and consistency"
    >
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <View style={styles.cardHeader}>
          <Heading level="h3" style={{ color: colors.text.primary }}>Averages</Heading>
        </View>
        
        <View style={styles.row}>
          <View style={styles.statBox}>
            <Heading level="h2" style={{ color: colors.brand.primary }}>{stats.averageCycleLength}</Heading>
            <Text variant="caption" style={{ color: colors.text.secondary }}>Avg Cycle (days)</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.surfaceNeutral }]} />
          <View style={styles.statBox}>
            <Heading level="h2" style={{ color: colors.brand.secondary }}>{stats.averagePeriodDuration}</Heading>
            <Text variant="caption" style={{ color: colors.text.secondary }}>Avg Period (days)</Text>
          </View>
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <View style={styles.cardHeader}>
          <Heading level="h3" style={{ color: colors.text.primary }}>Consistency</Heading>
        </View>
        
        <View style={styles.row}>
          <View style={styles.statBox}>
            <Heading level="h2" style={{ color: stats.regularityScore !== null ? colors.text.primary : colors.text.secondary }}>
              {stats.regularityScore !== null ? `${stats.regularityScore}%` : '--'}
            </Heading>
            <Text variant="caption" style={{ color: colors.text.secondary }}>Regularity Score</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.surfaceNeutral }]} />
          <View style={styles.statBox}>
            <View style={styles.trendRow}>
              <Ionicons 
                name={getTrendIcon(stats.cycleLengthTrend) as any} 
                size={20} 
                color={stats.cycleLengthTrend !== 'UNKNOWN' ? colors.brand.primary : colors.text.secondary} 
              />
              <Heading level="h3" style={{ color: stats.cycleLengthTrend !== 'UNKNOWN' ? colors.text.primary : colors.text.secondary }}>
                {stats.cycleLengthTrend !== 'UNKNOWN' ? stats.cycleLengthTrend : 'N/A'}
              </Heading>
            </View>
            <Text variant="caption" style={{ color: colors.text.secondary }}>{getTrendText(stats.cycleLengthTrend)}</Text>
          </View>
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <View style={styles.cardHeader}>
          <Heading level="h3" style={{ color: colors.text.primary }}>Extremes</Heading>
        </View>
        
        <View style={styles.row}>
          <View style={styles.statBox}>
            <Heading level="h2" style={{ color: colors.text.primary }}>{stats.shortestCycle}</Heading>
            <Text variant="caption" style={{ color: colors.text.secondary }}>Shortest (days)</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.surfaceNeutral }]} />
          <View style={styles.statBox}>
            <Heading level="h2" style={{ color: colors.text.primary }}>{stats.longestCycle}</Heading>
            <Text variant="caption" style={{ color: colors.text.secondary }}>Longest (days)</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.sm,
    gap: spacing.sm,
  },
  card: {
    borderRadius: borderRadius.DEFAULT,
    padding: spacing.md,
  },
  cardHeader: {
    marginBottom: spacing.md,
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
    gap: spacing.xs,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: 'transparent',
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
});

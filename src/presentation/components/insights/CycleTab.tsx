import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { fontSize, fontFamily } from '@/design-system';
import { useTheme } from '../../hooks/useTheme';
import { useCycleStore } from '@/presentation/stores/useCycleStore';
import { formatDateRangeWithYear, addDays } from '@/utils/dateUtils';
import { Ionicons } from '@expo/vector-icons';
import type { CycleStatistics } from '../../../domain/models/Insights';

interface Props {
  stats: CycleStatistics;
}

export function CycleTab({ stats }: Props) {
  const { colors } = useTheme();
  const { cycles } = useCycleStore();
  
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

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

  // Functional sort for cycle history
  const sortedCycles = [...cycles].sort((a, b) => {
    return sortOrder === 'desc' 
      ? b.startDate.localeCompare(a.startDate)
      : a.startDate.localeCompare(b.startDate);
  });

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

      {/* Cycle History */}
      {sortedCycles.length > 0 && (
        <View style={styles.historySection}>
          <View style={styles.historyHeader}>
            <Text style={[styles.historyTitle, { color: colors.brand.primary }]}>Cycle History</Text>
            
            <Pressable 
              style={[styles.sortButton, { borderColor: colors.brand.primary }]}
              onPress={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
            >
              <Text style={[styles.sortButtonText, { color: colors.brand.primary }]}>
                {sortOrder === 'desc' ? 'Latest first' : 'Oldest first'}
              </Text>
              <Ionicons name="chevron-down" size={16} color={colors.brand.primary} />
            </Pressable>
          </View>
          
          <View style={styles.historyList}>
            {sortedCycles.map((cycle) => {
              const isActive = cycle.endDate === null;
              const periodEndDate = cycle.durationDays 
                ? addDays(cycle.startDate, cycle.durationDays - 1) 
                : cycle.startDate;
              
              return (
                <Pressable 
                  key={cycle.id} 
                  style={[
                    styles.cycleCard, 
                    { backgroundColor: isActive ? colors.brand.secondary : colors.surfaceElevated }
                  ]}
                >
                  <View style={styles.cycleCardLeft}>
                    <View style={styles.cycleCardDateRow}>
                      <Text style={[
                        styles.cycleCardDate, 
                        { color: isActive ? colors.brand.primary : colors.text.primary }
                      ]}>
                        {formatDateRangeWithYear(cycle.startDate, periodEndDate)}
                      </Text>
                      {isActive && (
                        <View style={[styles.activeBadge, { backgroundColor: 'rgba(215, 61, 89, 0.15)' }]}>
                           <Text style={[styles.activeBadgeText, { color: colors.brand.primary }]}>CURRENT CYCLE</Text>
                        </View>
                      )}
                    </View>
                    
                    <View style={styles.historyMetrics}>
                      <View style={styles.historyMetric}>
                        <Text style={[styles.historyMetricLabel, { color: colors.text.secondary }]}>PERIOD</Text>
                        <Text style={[styles.historyMetricValue, { color: colors.brand.primary }]}>
                          {cycle.durationDays != null ? `${cycle.durationDays}d` : '\u2014'}
                        </Text>
                      </View>
                      <View style={styles.historyMetric}>
                        <Text style={[styles.historyMetricLabel, { color: colors.text.secondary }]}>CYCLE LENGTH</Text>
                        <Text style={[
                          styles.historyMetricValue, 
                          { color: isActive ? colors.brand.primary : colors.text.primary }
                        ]}>
                          {isActive ? 'In progress' : (cycle.cycleLengthDays != null ? `${cycle.cycleLengthDays}d` : '\u2014')}
                        </Text>
                      </View>
                    </View>
                  </View>
                  
                  <View style={styles.cycleCardRight}>
                    <Ionicons 
                      name="chevron-forward" 
                      size={20} 
                      color={isActive ? colors.brand.primary : colors.text.secondary} 
                    />
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}
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
  historySection: {
    marginTop: 8,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  historyTitle: {
    fontSize: 20, // slightly larger than bodyMd for headline impact
    fontFamily: fontFamily.bold,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
    backgroundColor: 'transparent',
  },
  sortButtonText: {
    fontSize: fontSize.labelMd,
    fontFamily: fontFamily.medium,
  },
  historyList: {
    gap: 12,
  },
  cycleCard: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  cycleCardLeft: {
    flex: 1,
  },
  cycleCardDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cycleCardDate: {
    fontSize: fontSize.bodyLg,
    fontFamily: fontFamily.semiBold,
  },
  activeBadge: {
    marginLeft: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadgeText: {
    fontSize: 10,
    fontFamily: fontFamily.bold,
    letterSpacing: 0.5,
  },
  historyMetrics: {
    flexDirection: 'row',
  },
  historyMetric: {
    flex: 1,
  },
  historyMetricLabel: {
    fontSize: 11,
    fontFamily: fontFamily.medium,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  historyMetricValue: {
    fontSize: fontSize.bodyLg,
    fontFamily: fontFamily.bold,
  },
  cycleCardRight: {
    marginLeft: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

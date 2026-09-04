import { useState, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { fontSize, fontFamily } from '@/design-system';
import { useTheme } from '../../hooks/useTheme';
import { useCycleStore } from '@/presentation/stores/useCycleStore';
import { useDailyLogStore } from '@/presentation/stores/useDailyLogStore';
import { formatDateRangeWithYear, formatDateShort, todayISO } from '@/utils/dateUtils';
import { Ionicons } from '@expo/vector-icons';
import type { CycleStatistics } from '../../../domain/models/Insights';
import { calculateCycleInsights, getFullCycleDateRange, CyclePhaseLengths } from '@/utils/cycleInsightsHelper';

interface Props {
  stats: CycleStatistics;
}

// Reusable phase bar component for Average Phase Breakdown
function CyclePhaseBar({ phaseLengths, colors }: { phaseLengths: CyclePhaseLengths, colors: any }) {
  const total = phaseLengths.menstrual + phaseLengths.follicular + phaseLengths.ovulatory + phaseLengths.luteal;
  if (total <= 0) return null;
  
  const menstrualPct = (phaseLengths.menstrual / total) * 100;
  const follicularPct = (phaseLengths.follicular / total) * 100;
  const ovulatoryPct = (phaseLengths.ovulatory / total) * 100;
  const lutealPct = (phaseLengths.luteal / total) * 100;

  const renderSegment = (pct: number, color: string, days: number, isLast: boolean = false) => {
    if (pct <= 0) return null;
    return (
      <View style={[
        styles.barSegment, 
        { 
          width: `${pct}%`, 
          backgroundColor: color, 
          justifyContent: 'center', 
          alignItems: 'center',
          overflow: 'hidden',
          borderTopRightRadius: isLast ? 8 : 0,
          borderBottomRightRadius: isLast ? 8 : 0,
        }
      ]}>
        <Text 
          adjustsFontSizeToFit 
          minimumFontScale={0.5} 
          numberOfLines={1} 
          style={{ color: 'white', fontSize: 10, fontFamily: fontFamily.bold }}
        >
          {days}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.chartContainer} accessible={true} accessibilityLabel="Horizontal bar chart showing cycle phases.">
      {renderSegment(menstrualPct, colors.phase.menstrual, phaseLengths.menstrual)}
      {renderSegment(follicularPct, colors.phase.follicular, phaseLengths.follicular)}
      {renderSegment(ovulatoryPct, colors.phase.ovulatory, phaseLengths.ovulatory)}
      {renderSegment(lutealPct, colors.phase.luteal, phaseLengths.luteal, true)}
    </View>
  );
}

export function CycleTab({ stats }: Props) {
  const { colors } = useTheme();
  const { cycles } = useCycleStore();
  const { logs, loadLogsForRange } = useDailyLogStore();
  
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  
  // Accordion state
  const [expandedCycleId, setExpandedCycleId] = useState<string | null>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const currentExpandedCycleIdRef = useRef<string | null>(null);

  if (stats.averageCycleLength === null || stats.averagePeriodDuration === null) {
    return null;
  }

  const total = stats.averageCycleLength;
  const menstrual = stats.averagePeriodDuration;
  const luteal = 14; 
  const ovulatory = 4;
  const follicular = Math.max(0, total - menstrual - luteal - ovulatory);
  
  const averagePhaseLengths: CyclePhaseLengths = {
    menstrual, follicular, ovulatory, luteal
  };

  const sortedCycles = [...cycles].sort((a, b) => {
    return sortOrder === 'desc' 
      ? b.startDate.localeCompare(a.startDate)
      : a.startDate.localeCompare(b.startDate);
  });

  const handleExpand = async (cycle: any) => {
    if (expandedCycleId === cycle.id) {
      setExpandedCycleId(null);
      currentExpandedCycleIdRef.current = null;
      return;
    }
    
    setExpandedCycleId(cycle.id);
    currentExpandedCycleIdRef.current = cycle.id;
    setFetchError(null);
    setIsLoadingInsights(true);
    
    try {
      const { start, end, isCurrent } = getFullCycleDateRange(cycle, cycles);
      const toDate = isCurrent ? todayISO() : (end ?? todayISO());
      
      await loadLogsForRange(start, toDate);
    } catch (err) {
      if (currentExpandedCycleIdRef.current === cycle.id) {
        setFetchError('Failed to load insights.');
      }
    } finally {
      if (currentExpandedCycleIdRef.current === cycle.id) {
        setIsLoadingInsights(false);
      }
    }
  };

  const expandedInsights = useMemo(() => {
    if (!expandedCycleId || isLoadingInsights || fetchError) return null;
    const cycle = cycles.find(c => c.id === expandedCycleId);
    if (!cycle) return null;
    
    const { start, end, isCurrent } = getFullCycleDateRange(cycle, cycles);
    const toDate = isCurrent ? todayISO() : (end ?? todayISO());
    
    // Filter logs safely to just the cycle's full date range
    const cycleLogs = Object.values(logs).filter(l => l.date >= start && l.date <= toDate);
    
    const insights = calculateCycleInsights(cycle, cycleLogs, stats.averageCycleLength ?? 28);
    
    return insights;
  }, [expandedCycleId, isLoadingInsights, fetchError, cycles, logs, stats.averageCycleLength]);

  const formatFlowDays = (label: string, days: number[]) => {
    if (days.length === 0) return null;
    const prefix = days.length === 1 ? 'day' : 'days';
    return `${label} (${prefix} ${days.join(', ')})`;
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} 
      contentContainerStyle={styles.container}
    >
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Text style={[styles.cardTitle, { color: colors.text.primary }]}>Average Phase Breakdown</Text>
        <Text style={[styles.cardSubtitle, { color: colors.text.secondary }]}>Based on your {total}-day average cycle</Text>

        <CyclePhaseBar phaseLengths={averagePhaseLengths} colors={colors} />

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
              const fullRange = getFullCycleDateRange(cycle, cycles);
              const isActive = fullRange.isCurrent;
              const dateRangeStr = isActive
                ? `${formatDateShort(fullRange.start)} - Present`
                : formatDateRangeWithYear(fullRange.start, fullRange.end!);

              const isExpanded = expandedCycleId === cycle.id;

              return (
                <View key={cycle.id} style={[
                  styles.cycleCardWrapper, 
                  { backgroundColor: isActive ? colors.brand.secondaryContainer : colors.surfaceElevated }
                ]}>
                  <Pressable 
                    style={styles.cycleCard}
                    onPress={() => handleExpand(cycle)}
                  >
                    <View style={styles.cycleCardLeft}>
                      <View style={styles.cycleCardDateRow}>
                        <Text style={[
                          styles.cycleCardDate, 
                          { color: isActive ? colors.brand.primary : colors.text.primary }
                        ]}>
                          {dateRangeStr}
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
                        name={isExpanded ? "chevron-down" : "chevron-forward"} 
                        size={20} 
                        color={isActive ? colors.brand.primary : colors.text.secondary} 
                      />
                    </View>
                  </Pressable>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <View style={[styles.expandedContent, { borderTopColor: colors.border }]}>
                      {isLoadingInsights ? (
                        <View style={styles.loadingContainer}>
                          <ActivityIndicator size="small" color={colors.brand.primary} />
                          <Text style={{ color: colors.text.secondary, marginTop: 8 }}>Loading logs...</Text>
                        </View>
                      ) : fetchError ? (
                        <Text style={{ color: colors.brand.primary }}>{fetchError}</Text>
                      ) : expandedInsights ? (
                        <View style={styles.insightsGrid}>
                          <View style={styles.insightSection}>
                            <Text style={[styles.insightTitle, { color: colors.text.primary }]}>Phase Timeline</Text>
                            <CyclePhaseBar phaseLengths={expandedInsights.phaseLengths} colors={colors} />
                          </View>

                          <View style={styles.insightSection}>
                            <Text style={[styles.insightTitle, { color: colors.text.primary }]}>Flow Intensity</Text>
                            <Text style={[styles.insightValue, { color: colors.text.secondary }]}>
                              {[
                                formatFlowDays('Very Heavy', expandedInsights.flowDays.very_heavy),
                                formatFlowDays('Heavy', expandedInsights.flowDays.heavy),
                                formatFlowDays('Medium', expandedInsights.flowDays.medium),
                                formatFlowDays('Light', expandedInsights.flowDays.light),
                                formatFlowDays('Spotting', expandedInsights.flowDays.spotting)
                              ].filter(Boolean).join(' ') || 'No flow logged'}
                            </Text>
                          </View>

                          <View style={styles.averagesRow}>
                            <View style={styles.averageBox}>
                              <Text style={[styles.insightTitle, { color: colors.text.primary }]}>Avg Pain</Text>
                              <Text style={[styles.insightValueLarge, { color: colors.text.secondary }]}>
                                {expandedInsights.avgPain != null ? `${expandedInsights.avgPain}/10` : 'No data'}
                              </Text>
                            </View>
                            <View style={styles.averageBox}>
                              <Text style={[styles.insightTitle, { color: colors.text.primary }]}>Avg Energy</Text>
                              <Text style={[styles.insightValueLarge, { color: colors.text.secondary }]}>
                                {expandedInsights.avgEnergy != null ? `${expandedInsights.avgEnergy}/5` : 'No data'}
                              </Text>
                            </View>
                          </View>
                        </View>
                      ) : null}
                    </View>
                  )}
                </View>
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
    fontSize: 20, 
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
  cycleCardWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  cycleCard: {
    flexDirection: 'row',
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
  expandedContent: {
    padding: 16,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  insightsGrid: {
    gap: 16,
  },
  insightSection: {
    gap: 8,
  },
  insightTitle: {
    fontSize: fontSize.labelMd,
    fontFamily: fontFamily.semiBold,
  },
  insightValue: {
    fontSize: fontSize.labelMd,
    fontFamily: fontFamily.regular,
  },
  insightValueLarge: {
    fontSize: fontSize.bodyLg,
    fontFamily: fontFamily.semiBold,
  },
  averagesRow: {
    flexDirection: 'row',
    gap: 16,
  },
  averageBox: {
    flex: 1,
  }
});

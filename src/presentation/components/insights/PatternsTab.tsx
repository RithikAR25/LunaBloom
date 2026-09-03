import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { fontSize, fontFamily } from '@/design-system';
import { useTheme } from '../../hooks/useTheme';
import type { PatternInsights } from '../../../domain/models/Insights';
import { Ionicons } from '@expo/vector-icons';
import { formatDateShort } from '@/utils/dateUtils';
import { InsightsEmptyState } from './InsightsEmptyState';
import { PatternChartHeader } from './PatternChartHeader';
import { DynamicLineChart } from './DynamicLineChart';

interface Props {
  patterns: PatternInsights;
}

const MAX_BAR_HEIGHT = 80;

export function PatternsTab({ patterns }: Props) {
  const { colors } = useTheme();

  const {
    cycleLengthHistory,
    periodDurationHistory,
    monthlyPainHistory,
    energyPeakCycleDay,
    energyPeakAverage,
    energyPeakSampleCount,
    loggingConsistencyPercent,
  } = patterns;

  const [cycleSort, setCycleSort] = useState<'desc' | 'asc'>('desc');
  const [periodSort, setPeriodSort] = useState<'desc' | 'asc'>('desc');
  const [painSort, setPainSort] = useState<'desc' | 'asc'>('desc');

  const [cycleView, setCycleView] = useState<'bar' | 'line'>('bar');
  const [periodView, setPeriodView] = useState<'bar' | 'line'>('bar');
  const [painView, setPainView] = useState<'bar' | 'line'>('bar');

  useFocusEffect(
    useCallback(() => {
      setCycleSort('desc');
      setPeriodSort('desc');
      setPainSort('desc');
    }, [])
  );

  // Global empty state guard
  if (
    cycleLengthHistory.length < 2 &&
    periodDurationHistory.length < 2 &&
    monthlyPainHistory.length < 2 &&
    energyPeakCycleDay === null &&
    loggingConsistencyPercent === null
  ) {
    return <InsightsEmptyState scenario="no-patterns" />;
  }

  // Helper to calculate bar height
  const getBarHeight = (val: number, max: number) => {
    if (max === 0) return 0;
    return (val / max) * MAX_BAR_HEIGHT;
  };

  const maxCycleLength = Math.max(0, ...cycleLengthHistory.map(d => d.cycleLengthDays));
  const maxPeriodDuration = Math.max(10, ...periodDurationHistory.map(d => d.durationDays));
  const maxPain = Math.max(0, ...monthlyPainHistory.map(d => d.averagePain));

  const displayCycleHistory = [...cycleLengthHistory].sort((a, b) =>
    cycleSort === 'desc'
      ? b.startDate.localeCompare(a.startDate)
      : a.startDate.localeCompare(b.startDate)
  );

  const displayPeriodHistory = [...periodDurationHistory].sort((a, b) =>
    periodSort === 'desc'
      ? b.startDate.localeCompare(a.startDate)
      : a.startDate.localeCompare(b.startDate)
  );

  const displayPainHistory = [...monthlyPainHistory].sort((a, b) =>
    painSort === 'desc'
      ? b.yearMonth.localeCompare(a.yearMonth)
      : a.yearMonth.localeCompare(b.yearMonth)
  );

  return (
    <ScrollView showsVerticalScrollIndicator={false} 
      contentContainerStyle={styles.container}
      accessible={true}
      accessibilityLabel="Patterns Tab. Displays your longitudinal health trends over time."
      accessibilityHint="Shows cycle length, period duration, pain, energy, and logging consistency over time."
    >
      {/* Widget 1: Cycle Length */}
      {cycleLengthHistory.length >= 2 && (
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <PatternChartHeader
            title="Cycle Length"
            subtitle={`Completed cycles, ${cycleSort === 'desc' ? 'newest to oldest' : 'oldest to newest'}`}
            viewMode={cycleView}
            sortOrder={cycleSort}
            onToggleView={() => setCycleView(v => v === 'bar' ? 'line' : 'bar')}
            onToggleSort={() => setCycleSort(s => s === 'desc' ? 'asc' : 'desc')}
          />
          
          {cycleView === 'bar' ? (
            <ScrollView showsVerticalScrollIndicator={false} 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={[
                styles.chartScroll,
                cycleLengthHistory.length < 6 && { flexGrow: 1, justifyContent: 'space-around' }
              ]}
            >
              {displayCycleHistory.map((point) => (
                <View key={point.cycleIndex} style={styles.barColumn}>
                  <Text style={[styles.barValue, { color: colors.text.primary }]}>{point.cycleLengthDays}d</Text>
                  <View style={[styles.barBackground, { backgroundColor: colors.surfaceNeutral, height: MAX_BAR_HEIGHT }]}>
                    <View 
                      style={[
                        styles.barFillVertical, 
                        { 
                          height: getBarHeight(point.cycleLengthDays, maxCycleLength), 
                          backgroundColor: colors.brand.primary 
                        }
                      ]} 
                    />
                  </View>
                  <Text style={[styles.barLabel, { color: colors.text.secondary }]}>
                    {formatDateShort(point.startDate)}
                  </Text>
                  <Text style={[styles.barLabelYear, { color: colors.text.tertiary }]}>
                    '{point.startDate.substring(2, 4)}
                  </Text>
                </View>
              ))}
            </ScrollView>
          ) : (
            <DynamicLineChart 
              data={displayCycleHistory.map(p => ({
                id: p.cycleIndex.toString(),
                value: p.cycleLengthDays,
                topLabel: `${p.cycleLengthDays}d`,
                bottomLabelPrimary: formatDateShort(p.startDate),
                bottomLabelSecondary: `'${p.startDate.substring(2, 4)}`
              }))}
              color={colors.brand.primary}
              height={MAX_BAR_HEIGHT}
              valueFormatter={(value) => `${value}d`}
            />
          )}
        </View>
      )}

      {/* Widget 2: Period Duration */}
      {periodDurationHistory.length >= 2 && (
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <PatternChartHeader
            title="Period Duration"
            subtitle={`Days of bleeding per cycle, ${periodSort === 'desc' ? 'newest to oldest' : 'oldest to newest'}`}
            viewMode={periodView}
            sortOrder={periodSort}
            onToggleView={() => setPeriodView(v => v === 'bar' ? 'line' : 'bar')}
            onToggleSort={() => setPeriodSort(s => s === 'desc' ? 'asc' : 'desc')}
          />
          
          {periodView === 'bar' ? (
            <ScrollView showsVerticalScrollIndicator={false} 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={[
                styles.chartScroll,
                periodDurationHistory.length < 6 && { flexGrow: 1, justifyContent: 'space-around' }
              ]}
            >
              {displayPeriodHistory.map((point) => (
                <View key={point.cycleIndex} style={styles.barColumn}>
                  <Text style={[styles.barValue, { color: colors.text.primary }]}>{point.durationDays}d</Text>
                  <View style={[styles.barBackground, { backgroundColor: colors.surfaceNeutral, height: MAX_BAR_HEIGHT }]}>
                    <View 
                      style={[
                        styles.barFillVertical, 
                        { 
                          height: getBarHeight(point.durationDays, maxPeriodDuration), 
                          backgroundColor: colors.phase.menstrual 
                        }
                      ]} 
                    />
                  </View>
                  <Text style={[styles.barLabel, { color: colors.text.secondary }]}>
                    {formatDateShort(point.startDate)}
                  </Text>
                  <Text style={[styles.barLabelYear, { color: colors.text.tertiary }]}>
                    '{point.startDate.substring(2, 4)}
                  </Text>
                </View>
              ))}
            </ScrollView>
          ) : (
            <DynamicLineChart 
              data={displayPeriodHistory.map(p => ({
                id: p.cycleIndex.toString(),
                value: p.durationDays,
                topLabel: `${p.durationDays}d`,
                bottomLabelPrimary: formatDateShort(p.startDate),
                bottomLabelSecondary: `'${p.startDate.substring(2, 4)}`
              }))}
              color={colors.phase.menstrual}
              height={MAX_BAR_HEIGHT}
              valueFormatter={(value) => `${value}d`}
            />
          )}
        </View>
      )}

      {/* Widget 3: Monthly Pain Trend */}
      {monthlyPainHistory.length >= 2 && (
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <PatternChartHeader
            title="Pain Over Time"
            subtitle={`Calendar-month average (scale 1–10), ${painSort === 'desc' ? 'newest to oldest' : 'oldest to newest'}`}
            viewMode={painView}
            sortOrder={painSort}
            onToggleView={() => setPainView(v => v === 'bar' ? 'line' : 'bar')}
            onToggleSort={() => setPainSort(s => s === 'desc' ? 'asc' : 'desc')}
          />
          
          {painView === 'bar' ? (
            <ScrollView showsVerticalScrollIndicator={false} 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={[
                styles.chartScroll,
                monthlyPainHistory.length < 6 && { flexGrow: 1, justifyContent: 'space-around' }
              ]}
            >
              {displayPainHistory.map((point) => (
                <View key={point.yearMonth} style={styles.barColumn}>
                  <Text style={[styles.barValue, { color: colors.text.primary }]}>{point.averagePain.toFixed(1)}</Text>
                  <View style={[styles.barBackground, { backgroundColor: colors.surfaceNeutral, height: MAX_BAR_HEIGHT }]}>
                    <View 
                      style={[
                        styles.barFillVertical, 
                        { 
                          height: getBarHeight(point.averagePain, maxPain), 
                          backgroundColor: colors.semantic.error 
                        }
                      ]} 
                    />
                  </View>
                  <Text style={[styles.barLabel, { color: colors.text.secondary }]}>{point.label}</Text>
                </View>
              ))}
            </ScrollView>
          ) : (
            <DynamicLineChart 
              data={displayPainHistory.map(p => ({
                id: p.yearMonth,
                value: p.averagePain,
                topLabel: p.averagePain.toFixed(1),
                bottomLabelPrimary: p.label
              }))}
              color={colors.semantic.error}
              height={MAX_BAR_HEIGHT}
              valueFormatter={(value) => value.toFixed(1)}
            />
          )}
        </View>
      )}

      {/* Widget 4: Energy Peak Day */}
      {energyPeakCycleDay !== null && (
        <View style={[styles.card, { backgroundColor: colors.surface, alignItems: 'center', paddingVertical: 24 }]}>
          <Text style={[styles.cardTitle, { color: colors.text.primary, marginBottom: 4 }]}>Energy Peak</Text>
          <Text style={[styles.cardSubtitle, { color: colors.text.secondary, textAlign: 'center', marginBottom: 16 }]}>
            The cycle day when your energy tends to be highest
          </Text>
          
          <Ionicons name="flash-outline" size={48} color={colors.semantic.warning} style={{ marginBottom: 12 }} />
          <Text style={[styles.peakDayText, { color: colors.brand.primary }]}>Day {energyPeakCycleDay}</Text>
          <Text style={[styles.peakSubText, { color: colors.text.secondary }]}>
            Avg {energyPeakAverage}/5 · {energyPeakSampleCount} observations
          </Text>
        </View>
      )}

      {/* Widget 5: Logging Consistency */}
      {loggingConsistencyPercent !== null && (
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.cardTitle, { color: colors.text.primary }]}>Logging Streak</Text>
          <Text style={[styles.cardSubtitle, { color: colors.text.secondary }]}>Unique days logged across your last 3 complete cycles</Text>
          
          <Text style={[styles.streakPercentText, { color: colors.text.primary }]}>{loggingConsistencyPercent}%</Text>
          
          <View style={[styles.horizontalBarBackground, { backgroundColor: colors.surfaceNeutral }]}>
            <View 
              style={[
                styles.horizontalBarFill, 
                { width: `${loggingConsistencyPercent}%`, backgroundColor: colors.brand.primary }
              ]} 
            />
          </View>
          
          {/* Presentation-only copy */}
          <Text style={[styles.streakMotivational, { color: colors.text.secondary }]}>
            {loggingConsistencyPercent >= 80 
              ? 'Great consistency — your insights are highly accurate.' 
              : loggingConsistencyPercent >= 50 
                ? 'Good effort. Log more days for better trends.' 
                : 'Try to log daily for more accurate insights.'}
          </Text>
        </View>
      )}

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
  cardTitle: {
    fontSize: fontSize.bodyMd,
    fontFamily: fontFamily.semiBold,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: fontSize.caption,
    marginBottom: 16,
  },
  chartScroll: {
    flexDirection: 'row',
    gap: 16,
    paddingBottom: 8,
  },
  barColumn: {
    alignItems: 'center',
    gap: 8,
  },
  barValue: {
    fontSize: fontSize.caption,
    fontFamily: fontFamily.semiBold,
  },
  barBackground: {
    width: 24,
    borderRadius: 12,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFillVertical: {
    width: '100%',
  },
  barLabel: {
    fontSize: 10,
    marginTop: 4,
  },
  barLabelYear: {
    fontSize: 9,
    marginTop: -4,
  },
  peakDayText: {
    fontSize: fontSize.headlineMd,
    fontFamily: fontFamily.bold,
    marginBottom: 8,
  },
  peakSubText: {
    fontSize: fontSize.caption,
  },
  streakPercentText: {
    fontSize: fontSize.headlineMd,
    fontFamily: fontFamily.bold,
    marginBottom: 12,
    textAlign: 'center',
  },
  horizontalBarBackground: {
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 12,
  },
  horizontalBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  streakMotivational: {
    fontSize: fontSize.caption,
    textAlign: 'center',
  },
});

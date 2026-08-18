import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { fontSize, fontFamily } from '@/design-system';
import { useTheme } from '../../hooks/useTheme';
import type { PatternInsights } from '../../../domain/models/Insights';
import { Ionicons } from '@expo/vector-icons';
import { formatDateShort } from '@/utils/dateUtils';
import { InsightsEmptyState } from './InsightsEmptyState';

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

  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      accessible={true}
      accessibilityLabel="Patterns Tab. Displays your longitudinal health trends over time."
      accessibilityHint="Shows cycle length, period duration, pain, energy, and logging consistency over time."
    >
      {/* Widget 1: Cycle Length */}
      {cycleLengthHistory.length >= 2 && (
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.cardTitle, { color: colors.text.primary }]}>Cycle Length</Text>
          <Text style={[styles.cardSubtitle, { color: colors.text.secondary }]}>Completed cycles, oldest to newest</Text>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={[
              styles.chartScroll,
              cycleLengthHistory.length < 6 && { flexGrow: 1, justifyContent: 'space-around' }
            ]}
          >
            {cycleLengthHistory.map((point) => (
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
        </View>
      )}

      {/* Widget 2: Period Duration */}
      {periodDurationHistory.length >= 2 && (
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.cardTitle, { color: colors.text.primary }]}>Period Duration</Text>
          <Text style={[styles.cardSubtitle, { color: colors.text.secondary }]}>Days of bleeding per cycle</Text>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={[
              styles.chartScroll,
              periodDurationHistory.length < 6 && { flexGrow: 1, justifyContent: 'space-around' }
            ]}
          >
            {periodDurationHistory.map((point) => (
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
        </View>
      )}

      {/* Widget 3: Monthly Pain Trend */}
      {monthlyPainHistory.length >= 2 && (
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.cardTitle, { color: colors.text.primary }]}>Pain Over Time</Text>
          <Text style={[styles.cardSubtitle, { color: colors.text.secondary }]}>Calendar-month average (scale 1–10)</Text>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={[
              styles.chartScroll,
              monthlyPainHistory.length < 6 && { flexGrow: 1, justifyContent: 'space-around' }
            ]}
          >
            {monthlyPainHistory.map((point) => (
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

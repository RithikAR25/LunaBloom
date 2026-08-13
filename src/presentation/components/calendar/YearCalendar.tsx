/**
 * YearCalendar — full-year overview in a 3-column grid.
 *
 * Renders all 12 months for the given year.
 * Phase/prediction data flows from the single timelineData computed
 * in CycleCalendar — no separate prediction pipeline.
 *
 * Tapping any date in this view:
 *   1. Selects the date (via onSelectDate)
 *   2. Switches the parent back to Month view (parent handles this)
 */
import { ScrollView, View, StyleSheet } from 'react-native';
import { spacing } from '@/design-system';
import { MiniMonthGrid } from './MiniMonthGrid';
import { todayISO } from '../../../utils/dateUtils';
import type { TimelineData } from '../../../domain/prediction/PredictionEngine';

const MONTH_ROWS: [number, number, number][] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [9, 10, 11],
];

interface YearCalendarProps {
  year: number;
  timelineData: TimelineData;
  selectedDate: string | null;
  /** Called with the tapped dateStr; parent handles view-switch logic */
  onSelectDate: (dateStr: string) => void;
}

export function YearCalendar({
  year,
  timelineData,
  selectedDate,
  onSelectDate,
}: YearCalendarProps) {
  const today = todayISO();

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {MONTH_ROWS.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((month) => (
            <MiniMonthGrid
              key={`${year}-${month}`}
              year={year}
              month={month}
              timelineData={timelineData}
              selectedDate={selectedDate}
              todayDate={today}
              onSelectDate={onSelectDate}
            />
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[2],
    paddingBottom: spacing[8],
    gap: spacing[5],
  },
  row: {
    flexDirection: 'row',
    gap: spacing[3],
  },
});

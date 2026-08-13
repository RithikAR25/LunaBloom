/**
 * MiniMonthGrid — one compact month for the Year calendar view.
 *
 * Data flow:
 *   timelineData (computed once in CycleCalendar, passed down)
 *       ↓
 *   PhaseResolver.getPhaseForDate()   ← O(1) via the pre-built index
 *       ↓
 *   MiniDayCell
 *
 * No biology is recalculated here. PhaseResolver reads from the existing
 * PhaseInterval array and the pre-built date index inside timelineData.
 * The module-level resolver instance is stateless and safe to share.
 */
import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/presentation/hooks/useTheme';
import { fontFamily, fontSize } from '@/design-system';
import { MiniDayCell } from './MiniDayCell';
import type { DayState } from './DayCell';
import { PhaseResolver, type FertilityStatus } from '../../../domain/prediction/services/PhaseResolver';
import type { TimelineData } from '../../../domain/prediction/PredictionEngine';

// Stateless singleton — safe to share across all MiniMonthGrid instances.
const _resolver = new PhaseResolver();

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const WEEK_DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

type MiniDayData = {
  dateStr: string;
  dayNumber: number;
  state: DayState;
  source: 'LOGGED' | 'RECONSTRUCTED' | 'PREDICTED' | undefined;
  fertilityStatus: FertilityStatus;
};

interface MiniMonthGridProps {
  year: number;
  /** 0-indexed month (0 = January … 11 = December) */
  month: number;
  timelineData: TimelineData;
  selectedDate: string | null;
  todayDate: string;
  onSelectDate: (dateStr: string) => void;
}

export function MiniMonthGrid({
  year,
  month,
  timelineData,
  selectedDate,
  todayDate,
  onSelectDate,
}: MiniMonthGridProps) {
  const { colors } = useTheme();

  const days = useMemo((): (MiniDayData | null)[] => {
    const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 (Sun) to 6 (Sat)
    const totalDays = new Date(year, month + 1, 0).getDate();

    const result: (MiniDayData | null)[] = [];

    // Leading padding cells
    for (let i = 0; i < firstDayOfWeek; i++) {
      result.push(null);
    }

    for (let i = 1; i <= totalDays; i++) {
      // Use Date.UTC to avoid local-timezone effects on date string generation
      const dateStr = new Date(Date.UTC(year, month, i)).toISOString().split('T')[0]!;

      // O(1) phase resolution via the pre-built index inside timelineData
      const phaseInfo = _resolver.getPhaseForDate(
        dateStr,
        timelineData.intervals,
        timelineData.index,
      );

      let state: DayState = 'none';
      if (phaseInfo.isPredictedMenstrual) {
        state = 'predicted_menstrual';
      } else {
        switch (phaseInfo.phase) {
          case 'MENSTRUAL': state = 'menstrual'; break;
          case 'FOLLICULAR': state = 'follicular'; break;
          case 'OVULATION': state = 'ovulatory'; break;
          case 'LUTEAL': state = 'luteal'; break;
        }
      }

      result.push({
        dateStr,
        dayNumber: i,
        state,
        source: phaseInfo.source ?? undefined,
        fertilityStatus: phaseInfo.fertilityStatus,
      });
    }

    return result;
  }, [year, month, timelineData]);

  // Highlight the current real-world month name in brand color
  const isCurrentRealMonth =
    new Date().getFullYear() === year && new Date().getMonth() === month;

  return (
    <View style={styles.container}>
      {/* Month name */}
      <Text
        style={[
          styles.monthName,
          { color: isCurrentRealMonth ? colors.brand.primary : colors.text.primary },
        ]}
      >
        {MONTH_NAMES[month]}
      </Text>

      {/* Weekday header row */}
      <View style={styles.weekRow}>
        {WEEK_DAYS.map((d, i) => (
          <Text
            key={`wd-${i}`}
            style={[styles.weekDay, { color: colors.text.secondary }]}
          >
            {d}
          </Text>
        ))}
      </View>

      {/* Day grid */}
      <View style={styles.grid}>
        {days.map((day, index) => {
          if (!day) {
            return (
              <MiniDayCell
                key={`empty-${month}-${index}`}
                dateStr=""
                dayNumber={null}
                state="none"
                source={undefined}
                isToday={false}
                isSelected={false}
              />
            );
          }
          return (
            <MiniDayCell
              key={day.dateStr}
              dateStr={day.dateStr}
              dayNumber={day.dayNumber}
              state={day.state}
              source={day.source}
              fertilityStatus={day.fertilityStatus}
              isToday={day.dateStr === todayDate}
              isSelected={day.dateStr === selectedDate}
              onPress={onSelectDate}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  monthName: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.caption,
    textAlign: 'center',
    marginBottom: 4,
  },
  weekRow: {
    flexDirection: 'row',
  },
  weekDay: {
    width: '14.28%',
    textAlign: 'center',
    fontSize: 8,
    fontFamily: fontFamily.semiBold,
    marginBottom: 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});

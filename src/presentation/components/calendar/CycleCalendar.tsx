import { useState, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { CalendarHeader } from './CalendarHeader';
import { CalendarGrid, CalendarDayData } from './CalendarGrid';
import { CalendarLegend } from './CalendarLegend';
import { DayState } from './DayCell';
import type { CycleEntry } from '../../../domain/models/Cycle';
import { CyclePredictionService } from '../../../domain/services/CyclePredictionService';
import { todayISO, addDays } from '../../../utils/dateUtils';

interface CycleCalendarProps {
  cycles: CycleEntry[];
  selectedDate: string | null;
  onSelectDate: (dateStr: string) => void;
}

export function CycleCalendar({ cycles, selectedDate, onSelectDate }: CycleCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Pre-calculate predictions
  const predictionService = new CyclePredictionService();
  
  // Use useMemo to avoid recalculating predictions on every render
  const predictions = useMemo(() => {
    if (cycles.length === 0) return null;
    return predictionService.predictOvulation(cycles);
  }, [cycles]);

  // Generate grid days
  const days = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const firstDayOfWeek = firstDayOfMonth.getDay(); // 0 (Sun) to 6 (Sat)
    const totalDays = lastDayOfMonth.getDate();

    const result: (CalendarDayData | null)[] = [];

    // Padding for first week
    for (let i = 0; i < firstDayOfWeek; i++) {
      result.push(null);
    }

    // Actual days
    for (let i = 1; i <= totalDays; i++) {
      const d = new Date(Date.UTC(year, month, i));
      const dateStr = d.toISOString().split('T')[0]!;

      // Determine state for this date based on `cycles` and `predictions`
      let state: DayState = 'none';

      // Check confirmed periods
      let isMenstrual = false;
      for (const cycle of cycles) {
        if (cycle.endDate) {
          if (dateStr >= cycle.startDate && dateStr <= cycle.endDate) {
            isMenstrual = true;
            break;
          }
        } else {
          if (dateStr >= cycle.startDate && dateStr <= todayISO()) {
            isMenstrual = true;
            break;
          }
        }
      }

      if (isMenstrual) {
        state = 'menstrual';
      } else if (predictions) {
        // Check predictions
        // We know predicted ovulation window and next period start date.
        // What about luteal / follicular?
        // Let's keep it simple for now:
        const { fertileWindowStart, fertileWindowEnd } = predictions;
        const predictedNextPeriod = predictionService.predictNextPeriod(cycles).predictedStartDate;

        if (dateStr >= predictedNextPeriod && dateStr <= addDays(predictedNextPeriod, 4)) {
          state = 'predicted_menstrual';
        } else if (dateStr >= fertileWindowStart && dateStr <= fertileWindowEnd) {
          state = 'ovulatory';
        } else if (dateStr > (cycles[0]?.endDate ?? '') && dateStr < fertileWindowStart) {
          state = 'follicular';
        } else if (dateStr > fertileWindowEnd && dateStr < predictedNextPeriod) {
          state = 'luteal';
        }
      }

      result.push({
        dateStr,
        dayNumber: i,
        state,
      });
    }

    return result;
  }, [currentMonth, cycles, predictions]);

  return (
    <View style={styles.container}>
      <CalendarHeader
        currentMonth={currentMonth}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
      />
      <CalendarGrid
        days={days}
        selectedDate={selectedDate}
        todayDate={todayISO()}
        onSelectDate={onSelectDate}
      />
      <CalendarLegend />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});

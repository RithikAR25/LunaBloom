import { useState, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { CalendarHeader } from './CalendarHeader';
import { CalendarGrid, CalendarDayData } from './CalendarGrid';
import { CalendarLegend } from './CalendarLegend';
import { DayState } from './DayCell';
import type { CycleEntry } from '../../../domain/models/Cycle';
import { todayISO } from '../../../utils/dateUtils';
import { useProfileStore } from '../../../presentation/stores/useProfileStore';
import { CyclePredictionService } from '../../../domain/services/CyclePredictionService';

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

  const profile = useProfileStore((s) => s.profile);

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

    const avgCycleLength = profile?.avgCycleLength || 28;
    const avgPeriodDuration = profile?.avgPeriodDuration || 5;
    const predictionService = new CyclePredictionService();

    // Actual days
    for (let i = 1; i <= totalDays; i++) {
      const d = new Date(Date.UTC(year, month, i));
      const dateStr = d.toISOString().split('T')[0]!;
      
      const phaseInfo = predictionService.getPhaseForDate(dateStr, cycles, avgCycleLength, avgPeriodDuration);
      
      let state: DayState = 'none';
      if (phaseInfo.isPredictedMenstrual) {
        state = 'predicted_menstrual';
      } else {
        switch (phaseInfo.phase) {
          case 'MENSTRUAL': state = 'menstrual'; break;
          case 'FOLLICULAR': state = 'follicular'; break;
          case 'OVULATORY': state = 'ovulatory'; break;
          case 'LUTEAL': state = 'luteal'; break;
        }
      }

      result.push({
        dateStr,
        dayNumber: i,
        state,
        fertilityStatus: phaseInfo.fertilityStatus,
      });
    }

    return result;
  }, [currentMonth, cycles, profile]);

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

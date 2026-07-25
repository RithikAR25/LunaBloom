import { View, StyleSheet, Text } from 'react-native';
import type { DayState } from './DayCell';
import { DayCell } from './DayCell';
import { useTheme } from '@/presentation/hooks/useTheme';
import { spacing, fontSize, fontFamily } from '@/design-system';
import type { FertilityStatus } from '@/domain/services/CyclePredictionService';

export interface CalendarDayData {
  dateStr: string;
  dayNumber: number;
  state: DayState;
  fertilityStatus?: FertilityStatus;
}

interface CalendarGridProps {
  days: (CalendarDayData | null)[]; // null for padding days at start of month
  selectedDate: string | null;
  todayDate: string;
  onSelectDate: (dateStr: string) => void;
}

export function CalendarGrid({ days, selectedDate, todayDate, onSelectDate }: CalendarGridProps) {
  const { colors } = useTheme();
  
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <View style={styles.container}>
      <View style={[styles.headerRow, { marginBottom: spacing[2] }]}>
        {weekDays.map((day) => (
          <Text key={day} style={[styles.weekDayText, { color: colors.text.secondary }]}>
            {day}
          </Text>
        ))}
      </View>
      
      <View style={styles.grid}>
        {days.map((day, index) => {
          if (!day) {
            return <DayCell key={`empty-${index}`} dateStr="" dayNumber={null} state="none" isToday={false} isSelected={false} />;
          }
          return (
            <DayCell
              key={day.dateStr}
              dateStr={day.dateStr}
              dayNumber={day.dayNumber}
              state={day.state}
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
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  weekDayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: fontSize.caption,
    fontFamily: fontFamily.semiBold,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});

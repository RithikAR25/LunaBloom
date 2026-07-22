import { View, StyleSheet, Text } from 'react-native';
import { DayCell, DayState } from './DayCell';
import { useTheme } from '@/presentation/hooks/useTheme';
import { spacing } from '@/design-system';

export interface CalendarDayData {
  dateStr: string;
  dayNumber: number;
  state: DayState;
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
    fontSize: 12,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});

import { View, StyleSheet, Text, Pressable } from 'react-native';
import { useTheme } from '@/presentation/hooks/useTheme';
import { spacing, fontSize, fontFamily } from '@/design-system';
import { todayISO, isBetween, isAfter } from '@/utils/dateUtils';
import { useMemo } from 'react';

interface DateRangePickerGridProps {
  currentMonth: Date;
  startDate: string | null;
  endDate: string | null;
  onSelectDate: (dateStr: string) => void;
}

export function DateRangePickerGrid({
  currentMonth,
  startDate,
  endDate,
  onSelectDate,
}: DateRangePickerGridProps) {
  const { colors } = useTheme();
  
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const todayStr = todayISO();

  const days = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const result: ({ dateStr: string; dayNumber: number } | null)[] = [];

    // Leading padding cells
    for (let i = 0; i < firstDayOfWeek; i++) {
      result.push(null);
    }

    for (let i = 1; i <= totalDays; i++) {
      // Create local ISO string manually to avoid timezone shift on the day
      const m = String(month + 1).padStart(2, '0');
      const d = String(i).padStart(2, '0');
      const dateStr = `${year}-${m}-${d}`;
      
      result.push({ dateStr, dayNumber: i });
    }

    return result;
  }, [currentMonth]);

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
            return <View key={`empty-${index}`} style={styles.cellContainer} />;
          }

          const isStart = day.dateStr === startDate;
          const isEnd = day.dateStr === endDate;
          const isSameDay = isStart && isEnd;
          const isInRange = startDate && endDate && !isStart && !isEnd && isBetween(day.dateStr, startDate, endDate);
          const isDisabled = isAfter(day.dateStr, todayStr);
          const isSelected = isStart || isEnd;
          
          return (
            <View key={day.dateStr} style={[styles.cellContainer]}>
              {/* Range Highlights */}
              {isInRange && (
                <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.brand.secondaryContainer }]} />
              )}
              {isStart && !isSameDay && endDate && isAfter(endDate, day.dateStr) && (
                <View style={[{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '50%', backgroundColor: colors.brand.secondaryContainer }]} />
              )}
              {isEnd && !isSameDay && startDate && isAfter(day.dateStr, startDate) && (
                <View style={[{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '50%', backgroundColor: colors.brand.secondaryContainer }]} />
              )}
              
              <Pressable
                onPress={() => !isDisabled && onSelectDate(day.dateStr)}
                style={[
                  styles.dayCircle,
                  isSelected && { backgroundColor: colors.brand.primary },
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    { color: colors.text.primary },
                    isSelected && { color: colors.background, fontFamily: fontFamily.bold },
                    isDisabled && { color: colors.text.disabled },
                  ]}
                >
                  {day.dayNumber}
                </Text>
              </Pressable>
            </View>
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
  cellContainer: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
    position: 'relative',
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1, // ensure it renders above the range highlights
  },
  dayText: {
    fontSize: fontSize.body,
    fontFamily: fontFamily.semiBold,
  },
});

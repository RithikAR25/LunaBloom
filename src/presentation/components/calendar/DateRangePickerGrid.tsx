import { View, StyleSheet, Text, Pressable, PanResponder } from 'react-native';
import { useTheme } from '@/presentation/hooks/useTheme';
import { spacing, fontSize, fontFamily } from '@/design-system';
import { todayISO, isBetween, isAfter } from '@/utils/dateUtils';
import { useMemo, useRef, useEffect } from 'react';

interface DateRangePickerGridProps {
  currentMonth: Date;
  startDate: string | null;
  endDate: string | null;
  onSelectDate: (dateStr: string) => void;
  onDragBoundary?: (draggedBoundary: 'start' | 'end', newDateStr: string) => void;
  onDragEnd?: () => void;
}

export function DateRangePickerGrid({
  currentMonth,
  startDate,
  endDate,
  onSelectDate,
  onDragBoundary,
  onDragEnd,
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

  // Gesture & Measurement tracking
  const gridRef = useRef<View>(null);
  const gridMeasurement = useRef({ pageX: 0, pageY: 0, width: 0, height: 0 });
  const initialBoundaryRef = useRef<'start' | 'end' | null>(null);

  // We keep days in a ref so PanResponder callbacks don't have stale closures
  const daysRef = useRef(days);
  useEffect(() => {
    daysRef.current = days;
  }, [days]);

  const measureGrid = () => {
    gridRef.current?.measure((_x, _y, width, height, pageX, pageY) => {
      gridMeasurement.current = { pageX, pageY, width, height };
    });
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false, // Don't claim immediately
        onMoveShouldSetPanResponder: (_evt, gestureState) => {
          if (!initialBoundaryRef.current) return false;
          // Claim gesture if moved past a small threshold
          const dx = Math.abs(gestureState.dx);
          const dy = Math.abs(gestureState.dy);
          return dx > 8 || dy > 8;
        },
        onPanResponderGrant: () => {
          measureGrid(); // Ensure accurate coordinates at start of drag
        },
        onPanResponderMove: (evt, _gestureState) => {
          if (!initialBoundaryRef.current || !onDragBoundary) return;
          
          const { pageX, pageY } = evt.nativeEvent;
          const m = gridMeasurement.current;
          if (m.width === 0) return;
          
          // Calculate relative position within the grid
          const relX = pageX - m.pageX;
          const relY = pageY - m.pageY;
          
          const cellWidth = m.width / 7;
          const rowHeight = cellWidth + 4; // Accounts for marginVertical: 2
          
          const col = Math.floor(relX / cellWidth);
          const row = Math.floor(relY / rowHeight);
          
          const index = row * 7 + col;
          
          const currentDays = daysRef.current;
          if (index >= 0 && index < currentDays.length) {
            const day = currentDays[index];
            if (day) {
              const isDisabled = isAfter(day.dateStr, todayStr);
              if (!isDisabled) {
                onDragBoundary(initialBoundaryRef.current, day.dateStr);
              }
            }
          }
        },
        onPanResponderRelease: () => {
          initialBoundaryRef.current = null;
          if (onDragEnd) onDragEnd();
        },
        onPanResponderTerminate: () => {
          initialBoundaryRef.current = null;
          if (onDragEnd) onDragEnd();
        },
      }),
    [onDragBoundary, onDragEnd, todayStr]
  );

  return (
    <View style={styles.container}>
      <View style={[styles.headerRow, { marginBottom: spacing[2] }]}>
        {weekDays.map((day) => (
          <Text key={day} style={[styles.weekDayText, { color: colors.text.secondary }]}>
            {day}
          </Text>
        ))}
      </View>
      
      <View 
        style={styles.grid}
        ref={gridRef}
        onLayout={measureGrid}
        {...panResponder.panHandlers}
      >
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
                onPressIn={() => {
                  if (isStart) initialBoundaryRef.current = 'start';
                  else if (isEnd) initialBoundaryRef.current = 'end';
                  else initialBoundaryRef.current = null;
                }}
                onPress={() => {
                  initialBoundaryRef.current = null;
                  if (!isDisabled) onSelectDate(day.dateStr);
                }}
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

import { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/presentation/hooks/useTheme';
import { useScaling, spacing, borderRadius } from '@/design-system';
import { BottomPickerModal } from './BottomPickerModal';
import { WheelPicker, ITEM_HEIGHT, LIST_HEIGHT } from './WheelPicker';
import { parseISODateLocal, formatDateToISO, todayISO } from '@/utils/dateUtils';

interface DatePickerModalProps {
  visible: boolean;
  value?: string | null; // YYYY-MM-DD
  minDate?: string; // YYYY-MM-DD
  maxDate?: string; // YYYY-MM-DD
  onConfirm: (date: string) => void;
  onCancel: () => void;
}

export function DatePickerModal({
  visible,
  value,
  minDate,
  maxDate,
  onConfirm,
  onCancel,
}: DatePickerModalProps) {
  const { colors } = useTheme();
  const { scale } = useScaling();

  // 1. Determine Initial Date (Value -> Today -> Clamp)
  const initialDateStr = value || todayISO();
  let parsedDate = parseISODateLocal(initialDateStr);
  
  if (minDate && initialDateStr < minDate) parsedDate = parseISODateLocal(minDate);
  if (maxDate && initialDateStr > maxDate) parsedDate = parseISODateLocal(maxDate);

  // 2. Local State for Wheels
  const [tempMonthIndex, setTempMonthIndex] = useState(parsedDate.getMonth());
  const [tempDay, setTempDay] = useState(parsedDate.getDate());
  const [tempYear, setTempYear] = useState(parsedDate.getFullYear());

  // Reset state whenever modal opens or props change
  useEffect(() => {
    if (visible) {
      const startStr = value || todayISO();
      let start = parseISODateLocal(startStr);
      if (minDate && startStr < minDate) start = parseISODateLocal(minDate);
      if (maxDate && startStr > maxDate) start = parseISODateLocal(maxDate);

      setTempMonthIndex(start.getMonth());
      setTempDay(start.getDate());
      setTempYear(start.getFullYear());
    }
  }, [visible, value, minDate, maxDate]);

  // 3. Domain constraints for years
  const startYear = minDate ? parseISODateLocal(minDate).getFullYear() : new Date().getFullYear() - 100;
  const endYear = maxDate ? parseISODateLocal(maxDate).getFullYear() : new Date().getFullYear();

  // 4. Data Arrays
  const months = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const d = new Date(2000, i, 1);
      return d.toLocaleString('default', { month: 'short' });
    });
  }, []);

  const years = useMemo(() => {
    const arr = [];
    for (let i = startYear; i <= endYear; i++) {
      arr.push(i);
    }
    return arr;
  }, [startYear, endYear]);

  // 5. Clamping Logic
  const maxDaysInMonth = new Date(tempYear, tempMonthIndex + 1, 0).getDate();
  const clampedDay = Math.min(tempDay, maxDaysInMonth);
  
  // Ensure we don't pick outside of minDate/maxDate boundaries if the year/month matches exactly
  let clampedMonthIndex = tempMonthIndex;
  
  if (minDate) {
    const minD = parseISODateLocal(minDate);
    if (tempYear === minD.getFullYear() && clampedMonthIndex < minD.getMonth()) {
      clampedMonthIndex = minD.getMonth();
    }
  }
  if (maxDate) {
    const maxD = parseISODateLocal(maxDate);
    if (tempYear === maxD.getFullYear() && clampedMonthIndex > maxD.getMonth()) {
      clampedMonthIndex = maxD.getMonth();
    }
  }

  let finalClampedDay = Math.min(clampedDay, new Date(tempYear, clampedMonthIndex + 1, 0).getDate());

  if (minDate) {
    const minD = parseISODateLocal(minDate);
    if (tempYear === minD.getFullYear() && clampedMonthIndex === minD.getMonth() && finalClampedDay < minD.getDate()) {
      finalClampedDay = minD.getDate();
    }
  }
  if (maxDate) {
    const maxD = parseISODateLocal(maxDate);
    if (tempYear === maxD.getFullYear() && clampedMonthIndex === maxD.getMonth() && finalClampedDay > maxD.getDate()) {
      finalClampedDay = maxD.getDate();
    }
  }

  // Update temp state if it was clamped
  useEffect(() => {
    if (tempDay !== finalClampedDay) setTempDay(finalClampedDay);
    if (tempMonthIndex !== clampedMonthIndex) setTempMonthIndex(clampedMonthIndex);
  }, [finalClampedDay, tempDay, clampedMonthIndex, tempMonthIndex]);

  const days = useMemo(() => {
    const arr = [];
    const max = new Date(tempYear, clampedMonthIndex + 1, 0).getDate();
    for (let i = 1; i <= max; i++) {
      arr.push(i);
    }
    return arr;
  }, [tempYear, clampedMonthIndex]);

  const tempYearIndex = Math.max(0, years.indexOf(tempYear));
  const tempDayIndex = Math.max(0, days.indexOf(finalClampedDay));

  const handleConfirm = () => {
    const d = new Date(tempYear, clampedMonthIndex, finalClampedDay);
    onConfirm(formatDateToISO(d));
  };

  const padHeight = (LIST_HEIGHT - ITEM_HEIGHT) / 2;

  return (
    <BottomPickerModal visible={visible} onCancel={onCancel} onConfirm={handleConfirm}>
      <View style={[styles.container, { height: LIST_HEIGHT, marginVertical: scale(spacing.sm) }]}>
        {/* Continuous Center Highlight matches precise fixed ITEM_HEIGHT from WheelPicker contract */}
        <View 
          style={[
            styles.selectionHighlight, 
            { 
              backgroundColor: colors.surfaceElevated,
              height: ITEM_HEIGHT,
              top: padHeight,
              borderRadius: scale(borderRadius.md)
            }
          ]} 
          pointerEvents="none"
        />

        <View style={styles.wheelsWrapper}>
          <View style={styles.wheelSection}>
            <WheelPicker<string>
              items={months}
              selectedIndex={clampedMonthIndex}
              onChange={(index) => setTempMonthIndex(index)}
            />
          </View>
          <View style={styles.wheelSection}>
            <WheelPicker<number>
              items={days}
              selectedIndex={tempDayIndex}
              onChange={(index) => setTempDay(days[index] as number)}
            />
          </View>
          <View style={styles.wheelSection}>
            <WheelPicker<number>
              items={years}
              selectedIndex={tempYearIndex}
              onChange={(index) => setTempYear(years[index] as number)}
            />
          </View>
        </View>
      </View>
    </BottomPickerModal>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
  },
  wheelsWrapper: {
    flexDirection: 'row',
    width: '100%',
    height: '100%',
  },
  wheelSection: {
    flex: 1,
  },
  selectionHighlight: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    zIndex: -1,
  }
});

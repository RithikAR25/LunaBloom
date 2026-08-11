import { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/presentation/hooks/useTheme';
import { BottomPickerModal } from '../ui/BottomPickerModal';
import { WheelPicker, ITEM_HEIGHT, LIST_HEIGHT } from '../ui/WheelPicker';
import { spacing, borderRadius } from '@/design-system';

interface MonthYearPickerProps {
  visible: boolean;
  currentMonth: Date;
  onConfirm: (newDate: Date) => void;
  onCancel: () => void;
}

export function MonthYearPicker({ visible, currentMonth, onConfirm, onCancel }: MonthYearPickerProps) {
  const { colors } = useTheme();

  const [tempMonthIndex, setTempMonthIndex] = useState(currentMonth.getMonth());
  const [tempYear, setTempYear] = useState(currentMonth.getFullYear());

  // Reset temporary state whenever the modal opens or currentMonth changes
  useEffect(() => {
    if (visible) {
      setTempMonthIndex(currentMonth.getMonth());
      setTempYear(currentMonth.getFullYear());
    }
  }, [visible, currentMonth]);

  const months = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const d = new Date(2000, i, 1);
      return d.toLocaleString('default', { month: 'long' });
    });
  }, []);

  const years = useMemo(() => {
    const currentViewedYear = currentMonth.getFullYear();
    const arr = [];
    for (let i = currentViewedYear - 5; i <= currentViewedYear + 5; i++) {
      arr.push(i);
    }
    return arr;
  }, [currentMonth]);

  const tempYearIndex = years.indexOf(tempYear);
  const selectedYearIndex = Math.max(0, tempYearIndex);

  const handleConfirm = () => {
    // Construct local date matching existing app convention: Day 1 of the chosen month/year
    onConfirm(new Date(tempYear, tempMonthIndex, 1));
  };

  const padHeight = (LIST_HEIGHT - ITEM_HEIGHT) / 2;

  return (
    <BottomPickerModal visible={visible} onCancel={onCancel} onConfirm={handleConfirm}>
      <View style={[styles.container, { height: LIST_HEIGHT }]}>
        {/* Continuous Center Highlight */}
        <View 
          style={[
            styles.selectionHighlight, 
            { 
              backgroundColor: colors.surfaceElevated,
              height: ITEM_HEIGHT,
              top: padHeight
            }
          ]} 
          pointerEvents="none"
        />

        <View style={styles.wheelsWrapper}>
          <WheelPicker<string>
            items={months}
            selectedIndex={tempMonthIndex}
            onChange={(index) => setTempMonthIndex(index)}
          />
          <WheelPicker<number>
            items={years}
            selectedIndex={selectedYearIndex}
            onChange={(index) => setTempYear(years[index] as number)}
          />
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
  selectionHighlight: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    borderRadius: borderRadius.md,
    opacity: 0.5,
  },
});

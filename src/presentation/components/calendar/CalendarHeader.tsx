import { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '@/presentation/hooks/useTheme';
import { spacing, fontSize, fontFamily } from '@/design-system';
import { MonthYearPicker } from './MonthYearPicker';
import type { ViewMode } from './ViewModeSlider';

interface CalendarHeaderProps {
  currentMonth: Date;
  /** Controls whether the header shows "Month Year" or just "Year" and
   *  adjusts navigation/picker behaviour accordingly. */
  viewMode: ViewMode;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onDateChange: (newDate: Date) => void;
}

export function CalendarHeader({
  currentMonth,
  viewMode,
  onPrevMonth,
  onNextMonth,
  onDateChange,
}: CalendarHeaderProps) {
  const { colors } = useTheme();
  const [showPicker, setShowPicker] = useState(false);

  const monthName = currentMonth.toLocaleString('default', { month: 'long' });
  const year = currentMonth.getFullYear();

  // Month mode: "August 2026"   Year mode: "2026"
  const titleText = viewMode === 'year' ? String(year) : `${monthName} ${year}`;
  // Title is only tappable (opens MonthYearPicker) in Month mode
  const isTitleInteractive = viewMode === 'month';

  const handleDateConfirm = (newDate: Date) => {
    setShowPicker(false);
    onDateChange(newDate);
  };

  return (
    <View style={[styles.container, { padding: spacing[4] }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={viewMode === 'year' ? 'Previous year' : 'Previous month'}
        onPress={onPrevMonth}
        style={styles.button}
      >
        <Text style={{ color: colors.brand.primary, fontSize: fontSize.bodyLg }}>{'<'}</Text>
      </Pressable>

      <Pressable
        onPress={isTitleInteractive ? () => setShowPicker(true) : undefined}
        style={styles.titleContainer}
        disabled={!isTitleInteractive}
        accessibilityRole={isTitleInteractive ? 'button' : 'none'}
        accessibilityLabel={isTitleInteractive ? `Open date picker, currently ${titleText}` : titleText}
      >
        <Text style={[styles.title, { color: colors.text.primary }]}>
          {titleText}
        </Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={viewMode === 'year' ? 'Next year' : 'Next month'}
        onPress={onNextMonth}
        style={styles.button}
      >
        <Text style={{ color: colors.brand.primary, fontSize: fontSize.bodyLg }}>{'>'}</Text>
      </Pressable>

      {/* MonthYearPicker is only mounted in Month mode */}
      {viewMode === 'month' && (
        <MonthYearPicker
          visible={showPicker}
          currentMonth={currentMonth}
          onConfirm={handleDateConfirm}
          onCancel={() => setShowPicker(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: fontSize.headlineSm,
    fontFamily: fontFamily.semiBold,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
});

import { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '@/presentation/hooks/useTheme';
import { spacing, fontSize, fontFamily } from '@/design-system';
import { MonthYearPicker } from './MonthYearPicker';

interface CalendarHeaderProps {
  currentMonth: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onDateChange: (newDate: Date) => void;
}

export function CalendarHeader({ currentMonth, onPrevMonth, onNextMonth, onDateChange }: CalendarHeaderProps) {
  const { colors } = useTheme();

  const monthName = currentMonth.toLocaleString('default', { month: 'long' });
  const year = currentMonth.getFullYear();
  const [showPicker, setShowPicker] = useState(false);

  const handleDateConfirm = (newDate: Date) => {
    setShowPicker(false);
    onDateChange(newDate);
  };

  return (
    <View style={[styles.container, { padding: spacing[4] }]}>
      <Pressable accessibilityRole="button" onPress={onPrevMonth} style={styles.button}>
        <Text style={{ color: colors.brand.primary, fontSize: fontSize.bodyLg }}>{'<'}</Text>
      </Pressable>
      
      <Pressable onPress={() => setShowPicker(true)} style={styles.titleContainer}>
        <Text style={[styles.title, { color: colors.text.primary }]}>
          {monthName} {year}
        </Text>
      </Pressable>
      
      <Pressable accessibilityRole="button" onPress={onNextMonth} style={styles.button}>
        <Text style={{ color: colors.brand.primary, fontSize: fontSize.bodyLg }}>{'>'}</Text>
      </Pressable>

      <MonthYearPicker
        visible={showPicker}
        currentMonth={currentMonth}
        onConfirm={handleDateConfirm}
        onCancel={() => setShowPicker(false)}
      />
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

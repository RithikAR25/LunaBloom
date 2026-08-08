import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '@/presentation/hooks/useTheme';
import { spacing, fontSize, fontFamily } from '@/design-system';
import { RollerSelector } from '../ui/RollerSelector';

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
  const currentMonthIndex = currentMonth.getMonth();

  const [showMonthRoller, setShowMonthRoller] = useState(false);
  const [showYearRoller, setShowYearRoller] = useState(false);

  const months = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const d = new Date(2000, i, 1);
      return d.toLocaleString('default', { month: 'long' });
    });
  }, []);

  const years = useMemo(() => {
    const y = currentMonth.getFullYear();
    const arr = [];
    for (let i = y - 5; i <= y + 5; i++) {
      arr.push(i);
    }
    return arr;
  }, [currentMonth]);

  const yearSelectedIndex = years.indexOf(year);

  const handleMonthConfirm = (month: string, index: number) => {
    setShowMonthRoller(false);
    onDateChange(new Date(year, index, 1));
  };

  const handleYearConfirm = (newYear: number) => {
    setShowYearRoller(false);
    onDateChange(new Date(newYear, currentMonthIndex, 1));
  };

  return (
    <View style={[styles.container, { padding: spacing[4] }]}>
      <Pressable accessibilityRole="button" onPress={onPrevMonth} style={styles.button}>
        <Text style={{ color: colors.brand.primary, fontSize: fontSize.bodyLg }}>{'<'}</Text>
      </Pressable>
      
      <View style={styles.titleContainer}>
        <Pressable onPress={() => setShowMonthRoller(true)}>
          <Text style={[styles.title, { color: colors.text.primary }]}>{monthName}</Text>
        </Pressable>
        <Text style={[styles.title, { color: colors.text.primary }]}> </Text>
        <Pressable onPress={() => setShowYearRoller(true)}>
          <Text style={[styles.title, { color: colors.text.primary }]}>{year}</Text>
        </Pressable>
      </View>
      
      <Pressable accessibilityRole="button" onPress={onNextMonth} style={styles.button}>
        <Text style={{ color: colors.brand.primary, fontSize: fontSize.bodyLg }}>{'>'}</Text>
      </Pressable>

      <RollerSelector<string>
        visible={showMonthRoller}
        items={months}
        selectedIndex={currentMonthIndex}
        onConfirm={handleMonthConfirm}
        onCancel={() => setShowMonthRoller(false)}
      />

      <RollerSelector<number>
        visible={showYearRoller}
        items={years}
        selectedIndex={Math.max(0, yearSelectedIndex)}
        onConfirm={handleYearConfirm}
        onCancel={() => setShowYearRoller(false)}
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

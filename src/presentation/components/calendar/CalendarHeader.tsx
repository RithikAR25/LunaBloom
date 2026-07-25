import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '@/presentation/hooks/useTheme';
import { spacing, fontSize, fontFamily } from '@/design-system';

interface CalendarHeaderProps {
  currentMonth: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export function CalendarHeader({ currentMonth, onPrevMonth, onNextMonth }: CalendarHeaderProps) {
  const { colors } = useTheme();

  const monthName = currentMonth.toLocaleString('default', { month: 'long' });
  const year = currentMonth.getFullYear();

  return (
    <View style={[styles.container, { padding: spacing[4] }]}>
      <Pressable accessibilityRole="button" onPress={onPrevMonth} style={styles.button}>
        <Text style={{ color: colors.brand.primary, fontSize: fontSize.bodyLg }}>{'<'}</Text>
      </Pressable>
      
      <Text style={[styles.title, { color: colors.text.primary }]}>
        {monthName} {year}
      </Text>
      
      <Pressable accessibilityRole="button" onPress={onNextMonth} style={styles.button}>
        <Text style={{ color: colors.brand.primary, fontSize: fontSize.bodyLg }}>{'>'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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

import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '@/presentation/hooks/useTheme';
import { spacing } from '@/design-system';

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
      <Pressable onPress={onPrevMonth} style={styles.button}>
        <Text style={{ color: colors.brand.primary, fontSize: 18 }}>{'<'}</Text>
      </Pressable>
      
      <Text style={[styles.title, { color: colors.text.primary }]}>
        {monthName} {year}
      </Text>
      
      <Pressable onPress={onNextMonth} style={styles.button}>
        <Text style={{ color: colors.brand.primary, fontSize: 18 }}>{'>'}</Text>
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
    fontSize: 20,
    fontWeight: '600',
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
});

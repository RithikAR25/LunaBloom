import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '@/presentation/hooks/useTheme';
import { borderRadius } from '@/design-system';

export type DayState = 'none' | 'menstrual' | 'follicular' | 'ovulatory' | 'luteal' | 'predicted_menstrual';

interface DayCellProps {
  dateStr: string; // ISO date string or empty if padding
  dayNumber: number | null;
  state: DayState;
  isToday: boolean;
  isSelected: boolean;
  onPress?: (dateStr: string) => void;
}

export function DayCell({ dateStr, dayNumber, state, isToday, isSelected, onPress }: DayCellProps) {
  const { colors } = useTheme();

  if (!dayNumber) {
    return <View style={styles.emptyCell} />;
  }

  const getBackgroundColor = () => {
    switch (state) {
      case 'menstrual': return colors.phase.menstrual + '20';
      case 'predicted_menstrual': return colors.phase.predicted + '10';
      case 'follicular': return colors.phase.follicular + '20';
      case 'ovulatory': return colors.phase.ovulatory + '20';
      case 'luteal': return colors.phase.luteal + '20';
      default: return 'transparent';
    }
  };

  const getTextColor = () => {
    if (isSelected) return colors.text.inverse;
    switch (state) {
      case 'menstrual':
      case 'predicted_menstrual':
        return colors.phase.menstrual;
      default:
        return colors.text.primary;
    }
  };

  const getBorderColor = () => {
    if (isSelected) return colors.brand.primary;
    if (isToday) return colors.brand.primary;
    if (state === 'predicted_menstrual') return colors.phase.predicted; // dashed border
    return 'transparent';
  };

  return (
    <Pressable
      style={[
        styles.cell,
        {
          backgroundColor: isSelected ? colors.brand.primary : getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: isToday || isSelected || state === 'predicted_menstrual' ? 1 : 0,
          borderStyle: state === 'predicted_menstrual' && !isSelected ? 'dashed' : 'solid',
          borderRadius: borderRadius.md,
        },
      ]}
      onPress={() => onPress && onPress(dateStr)}
    >
      <Text
        style={[
          styles.text,
          {
            color: getTextColor(),
            fontWeight: isToday || isSelected || state !== 'none' ? '600' : '400',
          },
        ]}
      >
        {dayNumber}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  emptyCell: {
    flex: 1,
    aspectRatio: 1,
    margin: 2,
  },
  cell: {
    flex: 1,
    aspectRatio: 1,
    margin: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
  },
});

import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '@/presentation/hooks/useTheme';
import { borderRadius } from '@/design-system';
import type { FertilityStatus } from '@/domain/services/CyclePredictionService';

export type DayState = 'none' | 'menstrual' | 'follicular' | 'ovulatory' | 'luteal' | 'predicted_menstrual';

interface DayCellProps {
  dateStr: string; // ISO date string or empty if padding
  dayNumber: number | null;
  state: DayState;
  fertilityStatus?: FertilityStatus | undefined;
  isToday: boolean;
  isSelected: boolean;
  onPress?: (dateStr: string) => void;
}

export function DayCell({ dateStr, dayNumber, state, fertilityStatus = 'not_fertile', isToday, isSelected, onPress }: DayCellProps) {
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
    <View style={styles.cellWrapper}>
      <Pressable accessibilityRole="button"
        style={[
          styles.cell,
          {
            backgroundColor: getBackgroundColor(),
            borderColor: getBorderColor(),
            borderWidth: isSelected ? 2 : (isToday || state === 'predicted_menstrual' ? 1 : 0),
            borderStyle: state === 'predicted_menstrual' && !isSelected && !isToday ? 'dashed' : 'solid',
            borderRadius: borderRadius.full, // perfect circles for calendar dots
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
        {(fertilityStatus === 'fertile' || fertilityStatus === 'possible') && (state === 'menstrual' || state === 'predicted_menstrual') && (
          <View style={[styles.fertilityDot, { backgroundColor: colors.phase.ovulatory }]} />
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyCell: {
    width: '14.28%',
    aspectRatio: 1,
  },
  cellWrapper: {
    width: '14.28%',
    aspectRatio: 1,
    padding: 2,
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
  },
  fertilityDot: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});

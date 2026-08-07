import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '@/presentation/hooks/useTheme';
import { borderRadius } from '@/design-system';
import { FertilityStatus } from '../../../domain/prediction';

export type DayState = 'none' | 'menstrual' | 'follicular' | 'ovulatory' | 'luteal' | 'predicted_menstrual' | 'unknown';

interface DayCellProps {
  dateStr: string; 
  dayNumber: number | null;
  state: DayState;
  fertilityStatus?: FertilityStatus | undefined;
  source?: 'LOGGED' | 'RECONSTRUCTED' | 'PREDICTED' | undefined;
  isToday: boolean;
  isSelected: boolean;
  onPress?: (dateStr: string) => void;
}

export function DayCell({ dateStr, dayNumber, state, fertilityStatus = 'not_fertile', source, isToday, isSelected, onPress }: DayCellProps) {
  const { colors } = useTheme();

  if (!dayNumber) {
    return <View style={styles.emptyCell} />;
  }

  const getBackgroundColor = () => {
    const isPredicted = source === 'PREDICTED';
    const opacity = isPredicted ? '1A' : '33'; // Lighter for predicted, standard for facts
    
    switch (state) {
      case 'menstrual':
      case 'predicted_menstrual': 
        return colors.phase.menstrual + opacity;
      case 'follicular': return colors.phase.follicular + opacity;
      case 'ovulatory': return colors.phase.ovulatory + opacity;
      case 'luteal': return colors.phase.luteal + opacity;
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
    if (source === 'PREDICTED' && state !== 'none') return colors.phase.predicted; // dashed border for any predicted phase
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
            borderWidth: isSelected ? 2 : (isToday || (source === 'PREDICTED' && state !== 'none') ? 1 : 0),
            borderStyle: (source === 'PREDICTED' && state !== 'none' && !isSelected && !isToday) ? 'dashed' : 'solid',
            borderRadius: borderRadius.full,
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
        {(fertilityStatus === 'fertile' || fertilityStatus === 'possible') && (
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

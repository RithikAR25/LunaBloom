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
    const opacity = isPredicted ? '25' : '33';
    
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

  const getBorderAppearance = () => {
    const isFertile = fertilityStatus === 'fertile' || fertilityStatus === 'possible';

    // Priority 1: Selected
    if (isSelected) {
      return { borderColor: colors.brand.primary, borderWidth: 2, borderStyle: 'solid' as const };
    }
    // Priority 2: Today
    if (isToday) {
      return { borderColor: colors.brand.primary, borderWidth: 1, borderStyle: 'solid' as const };
    }
    // Priority 3 & 4: Fertile (logged or predicted)
    if (isFertile) {
      return { 
        borderColor: colors.phase.ovulatory + '90', 
        borderWidth: 1, 
        borderStyle: source === 'PREDICTED' ? 'dashed' as const : 'solid' as const 
      };
    }
    // Priority 5: Predicted (non-fertile)
    if (source === 'PREDICTED' && state !== 'none') {
      return { borderColor: colors.phase.predicted, borderWidth: 1, borderStyle: 'dashed' as const };
    }
    // Priority 6: Default
    return { borderColor: 'transparent', borderWidth: 0, borderStyle: 'solid' as const };
  };

  const borderAppearance = getBorderAppearance();

  return (
    <View style={styles.cellWrapper}>
      <Pressable accessibilityRole="button"
        style={[
          styles.cell,
          {
            backgroundColor: getBackgroundColor(),
            borderColor: borderAppearance.borderColor,
            borderWidth: borderAppearance.borderWidth,
            borderStyle: borderAppearance.borderStyle,
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
});

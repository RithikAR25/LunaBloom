/**
 * MiniDayCell — compact day cell for the Year calendar view.
 *
 * NOT a reuse of DayCell — DayCell's 16px typography and 2px padding are
 * unsuitable at the ~17px cell size required by the 3-column year layout.
 *
 * Visual simplification vs DayCell:
 *   - No dashed fertile-window border (too small to render legibly)
 *   - fertilityStatus is received from PhaseResolver but only used for
 *     future extensibility — the underlying data is NOT discarded.
 *   - 9sp text, 1px today-ring instead of the full-size treatment
 *
 * Pressing a day in Year view selects it and switches back to Month view
 * (handled by the parent via onPress).
 */
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '@/presentation/hooks/useTheme';
import { borderRadius } from '@/design-system';
import type { DayState } from './DayCell';
import type { FertilityStatus } from '../../../domain/prediction';

interface MiniDayCellProps {
  dateStr: string;
  dayNumber: number | null;
  state: DayState;
  /** Comes from PhaseResolver — preserved even though no border is drawn at this scale */
  fertilityStatus?: FertilityStatus;
  source: 'LOGGED' | 'RECONSTRUCTED' | 'PREDICTED' | undefined;
  isToday: boolean;
  isSelected: boolean;
  onPress?: (dateStr: string) => void;
}

export function MiniDayCell({
  dateStr,
  dayNumber,
  state,
  source,
  isToday,
  isSelected,
  onPress,
}: MiniDayCellProps) {
  const { colors } = useTheme();

  if (!dayNumber) {
    return <View style={styles.cell} />;
  }

  const getBackgroundColor = () => {
    if (isSelected) return colors.brand.primary;
    const opacity = source === 'PREDICTED' ? '22' : '33';
    switch (state) {
      case 'menstrual':
      case 'predicted_menstrual':
        return colors.phase.menstrual + opacity;
      case 'follicular':
        return colors.phase.follicular + opacity;
      case 'ovulatory':
        return colors.phase.ovulatory + opacity;
      case 'luteal':
        return colors.phase.luteal + opacity;
      default:
        return 'transparent';
    }
  };

  const getTextColor = () => {
    if (isSelected) return colors.text.inverse;
    switch (state) {
      case 'menstrual':
      case 'predicted_menstrual':
        return colors.phase.menstrual;
      default:
        return isToday ? colors.brand.primary : colors.text.primary;
    }
  };

  return (
    <View style={styles.cell}>
      <Pressable
        style={[
          styles.circle,
          {
            backgroundColor: getBackgroundColor(),
            borderRadius: borderRadius.full,
            borderColor: isToday && !isSelected ? colors.brand.primary : 'transparent',
            borderWidth: isToday && !isSelected ? 0.75 : 0,
          },
        ]}
        onPress={() => onPress && onPress(dateStr)}
        accessibilityRole="button"
        accessibilityLabel={`${dayNumber}`}
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
  cell: {
    width: '14.28%',
    aspectRatio: 1,
    padding: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 9,
    textAlign: 'center',
    includeFontPadding: false,
  },
});

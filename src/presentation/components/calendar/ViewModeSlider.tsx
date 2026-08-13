/**
 * ViewModeSlider — Month | Year segmented control
 *
 * Pill-shaped two-segment toggle.
 * Active segment: white pill (colors.surface) that slides with a native animation.
 * Uses LunaBloom design tokens exclusively — no hardcoded colors.
 */
import { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Easing,
  type LayoutChangeEvent,
} from 'react-native';
import { useTheme } from '@/presentation/hooks/useTheme';
import { borderRadius, fontSize, fontFamily, spacing } from '@/design-system';

export type ViewMode = 'month' | 'year';

interface ViewModeSliderProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}

const INNER_PADDING = 3;

export function ViewModeSlider({ value, onChange }: ViewModeSliderProps) {
  const { colors } = useTheme();
  const [containerWidth, setContainerWidth] = useState(0);
  const animValue = useRef(new Animated.Value(value === 'month' ? 0 : 1)).current;

  // Sync animation whenever the controlled `value` changes
  useEffect(() => {
    Animated.timing(animValue, {
      toValue: value === 'month' ? 0 : 1,
      duration: 180,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [value, animValue]);

  const handleLayout = (e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
  };

  const segmentWidth = containerWidth > 0
    ? (containerWidth - INNER_PADDING * 2) / 2
    : 0;

  const translateX = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, segmentWidth],
  });

  return (
    <View
      style={[styles.outerPill, { backgroundColor: colors.surfaceElevated }]}
      onLayout={handleLayout}
    >
      {/* Sliding active indicator */}
      {segmentWidth > 0 && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.indicator,
            {
              backgroundColor: colors.surface,
              width: segmentWidth,
              transform: [{ translateX }],
            },
          ]}
        />
      )}

      <Pressable
        style={styles.segment}
        onPress={() => onChange('month')}
        accessibilityRole="button"
        accessibilityLabel="Month view"
        accessibilityState={{ selected: value === 'month' }}
      >
        <Text
          style={[
            styles.label,
            {
              color: value === 'month' ? colors.text.primary : colors.text.secondary,
              fontFamily: value === 'month' ? fontFamily.semiBold : fontFamily.medium,
            },
          ]}
        >
          Month
        </Text>
      </Pressable>

      <Pressable
        style={styles.segment}
        onPress={() => onChange('year')}
        accessibilityRole="button"
        accessibilityLabel="Year view"
        accessibilityState={{ selected: value === 'year' }}
      >
        <Text
          style={[
            styles.label,
            {
              color: value === 'year' ? colors.text.primary : colors.text.secondary,
              fontFamily: value === 'year' ? fontFamily.semiBold : fontFamily.medium,
            },
          ]}
        >
          Year
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  outerPill: {
    flexDirection: 'row',
    alignSelf: 'center',
    width: '43%',
    borderRadius: borderRadius.full,
    padding: INNER_PADDING,
    marginVertical: spacing[4],
  },
  indicator: {
    position: 'absolute',
    top: INNER_PADDING,
    left: INNER_PADDING,
    bottom: INNER_PADDING,
    borderRadius: borderRadius.full,

  },
  segment: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: spacing[4],
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: fontSize.labelMd,
  },
});

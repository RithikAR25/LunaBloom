/**
 * LunaBloom ProgressBar Component
 *
 * Linear progress indicator with optional animation.
 * Used for: cycle day progress, insights frequency bars, wellbeing levels.
 *
 * progress: 0.0 → 1.0
 * Animates via React Native Animated.Value when animated=true.
 */
import { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, type ViewStyle } from 'react-native';
import { useTheme } from '@/presentation/hooks/useTheme';
import { borderRadius } from '@/design-system';

export interface ProgressBarProps {
  /** 0.0 to 1.0 */
  progress: number;
  /** Fill color — defaults to brand.primary */
  color?: string;
  /** Track color — defaults to border */
  trackColor?: string;
  height?: number;
  /** When true, animates progress changes with spring */
  animated?: boolean;
  /** Rounded ends — defaults to true */
  rounded?: boolean;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

export function ProgressBar({
  progress,
  color,
  trackColor,
  height = 6,
  animated: shouldAnimate = true,
  rounded = true,
  style,
  accessibilityLabel,
}: ProgressBarProps) {
  const { colors } = useTheme();
  const widthAnim = useRef(new Animated.Value(0)).current;

  const clampedProgress = Math.max(0, Math.min(1, progress));

  useEffect(() => {
    if (shouldAnimate) {
      Animated.spring(widthAnim, {
        toValue: clampedProgress,
        useNativeDriver: false,
        speed: 14,
        bounciness: 0,
      }).start();
    } else {
      widthAnim.setValue(clampedProgress);
    }
  }, [clampedProgress, shouldAnimate, widthAnim]);

  const fillColor = color ?? colors.brand.primary;
  const bgColor = trackColor ?? colors.border;
  const radius = rounded ? borderRadius.full : 0;

  return (
    <View
      style={[styles.track, { height, backgroundColor: bgColor, borderRadius: radius }, style]}
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clampedProgress * 100) }}
    >
      <Animated.View
        style={[
          styles.fill,
          {
            backgroundColor: fillColor,
            borderRadius: radius,
            width: widthAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }),
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
});

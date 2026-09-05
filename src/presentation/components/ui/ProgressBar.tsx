/**
 * LunaBloom ProgressBar Component
 *
 * Linear progress indicator with optional animation.
 * Used for: cycle day progress, insights frequency bars, wellbeing levels.
 *
 * progress: 0.0 → 1.0
 * Animates via React Native Animated.Value when animated=true.
 */
import { useEffect, useState } from 'react';
import { View, Animated, StyleSheet, type ViewStyle } from 'react-native';
import { useTheme } from '@/presentation/hooks/useTheme';
import { useScaling, borderRadius } from '@/design-system';

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
  /** Describes what the progress represents for screen readers */
  accessibilityHint?: string;
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
  accessibilityHint,
}: ProgressBarProps) {
  const { colors } = useTheme();
  const { verticalScale } = useScaling();
  const [widthAnim] = useState(() => new Animated.Value(0));

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
      style={[styles.track, { height: verticalScale(height), backgroundColor: bgColor, borderRadius: radius }, style]}
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
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

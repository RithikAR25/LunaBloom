/**
 * LunaBloom Card Component
 *
 *
 * Surface container that groups related content.
 * Optionally pressable (use onPress to make it tappable).
 * All cards use a soft tertiary background (surfaceElevated) with no border and 16px radius.
 */
import { useState, useCallback } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '@/presentation/hooks/useTheme';
import { borderRadius, spacing, elevation } from '@/design-system';

export interface CardProps {
  children: React.ReactNode;
  /** Makes the card tappable with press animation */
  onPress?: () => void;
  /** Extra styles applied to the outer container */
  style?: ViewStyle;
  /** Override default 24pt internal padding */
  padding?: number;
  /** Uses surfaceElevated color for depth layering */
  elevated?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: 'none' | 'button' | 'link';
}

export function Card({
  children,
  onPress,
  style,
  padding = spacing[6],
  elevated = false,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole,
}: CardProps) {
  const { colors } = useTheme();
  const [scaleAnim] = useState(() => new Animated.Value(1));

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, { toValue: 0.98, useNativeDriver: true, speed: 50, bounciness: 0 }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
  }, [scaleAnim]);

  const cardStyle: ViewStyle = {
    backgroundColor: elevated ? colors.surfaceElevated : colors.surface,
    padding,
    // Cards have no visible border, boundaries defined by soft background
    borderWidth: 0,
    ...(elevated ? elevation.level1 : elevation.level0),
  };

  if (onPress !== undefined) {
    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          accessibilityRole={accessibilityRole ?? 'button'}
          accessibilityLabel={accessibilityLabel}
          accessibilityHint={accessibilityHint}
          style={[styles.card, cardStyle, style]}
        >
          {children}
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <View
      style={[styles.card, cardStyle, style]}
      accessibilityRole={accessibilityRole ?? 'none'}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.DEFAULT, // 16px
    overflow: 'hidden',
  },
});

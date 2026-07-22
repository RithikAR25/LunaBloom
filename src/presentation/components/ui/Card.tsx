/**
 * LunaBloom Card Component
 *
 * Surface container that groups related content.
 * Optionally pressable (use onPress to make it tappable).
 * All cards use surface color (#16162A dark / #FFFFFF light) with 12pt radius.
 */
import React, { useRef, useCallback } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '@/presentation/hooks/useTheme';
import { borderRadius, spacing } from '@/design-system';

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
  accessibilityRole?: 'none' | 'button' | 'link';
}

export function Card({
  children,
  onPress,
  style,
  padding = spacing[6],
  elevated = false,
  accessibilityLabel,
  accessibilityRole,
}: CardProps) {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, { toValue: 0.98, useNativeDriver: true, speed: 50, bounciness: 0 }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
  }, [scaleAnim]);

  const cardStyle: ViewStyle = {
    backgroundColor: elevated ? colors.surfaceElevated : colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    padding,
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
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
});

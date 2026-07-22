/**
 * LunaBloom FloatingActionButton Component
 *
 * Large circular button anchored in the bottom-right of the screen.
 * Used for primary creation actions (e.g. 'Start Period', 'Add Log').
 *
 * Position is controlled by the parent via absolute positioning.
 * The FAB itself renders at a fixed size with a drop shadow-equivalent effect
 * (React Native uses elevation on Android, shadowColor on iOS).
 */
import React, { useRef, useCallback } from 'react';
import { Animated, Pressable, StyleSheet, type ViewStyle } from 'react-native';
import { useTheme } from '@/presentation/hooks/useTheme';
import { borderRadius } from '@/design-system';

export type FABSize = 'regular' | 'large';

export interface FloatingActionButtonProps {
  /** Icon element to render inside the FAB */
  icon: React.ReactNode;
  onPress: () => void;
  /** Required — screen readers cannot infer purpose from icon alone */
  accessibilityLabel: string;
  size?: FABSize;
  /** Override background color — defaults to brand.primary */
  backgroundColor?: string;
  /** Override icon container positioning */
  style?: ViewStyle;
  disabled?: boolean;
}

const FAB_DIMS = { regular: 56, large: 72 } as const;

export function FloatingActionButton({
  icon,
  onPress,
  accessibilityLabel,
  size = 'regular',
  backgroundColor,
  style,
  disabled = false,
}: FloatingActionButtonProps) {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, { toValue: 0.92, useNativeDriver: true, speed: 50, bounciness: 0 }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 50, bounciness: 6 }).start();
  }, [scaleAnim]);

  const dim = FAB_DIMS[size];
  const bgColor = backgroundColor ?? colors.brand.primary;

  return (
    <Animated.View
      style={[
        styles.shadow,
        { transform: [{ scale: scaleAnim }] },
        style,
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ disabled }}
        style={[
          styles.button,
          {
            width: dim,
            height: dim,
            backgroundColor: bgColor,
            opacity: disabled ? 0.4 : 1,
          },
        ]}
      >
        {icon}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    // Android
    elevation: 8,
    // iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    borderRadius: borderRadius.full,
  },
  button: {
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

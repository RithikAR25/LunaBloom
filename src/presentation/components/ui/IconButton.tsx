/**
 * LunaBloom IconButton Component
 *
 * Circular pressable button for icon-only actions.
 * accessibilityLabel is REQUIRED — no visible text means screen readers need it.
 */
import { useRef, useCallback } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '@/presentation/hooks/useTheme';
import { borderRadius } from '@/design-system';

export type IconButtonVariant = 'primary' | 'surface' | 'ghost';
export type IconButtonSize = 'sm' | 'md' | 'lg';

const SIZE_DIMS = { sm: 36, md: 44, lg: 52 } as const;

export interface IconButtonProps {
  /** The icon element to render inside the button */
  icon: React.ReactNode;
  onPress: () => void;
  /** Required — used by screen readers since there is no visible label */
  accessibilityLabel: string;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  disabled?: boolean;
}

export function IconButton({
  icon,
  onPress,
  accessibilityLabel,
  variant = 'surface',
  size = 'md',
  disabled = false,
}: IconButtonProps) {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, { toValue: 0.92, useNativeDriver: true, speed: 50, bounciness: 0 }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
  }, [scaleAnim]);

  const dim = SIZE_DIMS[size];

  const bgColor = {
    primary: colors.brand.primary,
    surface: colors.surface,
    ghost: 'transparent',
  }[variant];

  const borderColor = {
    primary: 'transparent',
    surface: colors.border,
    ghost: 'transparent',
  }[variant];

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ disabled }}
        style={[
          styles.base,
          {
            width: dim,
            height: dim,
            backgroundColor: bgColor,
            borderColor,
            borderWidth: variant === 'surface' ? 1 : 0,
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
  base: {
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

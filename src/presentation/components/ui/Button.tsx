/**
 * LunaBloom Button Component
 *
 * Variants: primary | secondary | ghost | danger
 * Sizes: sm | md | lg
 * States: default, pressed (scale 0.97), disabled (40% opacity), loading
 * Shape: pill (borderRadius: full)
 */
import { useRef, useCallback } from 'react';
import {
  Animated,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  View,
  Text,
  type PressableProps,
} from 'react-native';
import { useTheme } from '@/presentation/hooks/useTheme';
import { borderRadius, fontSize, spacing } from '@/design-system';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<PressableProps, 'style' | 'children'> {
  /** Button label text */
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Shows ActivityIndicator; disables interaction */
  loading?: boolean;
  disabled?: boolean;
  /** Optional icon rendered to the left of the label */
  leftIcon?: React.ReactNode;
  /** Optional icon rendered to the right of the label */
  rightIcon?: React.ReactNode;
  /** Stretches button to container width */
  fullWidth?: boolean;
  accessibilityLabel?: string;
}

const SIZE_MAP = {
  sm: { paddingVertical: spacing[2], paddingHorizontal: spacing[4], textSize: fontSize.label },
  md: { paddingVertical: spacing[3] + 1, paddingHorizontal: spacing[6], textSize: fontSize.body },
  lg: { paddingVertical: spacing[4], paddingHorizontal: spacing[8], textSize: fontSize.body + 1 },
} as const;

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  accessibilityLabel,
  ...rest
}: ButtonProps) {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 50,
      bounciness: 0,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [scaleAnim]);

  const sizeTokens = SIZE_MAP[size];
  const isDisabled = disabled || loading;

  const bgColor = {
    primary: colors.brand.primary,
    secondary: 'transparent',
    ghost: 'transparent',
    danger: colors.semantic.error,
  }[variant];

  const textColor = {
    primary: colors.text.inverse,
    secondary: colors.brand.primary,
    ghost: colors.text.secondary,
    danger: colors.text.inverse,
  }[variant];

  const borderColor = {
    primary: 'transparent',
    secondary: colors.brand.primary,
    ghost: 'transparent',
    danger: 'transparent',
  }[variant];

  return (
    <Animated.View style={[fullWidth && styles.fullWidth, { transform: [{ scale: scaleAnim }] }]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityState={{ disabled: isDisabled, busy: loading }}
        style={[
          styles.base,
          {
            backgroundColor: bgColor,
            borderColor,
            borderWidth: variant === 'secondary' ? 1.5 : 0,
            paddingVertical: sizeTokens.paddingVertical,
            paddingHorizontal: sizeTokens.paddingHorizontal,
            opacity: isDisabled ? 0.4 : 1,
          },
          fullWidth && styles.fullWidth,
        ]}
        {...rest}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={textColor}
            accessibilityLabel="Loading"
          />
        ) : (
          <View style={styles.row}>
            {leftIcon !== undefined && <View style={styles.iconLeft}>{leftIcon}</View>}
            <Text style={[styles.label, { color: textColor, fontSize: sizeTokens.textSize }]}>
              {label}
            </Text>
            {rightIcon !== undefined && <View style={styles.iconRight}>{rightIcon}</View>}
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  fullWidth: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  iconLeft: { marginRight: spacing[2] },
  iconRight: { marginLeft: spacing[2] },
});

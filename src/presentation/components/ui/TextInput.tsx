/**
 * LunaBloom TextInput Component
 *
 * Form input with label, helper text, error state, and focus ring.
 * Border radius: 8pt (inputs)
 * Focus ring: 2pt, brand.primary color
 * States: default, focused, error, disabled
 */
import React, { useState, useCallback, useId } from 'react';
import {
  View,
  TextInput as RNTextInput,
  Text,
  StyleSheet,
  type TextInputProps as RNTextInputProps,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '@/presentation/hooks/useTheme';
import { borderRadius, fontSize, spacing } from '@/design-system';

export interface TextInputProps extends Omit<RNTextInputProps, 'style'> {
  /** Visible label above the input */
  label?: string;
  /** Error message shown below input. Also turns border red. */
  error?: string;
  /** Non-error helper text below input */
  helperText?: string;
  /** Icon on the left inside the input */
  leftIcon?: React.ReactNode;
  /** Icon on the right inside the input (e.g. eye for password) */
  rightIcon?: React.ReactNode;
  disabled?: boolean;
  style?: ViewStyle;
}

export function TextInput({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  disabled = false,
  style,
  onFocus,
  onBlur,
  ...rest
}: TextInputProps) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  // useId for associating label with input (a11y)
  const inputId = useId();

  const handleFocus = useCallback(
    (e: Parameters<NonNullable<RNTextInputProps['onFocus']>>[0]) => {
      setFocused(true);
      onFocus?.(e);
    },
    [onFocus]
  );

  const handleBlur = useCallback(
    (e: Parameters<NonNullable<RNTextInputProps['onBlur']>>[0]) => {
      setFocused(false);
      onBlur?.(e);
    },
    [onBlur]
  );

  const hasError = error !== undefined && error.length > 0;

  const borderColor = hasError
    ? colors.semantic.error
    : focused
      ? colors.brand.primary
      : colors.border;

  const borderWidth = focused ? 2 : 1;

  return (
    <View style={[styles.wrapper, style]}>
      {label !== undefined && (
        <Text
          nativeID={inputId}
          style={[styles.label, { color: hasError ? colors.semantic.error : colors.text.secondary }]}
        >
          {label}
        </Text>
      )}

      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: colors.surface,
            borderColor,
            borderWidth,
            opacity: disabled ? 0.4 : 1,
          },
        ]}
      >
        {leftIcon !== undefined && <View style={styles.leftIcon}>{leftIcon}</View>}

        <RNTextInput
          style={[
            styles.input,
            {
              color: colors.text.primary,
              flex: 1,
            },
            leftIcon !== undefined && { paddingLeft: 0 },
            rightIcon !== undefined && { paddingRight: 0 },
          ]}
          placeholderTextColor={colors.text.tertiary}
          editable={!disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          accessibilityLabelledBy={label !== undefined ? inputId : undefined}
          {...rest}
        />

        {rightIcon !== undefined && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>

      {hasError && (
        <Text style={[styles.helperText, { color: colors.semantic.error }]}>
          {error}
        </Text>
      )}
      {!hasError && helperText !== undefined && (
        <Text style={[styles.helperText, { color: colors.text.tertiary }]}>
          {helperText}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing[1],
  },
  label: {
    fontSize: fontSize.label,
    fontWeight: '500',
    marginBottom: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing[3],
    minHeight: 48,
  },
  input: {
    fontSize: fontSize.body,
    paddingVertical: spacing[3],
    includeFontPadding: false,
  },
  leftIcon: {
    marginRight: spacing[2],
  },
  rightIcon: {
    marginLeft: spacing[2],
  },
  helperText: {
    fontSize: fontSize.caption,
    marginTop: 2,
  },
});

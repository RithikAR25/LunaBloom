/**
 * LunaBloom Text Component
 *
 * Typed typography for body text — maps to design tokens.
 * Variants: body | label | caption | micro
 * Colors: primary | secondary | tertiary | inverse | disabled | link | error
 *
 * For headings (h1, h2, h3, display), use the Heading component instead.
 */

import {
  Text as RNText,
  StyleSheet,
  type TextProps as RNTextProps,
  type TextStyle,
  type StyleProp,
} from 'react-native';
import { useTheme } from '@/presentation/hooks/useTheme';
import { fontSize, lineHeight } from '@/design-system';

export type TextVariant = 'body' | 'label' | 'caption' | 'micro';
export type TextColor =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'inverse'
  | 'disabled'
  | 'link'
  | 'error';
export type TextWeight = 'regular' | 'medium' | 'semiBold' | 'bold';

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  color?: TextColor;
  weight?: TextWeight;
  /** Override any style directly */
  style?: StyleProp<TextStyle>;
  children: React.ReactNode;
}

const VARIANT_STYLES: Record<TextVariant, TextStyle> = {
  body: { fontSize: fontSize.body, lineHeight: fontSize.body * lineHeight.relaxed },
  label: { fontSize: fontSize.label, lineHeight: fontSize.label * lineHeight.normal },
  caption: { fontSize: fontSize.caption, lineHeight: fontSize.caption * lineHeight.normal },
  micro: { fontSize: fontSize.micro, lineHeight: fontSize.micro * lineHeight.snug },
};

const WEIGHT_MAP: Record<TextWeight, TextStyle['fontWeight']> = {
  regular: '400',
  medium: '500',
  semiBold: '600',
  bold: '700',
};

export function Text({
  variant = 'body',
  color = 'primary',
  weight = 'regular',
  style,
  children,
  ...rest
}: TextProps) {
  const { colors } = useTheme();

  const resolvedColor = {
    primary: colors.text.primary,
    secondary: colors.text.secondary,
    tertiary: colors.text.tertiary,
    inverse: colors.text.inverse,
    disabled: colors.text.disabled,
    link: colors.text.link,
    error: colors.semantic.error,
  }[color];

  return (
    <RNText
      style={[
        styles.base,
        VARIANT_STYLES[variant],
        { color: resolvedColor, fontWeight: WEIGHT_MAP[weight] },
        style,
      ]}
      {...rest}
    >
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  base: {
    // fontFamily set per-platform once Inter fonts are loaded (v0.5+)
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});

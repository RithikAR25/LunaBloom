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
import { fontSize, lineHeight, fontFamily } from '@/design-system';

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
  body: { fontSize: fontSize.bodyMd, lineHeight: fontSize.bodyMd * lineHeight.relaxed },
  label: { fontSize: fontSize.labelMd, lineHeight: fontSize.labelMd * lineHeight.normal, letterSpacing: 0.05 * fontSize.labelMd },
  caption: { fontSize: fontSize.caption, lineHeight: fontSize.caption * lineHeight.normal },
  micro: { fontSize: fontSize.micro, lineHeight: fontSize.micro * lineHeight.snug },
};

const WEIGHT_MAP: Record<TextWeight, { fontWeight: TextStyle['fontWeight']; fontFamily: string }> = {
  regular: { fontWeight: '400', fontFamily: fontFamily.regular },
  medium: { fontWeight: '500', fontFamily: fontFamily.medium },
  semiBold: { fontWeight: '600', fontFamily: fontFamily.semiBold },
  bold: { fontWeight: '700', fontFamily: fontFamily.bold },
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
        { 
          color: resolvedColor, 
          fontWeight: WEIGHT_MAP[weight].fontWeight,
          fontFamily: WEIGHT_MAP[weight].fontFamily 
        },
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

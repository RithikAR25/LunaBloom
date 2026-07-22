/**
 * LunaBloom Heading Component
 *
 * Typed heading/display text — maps to design tokens.
 * Levels: display | h1 | h2 | h3
 *
 * For body text (body, label, caption, micro), use the Text component.
 */

import {
  Text,
  StyleSheet,
  type TextStyle,
  type TextProps,
  type StyleProp,
} from 'react-native';
import { useTheme } from '@/presentation/hooks/useTheme';
import { fontSize, lineHeight, letterSpacing } from '@/design-system';

export type HeadingLevel = 'display' | 'h1' | 'h2' | 'h3';
export type HeadingColor = 'primary' | 'secondary' | 'tertiary' | 'inverse' | 'brand';

const LEVEL_STYLES: Record<HeadingLevel, TextStyle> = {
  display: {
    fontSize: fontSize.display,
    fontWeight: '700',
    letterSpacing: letterSpacing.tight,
    lineHeight: fontSize.display * lineHeight.tight,
  },
  h1: {
    fontSize: fontSize.heading1,
    fontWeight: '700',
    letterSpacing: letterSpacing.tight,
    lineHeight: fontSize.heading1 * lineHeight.tight,
  },
  h2: {
    fontSize: fontSize.heading2,
    fontWeight: '600',
    letterSpacing: letterSpacing.normal,
    lineHeight: fontSize.heading2 * lineHeight.snug,
  },
  h3: {
    fontSize: fontSize.heading3,
    fontWeight: '600',
    letterSpacing: letterSpacing.normal,
    lineHeight: fontSize.heading3 * lineHeight.snug,
  },
};

export interface HeadingProps extends Omit<TextProps, 'style' | 'children'> {
  level: HeadingLevel;
  children: React.ReactNode;
  color?: HeadingColor;
  style?: StyleProp<TextStyle>;
  accessibilityRole?: 'header' | 'none';
}

export function Heading({
  level,
  children,
  color = 'primary',
  style,
  accessibilityRole = 'header',
  ...rest
}: HeadingProps) {
  const { colors } = useTheme();

  const resolvedColor = {
    primary: colors.text.primary,
    secondary: colors.text.secondary,
    tertiary: colors.text.tertiary,
    inverse: colors.text.inverse,
    brand: colors.brand.primary,
  }[color];

  return (
    <Text
      style={[
        styles.base,
        LEVEL_STYLES[level],
        { color: resolvedColor },
        style,
      ]}
      accessibilityRole={accessibilityRole}
      {...rest}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    includeFontPadding: false,
  },
});

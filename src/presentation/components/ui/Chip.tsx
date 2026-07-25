/**
 * LunaBloom Chip Component
 *
 * Selectable or non-selectable pill-shaped element for moods, symptoms, options.
 * Multi-select chips: each tap toggles selected state (controlled by parent).
 *
 * Color variants:
 *   primary  → purple (mood chips)
 *   secondary → teal (symptom chips)
 *   rose     → menstrual phase chips
 *   amber    → ovulatory phase chips
 *   green    → follicular phase chips
 *   neutral  → unselected / default
 */
import { useState, useCallback } from 'react';
import { Animated, Pressable, View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/presentation/hooks/useTheme';
import { borderRadius, fontSize, spacing, fontFamily, palette } from '@/design-system';

export type ChipColorVariant =
  | 'primary'
  | 'secondary'
  | 'rose'
  | 'amber'
  | 'green'
  | 'neutral';

export interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  /** Optional icon rendered before the label */
  icon?: React.ReactNode;
  colorVariant?: ChipColorVariant;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  /** If true, renders without a press handler (display only) */
  readOnly?: boolean;
}

const FILL_COLORS: Record<ChipColorVariant, string> = {
  primary: palette.sanguinePrimary, // purple -> sanguinePrimary
  secondary: palette.sanguineSecondary, // teal -> sanguineSecondary
  rose: palette.sanguineOnPrimaryContainer,
  amber: palette.amber600, // kept for ovulatory phase
  green: palette.green700, // kept for follicular phase
  neutral: palette.slate500,
};

const FILL_COLORS_DARK: Record<ChipColorVariant, string> = {
  primary: palette.sanguineOnPrimaryContainer,
  secondary: palette.sanguineSecondaryContainer,
  rose: palette.sanguineOnPrimaryContainer,
  amber: palette.amber400,
  green: palette.green400,
  neutral: palette.slate500,
};

export function Chip({
  label,
  selected = false,
  onPress,
  icon,
  colorVariant = 'neutral',
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
  readOnly = false,
}: ChipProps) {
  const { colors, isDark } = useTheme();
  const [scaleAnim] = useState(() => new Animated.Value(1));

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: true, speed: 50, bounciness: 0 }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
  }, [scaleAnim]);

  const fillColor = isDark ? FILL_COLORS_DARK[colorVariant] : FILL_COLORS[colorVariant];

  const bgColor = selected ? fillColor : 'transparent';
  const borderColor = selected ? fillColor : colors.border;
  const textColor = selected ? palette.white : colors.text.secondary;
  const borderWidth = selected ? 0 : 2;

  const chipContent = (
    <View style={[styles.inner, { backgroundColor: bgColor, borderColor, borderWidth }]}>
      {icon !== undefined && <View style={styles.icon}>{icon}</View>}
      <Text
        style={[styles.label, { color: textColor }]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );

  if (readOnly || onPress === undefined) {
    return (
      <View
        accessibilityRole="none"
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ selected }}
        style={{ opacity: disabled ? 0.4 : 1 }}
      >
        {chipContent}
      </View>
    );
  }

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }], opacity: disabled ? 0.4 : 1 }}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        accessibilityRole="checkbox"
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ selected, disabled }}
      >
        {chipContent}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    minHeight: 36,
    gap: spacing.base,
  },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: fontSize.labelMd,
    fontFamily: fontFamily.medium,
  },
});

/**
 * LunaBloom Badge Component
 *
 * Small pill label for phase names, status, counts.
 * NOT interactive — use Chip for selectable elements.
 *
 * Variants:
 *   primary   → purple (general/brand)
 *   secondary → teal
 *   phase-*   → phase-specific colors (used by PhaseBadge pattern)
 *   error     → red
 *   success   → green
 *   warning   → amber
 *   neutral   → slate
 */

import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/presentation/hooks/useTheme';
import { borderRadius, fontSize, spacing } from '@/design-system';
import { palette } from '@/design-system';

export type BadgeVariant =
  | 'primary'
  | 'secondary'
  | 'error'
  | 'success'
  | 'warning'
  | 'neutral'
  | 'phase-menstrual'
  | 'phase-follicular'
  | 'phase-ovulatory'
  | 'phase-luteal'
  | 'phase-predicted';

export type BadgeSize = 'sm' | 'md';

export interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  /** Optional icon before label */
  icon?: React.ReactNode;
}

export function Badge({ label, variant = 'primary', size = 'md', icon }: BadgeProps) {
  const { colors, isDark } = useTheme();

  const bgColors: Record<BadgeVariant, string> = {
    primary: isDark ? `${colors.brand.primary}33` : `${colors.brand.primary}22`,
    secondary: isDark ? `${colors.brand.secondary}33` : `${colors.brand.secondary}22`,
    error: `${colors.semantic.error}22`,
    success: `${colors.semantic.success}22`,
    warning: `${colors.semantic.warning}22`,
    neutral: isDark ? palette.slate700 : palette.slate200,
    'phase-menstrual': isDark ? `${palette.rose400}33` : `${palette.rose700}22`,
    'phase-follicular': isDark ? `${palette.green400}33` : `${palette.green700}22`,
    'phase-ovulatory': isDark ? `${palette.amber400}33` : `${palette.amber600}22`,
    'phase-luteal': isDark ? `${palette.purple400}33` : `${palette.purple600}22`,
    'phase-predicted': isDark ? `${palette.slate500}33` : `${palette.slate300}22`,
  };

  const textColors: Record<BadgeVariant, string> = {
    primary: colors.brand.primary,
    secondary: colors.brand.secondary,
    error: colors.semantic.error,
    success: colors.semantic.success,
    warning: colors.semantic.warning,
    neutral: colors.text.secondary,
    'phase-menstrual': isDark ? palette.rose400 : palette.rose700,
    'phase-follicular': isDark ? palette.green400 : palette.green700,
    'phase-ovulatory': isDark ? palette.amber400 : palette.amber600,
    'phase-luteal': isDark ? palette.purple400 : palette.purple600,
    'phase-predicted': colors.text.tertiary,
  };

  const isSm = size === 'sm';

  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: bgColors[variant],
          paddingHorizontal: isSm ? spacing[2] : spacing[3],
          paddingVertical: isSm ? 2 : spacing[1],
          gap: isSm ? 3 : spacing[1],
        },
      ]}
      accessibilityRole="none"
    >
      {icon !== undefined && (
        <View style={styles.icon}>{icon}</View>
      )}
      <Text
        style={[
          styles.label,
          {
            color: textColors[variant],
            fontSize: isSm ? fontSize.micro : fontSize.caption,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});

/**
 * LunaBloom SectionHeader Component
 *
 * Section label rendered above groups of related content.
 * Uppercase, muted color, small font — matches Stitch settings screen design.
 *
 * Used for: Settings sections, card group headers, content separators.
 */
import React from 'react';
import { View, Text, StyleSheet, type ViewStyle } from 'react-native';
import { useTheme } from '@/presentation/hooks/useTheme';
import { fontSize, spacing } from '@/design-system';

export interface SectionHeaderProps {
  /** Section label — rendered UPPERCASE */
  title: string;
  /** Optional trailing element (e.g. a link or counter) */
  trailing?: React.ReactNode;
  style?: ViewStyle;
}

export function SectionHeader({ title, trailing, style }: SectionHeaderProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, style]} accessibilityRole="header">
      <Text style={[styles.title, { color: colors.text.tertiary }]}>
        {title.toUpperCase()}
      </Text>
      {trailing !== undefined && <View style={styles.trailing}>{trailing}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing[2],
    paddingHorizontal: 0,
  },
  title: {
    fontSize: fontSize.caption,
    fontWeight: '600',
    letterSpacing: 0.8,
  },
  trailing: {
    alignItems: 'flex-end',
  },
});

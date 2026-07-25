/**
 * LunaBloom EmptyState Component
 *
 * Shown when a screen or section has no data yet.
 * Centered layout: icon → title → subtitle → optional action button.
 *
 * Examples:
 *   - "No cycles logged yet" on the Calendar
 *   - "Track 2 cycles to unlock" on Insights
 *   - "No logs for this day" on Daily Log
 */

import { View, Text, StyleSheet, type ViewStyle } from 'react-native';
import { useTheme } from '@/presentation/hooks/useTheme';
import { fontSize, spacing, fontFamily } from '@/design-system';
import { Button } from './Button';

export interface EmptyStateAction {
  label: string;
  onPress: () => void;
}

export interface EmptyStateProps {
  /** Optional icon element above the title */
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  /** Optional primary action button */
  action?: EmptyStateAction;
  /** Optional secondary/ghost action */
  secondaryAction?: EmptyStateAction;
  style?: ViewStyle;
}

export function EmptyState({
  icon,
  title,
  subtitle,
  action,
  secondaryAction,
  style,
}: EmptyStateProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[styles.container, style]}
      accessibilityRole="none"
    >
      {icon !== undefined && (
        <View style={styles.iconContainer}>{icon}</View>
      )}

      <Text style={[styles.title, { color: colors.text.primary }]}>
        {title}
      </Text>

      {subtitle !== undefined && (
        <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
          {subtitle}
        </Text>
      )}

      {action !== undefined && (
        <View style={styles.actions}>
          <Button
            label={action.label}
            onPress={action.onPress}
            variant="primary"
            size="md"
          />
          {secondaryAction !== undefined && (
            <Button
              label={secondaryAction.label}
              onPress={secondaryAction.onPress}
              variant="ghost"
              size="md"
            />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[8],
    paddingVertical: spacing[12],
    gap: spacing[3],
  },
  iconContainer: {
    marginBottom: spacing[2],
    opacity: 0.6,
  },
  title: {
    fontSize: fontSize.heading3,
    fontFamily: fontFamily.semiBold,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSize.body,
    textAlign: 'center',
    lineHeight: fontSize.body * 1.55,
    opacity: 0.8,
  },
  actions: {
    marginTop: spacing[4],
    gap: spacing[2],
    alignItems: 'center',
  },
});

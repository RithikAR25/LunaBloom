/**
 * LunaBloom ErrorState Component
 *
 * Shown when a repository operation fails or network is unavailable.
 * Includes an optional retry button.
 *
 * The component receives the error message as a string (not an Error object)
 * because screens receive error strings from Zustand stores, not raw exceptions.
 */
import { View, Text, StyleSheet, type ViewStyle } from 'react-native';
import { useTheme } from '@/presentation/hooks/useTheme';
import { fontSize, spacing } from '@/design-system';
import { Button } from './Button';

export interface ErrorStateProps {
  /** Short, user-facing error title */
  title?: string;
  /** Detailed error message from the store */
  message: string;
  /** Callback to retry the failed operation */
  onRetry?: () => void;
  retryLabel?: string;
  style?: ViewStyle;
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  retryLabel = 'Try Again',
  style,
}: ErrorStateProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[styles.container, style]}
      accessibilityRole="none"
      accessibilityLiveRegion="assertive"
    >
      {/* Error icon placeholder — replaced with real icon in Phase 4 */}
      <Text style={styles.icon}>⚠️</Text>

      <Text style={[styles.title, { color: colors.text.primary }]}>
        {title}
      </Text>

      <Text style={[styles.message, { color: colors.text.secondary }]}>
        {message}
      </Text>

      {onRetry !== undefined && (
        <View style={styles.action}>
          <Button
            label={retryLabel}
            onPress={onRetry}
            variant="secondary"
            size="md"
          />
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
  icon: {
    fontSize: 40,
    marginBottom: spacing[2],
  },
  title: {
    fontSize: fontSize.heading3,
    fontWeight: '600',
    textAlign: 'center',
  },
  message: {
    fontSize: fontSize.body,
    textAlign: 'center',
    lineHeight: fontSize.body * 1.55,
    opacity: 0.8,
  },
  action: {
    marginTop: spacing[4],
  },
});

/**
 * LunaBloom LoadingState Component
 *
 * Centered activity indicator shown while data is loading.
 * fullScreen=true stretches to fill the parent container.
 */
import { View, ActivityIndicator, Text, StyleSheet, type ViewStyle } from 'react-native';
import { useTheme } from '@/presentation/hooks/useTheme';
import { fontSize, spacing } from '@/design-system';

export interface LoadingStateProps {
  /** Optional descriptive message shown below the spinner */
  message?: string;
  size?: 'small' | 'large';
  /** Custom spinner color — defaults to brand.primary */
  color?: string;
  /** Whether to fill the full parent height */
  fullScreen?: boolean;
  style?: ViewStyle;
  /** Describes what is loading or will happen after loading */
  accessibilityHint?: string;
}

export function LoadingState({
  message,
  size = 'large',
  color,
  fullScreen = true,
  style,
  accessibilityHint,
}: LoadingStateProps) {
  const { colors } = useTheme();
  const spinnerColor = color ?? colors.brand.primary;

  return (
    <View
      style={[styles.container, fullScreen && styles.fullScreen, style]}
      accessibilityRole="none"
      accessibilityLabel={message ?? 'Loading'}
      accessibilityHint={accessibilityHint}
      accessibilityLiveRegion="polite"
    >
      <ActivityIndicator
        size={size}
        color={spinnerColor}
        accessibilityLabel={message ?? 'Loading'}
        accessibilityHint={accessibilityHint}
      />
      {message !== undefined && (
        <Text style={[styles.message, { color: colors.text.secondary }]}>
          {message}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[3],
    padding: spacing[6],
  },
  fullScreen: {
    flex: 1,
  },
  message: {
    fontSize: fontSize.body,
    textAlign: 'center',
  },
});

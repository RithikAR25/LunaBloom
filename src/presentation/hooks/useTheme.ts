/**
 * useTheme — provides the active theme object based on the user's system/app preference.
 * Components import this hook to access all design tokens.
 *
 * Usage:
 *   const { colors, isDark } = useTheme();
 *   <View style={{ backgroundColor: colors.background }} />
 *
 * NOTE: Full implementation in Phase 4 (Settings store with theme preference).
 * For now, returns lightTheme by default during Phase 0–3 development.
 */
import { useColorScheme } from 'react-native';
import { darkTheme, lightTheme } from '@/design-system';
import type { Theme } from '@/design-system';

export function useTheme(): Theme {
  const colorScheme = useColorScheme();
  return colorScheme === 'dark' ? darkTheme : lightTheme;
}

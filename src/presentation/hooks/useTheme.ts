/**
 * useTheme — provides the active theme object based on the user's system/app preference.
 * Components import this hook to access all design tokens.
 *
 * Usage:
 *   const { colors, isDark } = useTheme();
 *   <View style={{ backgroundColor: colors.background }} />
 *
 *
 * Updated to respect the themePreference setting in UserProfile.
 */
import { useColorScheme } from 'react-native';
import { darkTheme, lightTheme } from '@/design-system';
import type { Theme } from '@/design-system';
import { useProfileStore } from '@/presentation/stores/useProfileStore';

export function useTheme(): Theme {
  const colorScheme = useColorScheme();
  const profile = useProfileStore((state) => state.profile);
  
  const themePref = profile?.themePreference || 'SYSTEM';

  if (themePref === 'LIGHT') return lightTheme;
  if (themePref === 'DARK') return darkTheme;
  
  return colorScheme === 'dark' ? darkTheme : lightTheme;
}

import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StyleSheet } from 'react-native';
import { useTheme } from '@/presentation/hooks/useTheme';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { DatabaseProvider } from '@/infrastructure/database/DatabaseProvider';
import { RepositoryProvider } from '@/providers/RepositoryProvider';
import { useProfileStore } from '@/presentation/stores/useProfileStore';
import { useCycleStore } from '@/presentation/stores/useCycleStore';
import { useContentStore } from '@/presentation/stores/useContentStore';
import { LockScreen } from '@/presentation/components/privacy/LockScreen';
import { PrivacyService } from '@/application/services/PrivacyService';
import { NotificationService } from '@/application/services/NotificationService';

import {
  useFonts,
  Quicksand_400Regular,
  Quicksand_500Medium,
  Quicksand_600SemiBold,
  Quicksand_700Bold,
} from '@expo-google-fonts/quicksand';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();



/**
 * AppProviders — wraps the entire app with required providers in the correct order.
 * Order matters:
 * 1. DatabaseProvider — must be first (everything needs DB)
 * 2. RepositoryProvider — needs DB to be ready
 * 3. Data Bootstrap — loads profile + cycles after repositories are injected
 */
function AppProviders({ children }: { children: React.ReactNode }) {
  const loadProfile = useProfileStore((s) => s.loadProfile);
  const loadCycles = useCycleStore((s) => s.loadCycles);
  const loadContent = useContentStore((s) => s.loadContent);

  const profile = useProfileStore((s) => s.profile);
  const cycles = useCycleStore((s) => s.cycles);

  useEffect(() => {
    void loadProfile();
    void loadCycles();
    void loadContent();
    PrivacyService.initialize();
  }, [loadProfile, loadCycles, loadContent]);

  // Sync notifications whenever profile or cycles change
  useEffect(() => {
    if (profile) {
      void NotificationService.syncScheduledNotifications(cycles, profile);
    }
  }, [profile, cycles]);

  return <>{children}</>;
}

/**
 * Root Layout — Entry point for Expo Router.
 *
 * Provider stack (outer → inner):
 *   GestureHandlerRootView
 *     SafeAreaProvider
 *       DatabaseProvider          ← opens SQLite, runs migrations
 *         RepositoryProvider      ← injects concrete repos into Zustand
 *           AppProviders          ← loads initial data
 *             Stack             ← route definitions
 */


function AppContent() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      {/* Boot Screen — handles data loading and redirects */}
      <Stack.Screen name="index" options={{ headerShown: false, animation: 'fade' }} />
        {/* Main tab navigation */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        {/* Onboarding — full screen, no back gesture to tabs */}
        <Stack.Screen
          name="onboarding"
          options={{
            headerShown: false,
            animation: 'fade',
            gestureEnabled: false,
          }}
        />

        {/* Auth / PIN lock — full screen overlay */}
        <Stack.Screen
          name="(auth)"
          options={{
            headerShown: false,
            animation: 'fade',
            gestureEnabled: false,
          }}
        />

        {/* Learn / Education — slides in from right */}
        <Stack.Screen
          name="learn"
          options={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />

      {/* 404 fallback */}
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

/**
 * Root Layout — Entry point for Expo Router.
 */
function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Quicksand_400Regular,
    Quicksand_500Medium,
    Quicksand_600SemiBold,
    Quicksand_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <DatabaseProvider>
          <RepositoryProvider>
            <AppProviders>
              <AppContent />
              <LockScreen />
            </AppProviders>
          </RepositoryProvider>
        </DatabaseProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});

export default RootLayout;

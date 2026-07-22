import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useColorScheme, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DatabaseProvider } from '@/infrastructure/database/DatabaseProvider';
import { RepositoryProvider } from '@/infrastructure/repositories/RepositoryProvider';
import { useProfileStore } from '@/presentation/stores/useProfileStore';
import { useCycleStore } from '@/presentation/stores/useCycleStore';
import { useContentStore } from '@/presentation/stores/useContentStore';

/**
 * NavigationGate — reads profile store and redirects to onboarding if needed.
 * Mounted inside providers so stores are populated before gate logic runs.
 */
function NavigationGate() {
  const router = useRouter();
  const segments = useSegments();

  const profile = useProfileStore((s) => s.profile);
  const profileLoading = useProfileStore((s) => s.isLoading);

  useEffect(() => {
    if (profileLoading) return; // Wait until data is loaded

    const inOnboarding = segments[0] === 'onboarding';
    const onboardingComplete = profile?.onboardingCompleted === true;

    if (!onboardingComplete && !inOnboarding) {
      // First launch or incomplete onboarding → go to onboarding
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      router.replace('/onboarding' as any);
    } else if (onboardingComplete && inOnboarding) {
      // Already onboarded, somehow in onboarding → go to tabs
      router.replace('/(tabs)');
    }
  }, [profile, profileLoading, segments, router]);

  return null;
}

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

  useEffect(() => {
    void loadProfile();
    void loadCycles();
    void loadContent();
  }, [loadProfile, loadCycles, loadContent]);

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
 *             NavigationGate      ← handles onboarding redirect
 *               Stack             ← route definitions
 */
export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <DatabaseProvider>
          <RepositoryProvider>
            <AppProviders>
              <NavigationGate />
              <Stack
                screenOptions={{
                  headerShown: false,
                  animation: 'fade',
                  contentStyle: {
                    backgroundColor: isDark ? '#0C0C14' : '#F8FAFC',
                  },
                }}
              >
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

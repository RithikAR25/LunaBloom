import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

/**
 * Root Layout — _layout.tsx
 *
 * This is the entry point for Expo Router. It:
 * 1. Wraps the app in required providers (GestureHandler, SafeArea)
 * 2. Defines the root navigation stack
 * 3. Will host DatabaseProvider and RepositoryProvider in Phase 5 (database)
 * 4. Will host auth gate logic in Phase 6 (auth/PIN lock)
 *
 * Current milestone: v0.2-foundation — skeleton only, no providers yet.
 */
export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'fade',
            contentStyle: {
              backgroundColor: colorScheme === 'dark' ? '#0C0C14' : '#F8FAFC',
            },
          }}
        >
          {/* Main tab navigation */}
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          {/* Auth / PIN lock — presented as full-screen overlay */}
          <Stack.Screen name="(auth)" options={{ headerShown: false, animation: 'fade' }} />
          {/* Onboarding flow */}
          <Stack.Screen name="onboarding" options={{ headerShown: false, animation: 'slide_from_right' }} />
          {/* Learn / Educational content */}
          <Stack.Screen name="learn" options={{ headerShown: false, animation: 'slide_from_right' }} />
          {/* 404 */}
          <Stack.Screen name="+not-found" />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

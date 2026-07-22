import { Stack } from 'expo-router';

/** Auth route group — PIN lock screen. Implemented in Phase 6. */
export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'fade', gestureEnabled: false }} />
  );
}

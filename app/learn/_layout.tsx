import { Stack } from 'expo-router';

/** Learn / Education route group. Implemented in Phase 3. */
export default function LearnLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }} />
  );
}

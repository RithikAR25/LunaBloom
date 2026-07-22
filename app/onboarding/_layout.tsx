import { Stack } from 'expo-router';

/**
 * Onboarding layout — a nested stack with no back gesture.
 * Users flow forward through steps; cannot swipe back to tabs.
 * Each step is a separate route for correct navigation history.
 */
export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: false,
      }}
    />
  );
}

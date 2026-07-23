import { Stack } from 'expo-router';
import { useTheme } from '../../src/presentation/hooks/useTheme';

export default function LearnLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text.primary,
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerShadowVisible: false,
        animation: 'slide_from_right'
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Learn',
        }} 
      />
      <Stack.Screen 
        name="[phase]" 
        options={{ 
          title: 'Phase Details',
        }} 
      />
      <Stack.Screen 
        name="glossary" 
        options={{ 
          title: 'Glossary',
        }} 
      />
    </Stack>
  );
}

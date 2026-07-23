import { Stack } from 'expo-router';
import { useTheme } from '../../src/presentation/hooks/useTheme';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function SettingsLayout() {
  const { colors } = useTheme();
  const router = useRouter();

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
        animation: 'slide_from_right',
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 8, marginRight: 16 }}>
            <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        ),
      }}
    >
      <Stack.Screen
        name="profile"
        options={{
          title: 'Profile',
        }}
      />
      <Stack.Screen
        name="cycle"
        options={{
          title: 'Cycle Info',
        }}
      />
      <Stack.Screen
        name="health"
        options={{
          title: 'Health & Goals',
        }}
      />
    </Stack>
  );
}

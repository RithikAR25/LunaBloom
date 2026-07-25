import { Stack , useRouter } from 'expo-router';
import { useTheme } from '../../src/presentation/hooks/useTheme';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fontFamily } from '@/design-system';

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
          fontFamily: fontFamily.semiBold,
        },
        headerShadowVisible: false,
        animation: 'slide_from_right',
        headerLeft: () => (
          <TouchableOpacity accessibilityRole="button" onPress={() => router.back()} style={{ marginLeft: 8, marginRight: 16 }}>
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
      <Stack.Screen
        name="privacy"
        options={{
          title: 'Privacy & PIN',
        }}
      />
      <Stack.Screen
        name="notifications"
        options={{
          title: 'Notifications',
        }}
      />
      <Stack.Screen
        name="data"
        options={{
          title: 'Data Management',
        }}
      />
    </Stack>
  );
}

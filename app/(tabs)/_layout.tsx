import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/presentation/hooks/useTheme';
import { fontFamily, fontSize } from '@/design-system';

/**
 * Tab Navigator Layout
 * Defines the 5 bottom tabs: Home, Calendar, Log, Insights, Settings
 *
 * Current milestone: v0.2-foundation — tab shell with placeholder screens.
 * Actual screen content implemented in later phases.
 */
export default function TabLayout() {
  const { colors } = useTheme();

  const activeColor = colors.brand.primary;
  const inactiveColor = colors.text.tertiary;
  const backgroundColor = colors.surface;
  const borderColor = colors.borderSubtle;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarStyle: {
          backgroundColor,
          borderTopColor: borderColor,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontSize: fontSize.tabLabel,
          fontFamily: fontFamily.medium,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
          tabBarAccessibilityLabel: 'Home tab — Dashboard and cycle overview',
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
          tabBarAccessibilityLabel: 'Calendar tab — View your cycle on a calendar',
        }}
      />
      <Tabs.Screen
        name="log"
        options={{
          title: 'Log',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle-outline" size={size} color={color} />
          ),
          tabBarAccessibilityLabel: 'Log tab — Record your daily symptoms and mood',
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: 'Insights',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bar-chart-outline" size={size} color={color} />
          ),
          tabBarAccessibilityLabel: 'Insights tab — View your health trends and patterns',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
          tabBarAccessibilityLabel: 'Settings tab — App preferences and privacy',
        }}
      />
    </Tabs>
  );
}

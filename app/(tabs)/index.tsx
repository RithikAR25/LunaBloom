import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/presentation/hooks/useTheme';

/**
 * Dashboard Screen (Home Tab)
 * Route: / (tabs)/index
 *
 * Milestone: v0.2-foundation — placeholder screen
 * Full implementation: Phase 2 (Dashboard)
 */
export default function HomeScreen() {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.heading, { color: colors.text.primary }]}>LunaBloom</Text>
        <Text style={[styles.subheading, { color: colors.text.secondary }]}>
          Dashboard — coming in Phase 2
        </Text>
        <View style={[styles.badge, { backgroundColor: colors.brand.primary }]}>
          <Text style={[styles.badgeText, { color: colors.text.inverse }]}>
            v0.2 Foundation
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 16,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  subheading: {
    fontSize: 15,
    fontWeight: '400',
  },
  badge: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
});

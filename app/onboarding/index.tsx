import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/presentation/hooks/useTheme';

/**
 * Onboarding Step 1 — Welcome screen.
 * Placeholder: full UI implemented in Phase 2 after Stitch design review.
 * See: docs/ui-prompts/06_onboarding.md
 */
export default function OnboardingWelcomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.logo, { color: colors.brand.primary }]}>◑</Text>
        <Text style={[styles.title, { color: colors.text.primary }]}>Welcome to LunaBloom</Text>
        <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
          Your private space to understand your cycle and body.
        </Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.brand.primary }]}
          onPress={() => router.push('/onboarding/name')}
          accessibilityRole="button"
          accessibilityLabel="Get started with LunaBloom"
        >
          <Text style={[styles.buttonText, { color: colors.text.inverse }]}>Get Started</Text>
        </TouchableOpacity>
      </View>
      <Text style={[styles.placeholder, { color: colors.text.tertiary }]}>
        Placeholder — Stitch UI in Phase 2
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 16 },
  logo: { fontSize: 64 },
  title: { fontSize: 28, fontWeight: '700', textAlign: 'center', letterSpacing: -0.5 },
  subtitle: { fontSize: 15, textAlign: 'center', lineHeight: 24 },
  button: { marginTop: 24, paddingHorizontal: 40, paddingVertical: 16, borderRadius: 9999 },
  buttonText: { fontSize: 16, fontWeight: '600' },
  placeholder: { textAlign: 'center', fontSize: 12, paddingBottom: 24 },
});

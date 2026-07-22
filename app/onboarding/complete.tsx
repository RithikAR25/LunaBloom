import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/presentation/hooks/useTheme';

/** Onboarding Step — You're all set!. Placeholder: full UI in Phase 2. See docs/ui-prompts/06_onboarding.md */
export default function Onboarding_completeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text.primary }]}>You're all set!</Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.brand.primary }]}
          onPress={() => router.replace('/(tabs)' as never)}
          accessibilityRole="button"
        >
          <Text style={[styles.buttonText, { color: colors.text.inverse }]}>Go to Dashboard</Text>
        </TouchableOpacity>
      </View>
      <Text style={[styles.placeholder, { color: colors.text.tertiary }]}>Placeholder — Stitch UI in Phase 2</Text>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 24 },
  title: { fontSize: 22, fontWeight: '700', textAlign: 'center' },
  button: { paddingHorizontal: 40, paddingVertical: 16, borderRadius: 9999 },
  buttonText: { fontSize: 16, fontWeight: '600' },
  placeholder: { textAlign: 'center', fontSize: 12, paddingBottom: 24 },
});

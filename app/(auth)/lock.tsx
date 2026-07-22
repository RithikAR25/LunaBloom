import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/presentation/hooks/useTheme';

/** PIN Lock Screen — implemented in Phase 6. See docs/ui-prompts/08_pin-lock.md */
export default function PINLockScreen() {
  const { colors } = useTheme();
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text.primary }]}>App Locked</Text>
        <Text style={[styles.sub, { color: colors.text.secondary }]}>PIN Lock — Phase 6</Text>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  title: { fontSize: 22, fontWeight: '700' },
  sub: { fontSize: 15 },
});

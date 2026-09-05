import { Link, Stack } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/presentation/hooks/useTheme';
import { useScaling } from '@/design-system';

export default function NotFoundScreen() {
  const { colors } = useTheme();
  const { scale } = useScaling();
  return (
    <>
      <Stack.Screen options={{ title: 'Not Found' }} />
      <View style={[styles.container, { backgroundColor: colors.background, padding: scale(20) }]}>
        <Text style={[styles.title, { color: colors.text.primary, fontSize: scale(20) }]}>
          This screen doesn&apos;t exist.
        </Text>
        <Link href="/" style={[styles.link, { color: colors.text.link, marginTop: scale(16), fontSize: scale(15) }]}>
          <Text>Go to home screen</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontWeight: '600' },
  link: { },
});

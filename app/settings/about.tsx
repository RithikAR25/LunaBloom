import { View, StyleSheet, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { useTheme } from '../../src/presentation/hooks/useTheme';
import { spacing, fontSize, lineHeight } from '@/design-system';
import { Heading } from '../../src/presentation/components/ui/Heading';
import { Text } from '../../src/presentation/components/ui/Text';
import { SettingsSection } from '../../src/presentation/components/settings/SettingsSection';

export default function AboutScreen() {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen 
        options={{ 
          title: 'About LunaBloom',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text.primary,
          headerShadowVisible: false,
        }} 
      />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        
        <View style={styles.header}>
          <Heading level="h1" style={{ color: colors.text.primary, textAlign: 'center' }}>
            LunaBloom
          </Heading>
          <Text variant="body" style={{ color: colors.text.secondary, textAlign: 'center', marginTop: spacing[2] }}>
            Version 1.0.0
          </Text>
        </View>

        <SettingsSection title="Our Mission">
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <Text variant="body" style={{ color: colors.text.primary, lineHeight: fontSize.bodyMd * lineHeight.normal }}>
              LunaBloom is a privacy-first cycle tracking application designed to help you understand your body better. We believe that your health data belongs to you and you alone. That&apos;s why LunaBloom operates entirely offline—your cycle data never leaves your device unless you explicitly export it.
            </Text>
          </View>
        </SettingsSection>

        <SettingsSection title="Key Features">
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <Text variant="body" weight="bold" style={{ color: colors.brand.primary, marginBottom: spacing[2] }}>
              🔒 100% Private
            </Text>
            <Text variant="body" style={{ color: colors.text.primary, marginBottom: spacing[4] }}>
              No cloud accounts, no tracking pixels, and no sharing of your personal data.
            </Text>

            <Text variant="body" weight="bold" style={{ color: colors.brand.secondary, marginBottom: spacing[2] }}>
              📖 Educational Insights
            </Text>
            <Text variant="body" style={{ color: colors.text.primary, marginBottom: spacing[4] }}>
              Learn Mode explains the &quot;why&quot; behind your symptoms and cycle phases, empowering you with knowledge.
            </Text>

            <Text variant="body" weight="bold" style={{ color: colors.text.primary, marginBottom: spacing[2] }}>
              📁 Data Portability
            </Text>
            <Text variant="body" style={{ color: colors.text.primary }}>
              Easily export and import your encrypted backup files to seamlessly transfer your data to a new device.
            </Text>
          </View>
        </SettingsSection>

        <SettingsSection title="Legal">
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <Text variant="caption" style={{ color: colors.text.secondary, lineHeight: fontSize.caption * lineHeight.normal }}>
              Medical Disclaimer: LunaBloom is designed for informational and tracking purposes only. It is not intended to provide medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider with any questions you may have regarding a medical condition.
              {'\n\n'}
              © 2026 LunaBloom. All rights reserved.
            </Text>
          </View>
        </SettingsSection>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing[4],
    paddingBottom: spacing[8],
  },
  header: {
    alignItems: 'center',
    marginVertical: spacing[8],
  },
  card: {
    padding: spacing[4],
    borderRadius: spacing[3],
  }
});

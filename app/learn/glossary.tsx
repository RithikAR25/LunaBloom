import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useTheme } from '../../src/presentation/hooks/useTheme';
import { spacing, borderRadius } from '@/design-system';
import { Text } from '../../src/presentation/components/ui/Text';
import { Heading } from '../../src/presentation/components/ui/Heading';
import { useContentStore } from '../../src/presentation/stores/useContentStore';
import { MedicalDisclaimer } from '../../src/presentation/components/learn/MedicalDisclaimer';

export default function GlossaryScreen() {
  const { colors } = useTheme();
  
  const glossary = useContentStore((state) => state.glossary);
  const isLoading = useContentStore((state) => state.isLearnContentLoading);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: spacing[4],
    },
    header: {
      marginBottom: spacing[6],
    },
    title: {
      color: colors.text.primary,
      marginBottom: spacing[2],
    },
    subtitle: {
      color: colors.text.secondary,
      lineHeight: 24,
    },
    termContainer: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.md,
      padding: spacing[4],
      marginBottom: spacing[2],
      borderWidth: 1,
      borderColor: colors.border,
    },
    termText: {
      color: colors.brand.primary,
      marginBottom: spacing[1],
    },
    defText: {
      color: colors.text.secondary,
      lineHeight: 22,
    },
    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  if (isLoading && !glossary) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.brand.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Heading level="h1" style={styles.title}>Medical Glossary</Heading>
        <Text variant="body" style={styles.subtitle}>
          Plain-language definitions for common medical terms used throughout the app.
        </Text>
      </View>

      {glossary?.map((item) => (
        <View key={item.term} style={styles.termContainer}>
          <Text variant="body" weight="bold" style={styles.termText}>{item.term}</Text>
          <Text variant="body" style={styles.defText}>{item.definition}</Text>
        </View>
      ))}

      <MedicalDisclaimer />
    </ScrollView>
  );
}

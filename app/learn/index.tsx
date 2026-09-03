import { View, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/presentation/hooks/useTheme';
import { spacing, borderRadius, fontSize, lineHeight } from '@/design-system';
import { Text } from '../../src/presentation/components/ui/Text';
import { Heading } from '../../src/presentation/components/ui/Heading';
import { useContentStore } from '../../src/presentation/stores/useContentStore';
import { useEffect } from 'react';
import { PhaseCard } from '../../src/presentation/components/learn/PhaseCard';
import { Ionicons } from '@expo/vector-icons';
import { PhaseIdentifier } from '../../src/domain/repositories/IContentRepository';

export default function LearnHomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  
  const loadLearnContent = useContentStore((state) => state.loadLearnContent);
  const learnContent = useContentStore((state) => state.learnContent);
  const isLoading = useContentStore((state) => state.isLearnContentLoading);
  const error = useContentStore((state) => state.error);

  useEffect(() => {
    loadLearnContent();
  }, [loadLearnContent]);

  const handlePhasePress = (phaseId: PhaseIdentifier) => {
    router.push(`/learn/${phaseId}` as any);
  };

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
      lineHeight: fontSize.bodyMd * lineHeight.normal,
    },
    glossaryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.surface,
      padding: spacing[4],
      borderRadius: borderRadius.md,
      marginTop: spacing[4],
      borderWidth: 1,
      borderColor: colors.border,
    },
    glossaryTextContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    glossaryText: {
      color: colors.text.primary,
      marginLeft: spacing[2],
    },
    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing[8],
    },
    errorText: {
      color: colors.semantic.error,
      textAlign: 'center',
      marginTop: spacing[4],
    },
  });

  if (isLoading && !learnContent) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.brand.primary} />
      </View>
    );
  }

  if (error && !learnContent) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.semantic.error} />
        <Text variant="body" style={styles.errorText}>Failed to load content. Please try again later.</Text>
      </View>
    );
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Heading level="h1" style={styles.title}>Learn</Heading>
        <Text variant="body" style={styles.subtitle}>
          Understand the biology, symptoms, and best practices for every phase of your cycle.
        </Text>
      </View>

      {learnContent?.map((phase) => (
        <PhaseCard
          key={phase.id}
          id={phase.id}
          name={phase.name}
          tagline={phase.tagline}
          onPress={() => handlePhasePress(phase.id)}
        />
      ))}

      <Pressable accessibilityRole="button" 
        style={styles.glossaryButton}
        onPress={() => router.push('/learn/glossary' as any)}
      >
        <View style={styles.glossaryTextContainer}>
          <Ionicons name="book-outline" size={20} color={colors.brand.primary} />
          <Text variant="body" weight="bold" style={styles.glossaryText}>Medical Glossary</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
      </Pressable>
    </ScrollView>
  );
}

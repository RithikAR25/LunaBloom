import { useState } from 'react';
import { View, StyleSheet, ScrollView, Switch } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useTheme } from '../../src/presentation/hooks/useTheme';
import { spacing, borderRadius } from '@/design-system';
import { Text } from '../../src/presentation/components/ui/Text';
import { Heading } from '../../src/presentation/components/ui/Heading';
import { useContentStore } from '../../src/presentation/stores/useContentStore';
import { ContentSection } from '../../src/presentation/components/learn/ContentSection';
import { MedicalDisclaimer } from '../../src/presentation/components/learn/MedicalDisclaimer';

export default function PhaseDetailsScreen() {
  const { phase } = useLocalSearchParams<{ phase: string }>();
  const { colors } = useTheme();
  
  const [isLearnMode, setIsLearnMode] = useState(false);
  const learnContent = useContentStore((state) => state.learnContent);
  
  const phaseData = learnContent?.find(p => p.id === phase);

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
    tagline: {
      color: colors.text.secondary,
      lineHeight: 24,
    },
    learnModeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.surface,
      padding: spacing[4],
      borderRadius: borderRadius.md,
      marginBottom: spacing[4],
      borderWidth: 1,
      borderColor: colors.border,
    },
    learnModeText: {
      color: colors.text.primary,
    },
    center: {
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  if (!phaseData) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text variant="body" style={{ color: colors.text.primary }}>Phase not found.</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: phaseData.name }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Heading level="h1" style={styles.title}>{phaseData.name}</Heading>
          <Text variant="body" style={styles.tagline}>{phaseData.tagline}</Text>
        </View>

        <View style={styles.learnModeContainer}>
          <Text variant="caption" weight="bold" style={styles.learnModeText}>Detailed Learn Mode</Text>
          <Switch 
            value={isLearnMode} 
            onValueChange={setIsLearnMode}
            trackColor={{ false: 'rgba(0,0,0,0.1)', true: colors.brand.primary }}
            thumbColor={'#fff'}
          />
        </View>

        <ContentSection 
          section={phaseData.biology} 
          iconName="body-outline" 
          showDetails={isLearnMode} 
        />
        <ContentSection 
          section={phaseData.symptoms} 
          iconName="thermometer-outline" 
          showDetails={isLearnMode} 
        />
        <ContentSection 
          section={phaseData.whatToExpect} 
          iconName="eye-outline" 
          showDetails={isLearnMode} 
        />
        <ContentSection 
          section={phaseData.nutrition} 
          iconName="restaurant-outline" 
          showDetails={isLearnMode} 
        />
        <ContentSection 
          section={phaseData.exercise} 
          iconName="fitness-outline" 
          showDetails={isLearnMode} 
        />
        <ContentSection 
          section={phaseData.selfCare} 
          iconName="heart-outline" 
          showDetails={isLearnMode} 
        />

        <MedicalDisclaimer />
      </ScrollView>
    </>
  );
}

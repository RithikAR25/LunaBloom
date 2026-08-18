import { useState, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { useTheme } from '@/presentation/hooks/useTheme';
import { spacing, borderRadius } from '@/design-system';
import { Text } from '@/presentation/components/ui/Text';
import { Heading } from '@/presentation/components/ui/Heading';
import { useInsightsStore } from '@/presentation/stores/useInsightsStore';
import { InsightsEmptyState } from '@/presentation/components/insights/InsightsEmptyState';
import { OverviewTab } from '@/presentation/components/insights/OverviewTab';
import { CycleTab } from '@/presentation/components/insights/CycleTab';
import { BodyAndMoodTab } from '@/presentation/components/insights/BodyAndMoodTab';
import { PatternsTab } from '@/presentation/components/insights/PatternsTab';

type Tab = 'Overview' | 'Cycle' | 'Body & Mood' | 'Patterns';
const TABS: Tab[] = ['Overview', 'Cycle', 'Body & Mood', 'Patterns'];

export default function InsightsScreen() {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<Tab>('Overview');
  
  const { 
    cycleStats, symptomTrends, moodTrends, wellbeingTrends, patternInsights,
    isLoading, error, loadInsights 
  } = useInsightsStore();

  useFocusEffect(
    useCallback(() => {
      loadInsights();
    }, [loadInsights])
  );

  const determineEmptyState = () => {
    if (!cycleStats) return 'no-cycles';
    if (cycleStats.averageCycleLength === null) return 'no-cycles';
    if (cycleStats.cycleLengthTrend === 'UNKNOWN') return 'insufficient-cycles';
    
    // Check if there are any symptoms or wellbeing data
    const hasLogs = symptomTrends?.some(t => t.topSymptoms.length > 0) || 
                   wellbeingTrends?.some(w => w.metrics.painSampleCount > 0);
                   
    if (!hasLogs && activeTab === 'Body & Mood') {
      return 'no-logs';
    }
    
    return null;
  };

  const emptyState = determineEmptyState();

  const renderContent = () => {
    if (isLoading && !cycleStats) {
      return (
        <View style={styles.center} accessible={true} accessibilityLabel="Loading insights..." accessibilityHint="Wait while your data is being processed">
          <ActivityIndicator size="large" color={colors.brand.primary} />
        </View>
      );
    }
    if (error) {
      return (
        <View style={styles.center} accessible={true} accessibilityLabel={`Error loading insights: ${error}`} accessibilityHint="Pull down to refresh and try again">
          <Text style={{ color: colors.semantic.error }}>{error}</Text>
        </View>
      );
    }

    if (emptyState === 'no-cycles') {
      return <InsightsEmptyState scenario={emptyState} />;
    }
    
    // If we're on Body & Mood and there's no logs, show empty state for logs
    if (emptyState === 'no-logs') {
      return <InsightsEmptyState scenario={emptyState} />;
    }

    switch (activeTab) {
      case 'Overview':
        return emptyState === 'insufficient-cycles' ? (
          <InsightsEmptyState scenario="insufficient-cycles" />
        ) : (
          <OverviewTab stats={cycleStats!} />
        );
      case 'Cycle':
        return <CycleTab stats={cycleStats!} />;
      case 'Body & Mood':
        return <BodyAndMoodTab trends={symptomTrends!} wellbeing={wellbeingTrends!} moods={moodTrends!} />;
      case 'Patterns':
        return patternInsights
          ? <PatternsTab patterns={patternInsights} />
          : <InsightsEmptyState scenario="no-patterns" />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Heading level="h2" style={{ color: colors.text.primary }} accessibilityRole="header">Insights</Heading>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0 }}
        contentContainerStyle={styles.tabBar} 
        accessibilityRole="tablist"
      >
        {TABS.map(tab => {
          const isActive = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tabButton,
                isActive && { backgroundColor: colors.brand.primary, borderColor: colors.brand.primary },
                !isActive && { backgroundColor: colors.surface, borderColor: colors.border }
              ]}
              onPress={() => setActiveTab(tab)}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
            >
              <Text variant="label" weight="medium" style={{ color: isActive ? '#fff' : colors.text.secondary }}>
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.content}>
        {renderContent()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tabBar: {
    flexDirection: 'row',
    padding: spacing.sm,
    gap: spacing.xs,
  },
  tabButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.DEFAULT,
    borderWidth: 1,
  },
  content: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
});

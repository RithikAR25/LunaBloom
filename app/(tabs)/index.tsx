import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useCycleStore } from '../../src/presentation/stores/useCycleStore';
import { useDailyLogStore } from '../../src/presentation/stores/useDailyLogStore';
import { useProfileStore } from '../../src/presentation/stores/useProfileStore';
import { useTheme } from '../../src/presentation/hooks/useTheme';
import { spacing } from '../../src/design-system';
import { Text } from '../../src/presentation/components/ui/Text';
import { Heading } from '../../src/presentation/components/ui/Heading';
import { CyclePhaseHeroCard } from '../../src/presentation/components/dashboard/CyclePhaseHeroCard';
import { QuickActionButton } from '../../src/presentation/components/dashboard/QuickActionButton';
import { TodayLogCard } from '../../src/presentation/components/dashboard/TodayLogCard';
import { HealthTipCard } from '../../src/presentation/components/dashboard/HealthTipCard';
import { CycleHistoryChart } from '../../src/presentation/components/dashboard/CycleHistoryChart';
import healthTips from '../../assets/data/healthTips.json';
import { useState, useEffect } from 'react';

export default function DashboardScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  
  const { profile } = useProfileStore();
  const { activeCycle, cycles, loadCycles } = useCycleStore();
  const { currentLog, loadLogForDate } = useDailyLogStore();

  const todayStr = new Date().toISOString().split('T')[0] || '';

  // Calculate cycleDay and currentPhase locally
  const cycleDay = activeCycle ? Math.floor((new Date(todayStr).getTime() - new Date(activeCycle.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1 : null;
  const currentPhase = activeCycle ? (cycleDay && cycleDay <= (profile?.avgPeriodDuration || 5) ? 'MENSTRUAL' : cycleDay && cycleDay <= 14 ? 'FOLLICULAR' : cycleDay && cycleDay <= 17 ? 'OVULATORY' : 'LUTEAL') : null;

  useEffect(() => {
    loadLogForDate(todayStr);
  }, [todayStr, loadLogForDate]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCycles();
    await loadLogForDate(todayStr);
    setRefreshing(false);
  };

  const getPhaseDetails = () => {
    switch (currentPhase) {
      case 'MENSTRUAL': return { name: 'Menstrual Phase', icon: 'drop', color: colors.phase.menstrual, tipCategory: 'MENSTRUAL' };
      case 'FOLLICULAR': return { name: 'Follicular Phase', icon: 'leaf', color: colors.phase.follicular, tipCategory: 'FOLLICULAR' };
      case 'OVULATORY': return { name: 'Ovulatory Phase', icon: 'sun', color: colors.phase.ovulatory, tipCategory: 'OVULATORY' };
      case 'LUTEAL': return { name: 'Luteal Phase', icon: 'moon', color: colors.phase.luteal, tipCategory: 'LUTEAL' };
      default: return { name: 'Unknown Phase', icon: 'help-circle', color: colors.text.secondary, tipCategory: 'GENERAL' };
    }
  };

  const phaseDetails = getPhaseDetails() as any;
  
  // Select a random tip for today based on phase
  // Using today's day to deterministically select the tip so it doesn't jump around on every render
  const todayDayOfMonth = new Date().getDate();
  const phaseTips = (healthTips as any)[phaseDetails.tipCategory] || [];
  const selectedTip = phaseTips.length > 0 ? phaseTips[todayDayOfMonth % phaseTips.length] : 'Stay hydrated and listen to your body.';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Sticky Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing[4] }]}>
        <View>
          <Text variant="caption" style={{ color: colors.text.secondary }}>
            Good morning,
          </Text>
          <Heading level="h2" style={{ color: colors.text.primary }}>
            {profile?.preferredName || 'Beautiful'}
          </Heading>
        </View>
        <View style={styles.headerRight}>
          <Feather name="bell" size={24} color={colors.text.primary} accessibilityLabel="Notifications" />
          <View style={[styles.avatarPlaceholder, { backgroundColor: colors.surface }]} />
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand.primary} />}
      >
        {!activeCycle && cycles.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
            <Heading level="h3" style={{ color: colors.text.primary, marginBottom: spacing[2] }}>
              Welcome to LunaBloom
            </Heading>
            <Text variant="body" style={{ color: colors.text.secondary, textAlign: 'center', marginBottom: spacing[4] }}>
              Log your first period to begin tracking your cycle and receiving personalized insights.
            </Text>
          </View>
        ) : (
          <CyclePhaseHeroCard
            phaseName={phaseDetails.name}
            phaseIcon={phaseDetails.icon as any}
            phaseColor={phaseDetails.color}
            cycleDay={cycleDay || 1}
            totalDays={profile?.avgCycleLength || 28}
            periodCountdown={currentPhase === 'LUTEAL' && cycleDay ? (profile?.avgCycleLength || 28) - cycleDay : null}
          />
        )}

        <View style={styles.quickActionsContainer}>
          <View style={styles.quickActionsRow}>
            {activeCycle ? (
              <QuickActionButton
                label="End Period"
                icon="x-circle"
                color={colors.phase.menstrual}
                onPress={() => {}}
              />
            ) : (
              <QuickActionButton
                label="Start Period"
                icon="droplet"
                color={colors.phase.menstrual}
                onPress={() => {}}
              />
            )}
            <QuickActionButton
              label="Log Today"
              icon="edit-3"
              color={colors.brand.primary}
              onPress={() => router.push('/log')}
            />
          </View>
          <View style={styles.quickActionsRow}>
            <QuickActionButton
              label="Add Note"
              icon="file-text"
              color={colors.brand.secondary}
              onPress={() => {}}
            />
            <QuickActionButton
              label="Log Intimacy"
              icon="heart"
              color={colors.text.secondary} // Changed from colors.error
              onPress={() => {}}
            />
          </View>
        </View>

        <View style={styles.section}>
          <TodayLogCard 
            log={currentLog} 
            onEdit={() => router.push('/log')} 
          />
        </View>

        <View style={styles.section}>
          <HealthTipCard 
            tip={selectedTip}
            onLearnMore={() => {}}
          />
        </View>

        <View style={styles.section}>
          <CycleHistoryChart cycles={cycles} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[4],
    zIndex: 10,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  scrollContent: {
    padding: spacing[4],
    gap: spacing[4],
  },
  emptyState: {
    padding: spacing[6],
    borderRadius: 16,
    alignItems: 'center',
  },
  quickActionsContainer: {
    gap: spacing[3],
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  section: {
    marginTop: spacing[2],
  },
});

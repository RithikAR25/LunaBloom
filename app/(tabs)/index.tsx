import { View, StyleSheet, ScrollView, RefreshControl, Pressable, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useCycleStore } from '../../src/presentation/stores/useCycleStore';
import { useDailyLogStore } from '../../src/presentation/stores/useDailyLogStore';
import { useProfileStore } from '../../src/presentation/stores/useProfileStore';
import { useTheme } from '../../src/presentation/hooks/useTheme';
import { spacing, borderRadius, fontFamily } from '../../src/design-system';
import { Text } from '../../src/presentation/components/ui/Text';
import { Heading } from '../../src/presentation/components/ui/Heading';
import { MinimalCycleHero } from '../../src/presentation/components/dashboard/MinimalCycleHero';
import { GridActionButton } from '../../src/presentation/components/dashboard/GridActionButton';
import { TodayLogCard } from '../../src/presentation/components/dashboard/TodayLogCard';
import { HealthTipCard } from '../../src/presentation/components/dashboard/HealthTipCard';
import { CycleHistoryChart } from '../../src/presentation/components/dashboard/CycleHistoryChart';
import { useContentStore } from '../../src/presentation/stores/useContentStore';
import { ValidationService } from '../../src/domain/services/ValidationService';
import { PredictionEngine } from '../../src/domain/prediction';
import { ConfirmModal } from '../../src/presentation/components/ui/ConfirmModal';
import { useState, useMemo, useCallback } from 'react';

export default function DashboardScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  
  const [shortCycleWarningVisible, setShortCycleWarningVisible] = useState(false);
  const [pendingStartDate, setPendingStartDate] = useState<string | null>(null);

  const { profile } = useProfileStore();
  const { cycles, loadCycles } = useCycleStore();
  const { currentLog, loadLogForDate } = useDailyLogStore();
  const { healthTips } = useContentStore();

  const todayStr = new Date().toISOString().split('T')[0] || '';

  const { timelineData, engine } = useMemo(() => {
    const engine = new PredictionEngine();
    
    const avgCycleLength = profile?.avgCycleLength || 28;
    const avgPeriodDuration = profile?.avgPeriodDuration || 5;

    const timelineData = engine.generateTimeline(cycles, avgCycleLength, avgPeriodDuration, todayStr);
    
    return { timelineData, engine };
  }, [cycles, profile, todayStr]);

  const latestCycle = useMemo(() => {
    if (cycles.length === 0) return null;
    return [...cycles].sort((a,b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())[0];
  }, [cycles]);

  const phaseInfo = useMemo(() => {
    if (cycles.length === 0) return null;
    return engine.getPhaseForDate(todayStr, timelineData);
  }, [timelineData, todayStr, cycles, engine]);

  const currentPhase = phaseInfo ? phaseInfo.phase : null;
  const avgCycleLength = profile?.avgCycleLength || 28;
  const displayCycleLength = timelineData.dashboardInfo?.predictedCycleLength ?? avgCycleLength;
  const cycleDay = phaseInfo ? phaseInfo.cycleDay : null;

  useFocusEffect(
    useCallback(() => {
      loadLogForDate(todayStr);
    }, [todayStr, loadLogForDate])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCycles();
    await loadLogForDate(todayStr);
    setRefreshing(false);
  };

  const getPhaseDetails = () => {
    switch (currentPhase) {
      case 'MENSTRUAL': return { name: phaseInfo?.fertilityStatus === 'fertile' || phaseInfo?.fertilityStatus === 'possible' ? 'Menstrual (Possible Fertility)' : 'Menstrual Phase', icon: 'droplet', color: colors.phase.menstrual, tipCategory: 'MENSTRUAL' };
      case 'FOLLICULAR': return { name: 'Follicular Phase', icon: 'leaf', color: colors.phase.follicular, tipCategory: 'FOLLICULAR' };
      case 'OVULATION': return { name: 'Ovulatory Phase', icon: 'sun', color: colors.phase.ovulatory, tipCategory: 'OVULATORY' };
      case 'LUTEAL': return { name: 'Luteal Phase', icon: 'moon', color: colors.phase.luteal, tipCategory: 'LUTEAL' };
      default: return { name: '', icon: 'calendar', color: colors.text.secondary, tipCategory: 'GENERAL' };
    }
  };

  const phaseDetails = getPhaseDetails() as any;
  
  // Select a random tip for today based on phase
  // Using today's day to deterministically select the tip so it doesn't jump around on every render
  const todayDayOfMonth = new Date().getDate();
  const phaseTips = healthTips ? healthTips[phaseDetails.tipCategory] || [] : [];
  const selectedTip = (phaseTips.length > 0 ? phaseTips[todayDayOfMonth % phaseTips.length] : 'Stay hydrated and listen to your body.') ?? 'Stay hydrated and listen to your body.';

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning,';
    if (hour < 18) return 'Good afternoon,';
    return 'Good evening,';
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Sticky Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <View>
          <Text style={{ fontFamily: fontFamily.headingBold, fontSize: 28, color: colors.brand.primary, lineHeight: 32 }}>
            {getGreeting()}
          </Text>
          <Text style={{ fontFamily: fontFamily.headingBold, fontSize: 24, color: colors.brand.primary, opacity: 0.8 }}>
            {profile?.preferredName || 'Beautiful'}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <Pressable accessibilityRole="button" onPress={() => router.push('/settings/notifications')}>
            <Feather name="bell" size={22} color={colors.brand.primary} accessibilityLabel="Notifications" accessibilityHint="View your recent notifications" />
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => router.push('/settings/profile')}>
            <Feather name="user" size={24} color={colors.brand.primary} accessibilityLabel="Profile" accessibilityHint="View and edit your profile settings" />
          </Pressable>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand.primary} />}
      >
        {!latestCycle ? (
          <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
            <Heading level="h3" style={{ color: colors.text.primary, marginBottom: spacing.sm }}>
              Welcome to LunaBloom
            </Heading>
            <Text variant="body" style={{ color: colors.text.secondary, textAlign: 'center', marginBottom: spacing.md }}>
              Log your first period to begin tracking your cycle and receiving personalized insights.
            </Text>
          </View>
        ) : (
          <Pressable accessibilityRole="button" 
            onPress={() => {
              if (currentPhase) {
                router.push(`/learn/${currentPhase.toLowerCase()}` as any);
              } else {
                router.push('/learn');
              }
            }}
          >
            <MinimalCycleHero
              phaseName={phaseDetails.name}
              cycleDay={cycleDay || 1}
              cycleLength={displayCycleLength}
              periodCountdown={
                timelineData.dashboardInfo?.daysUntilNextPeriod !== undefined && 
                timelineData.dashboardInfo.daysUntilNextPeriod !== null && 
                timelineData.dashboardInfo.daysUntilNextPeriod >= 0 
                  ? timelineData.dashboardInfo.daysUntilNextPeriod 
                  : null
              }
              confidence={timelineData.dashboardInfo?.confidence ?? null}
              isMenstruating={currentPhase === 'MENSTRUAL'}
            />
          </Pressable>
        )}

        <View style={styles.quickActionsContainer}>
          <View style={styles.quickActionsRow}>
            <GridActionButton
              label="Start Period"
              icon="droplet"
              variant="secondary"
              onPress={async () => {
                const validationService = new ValidationService();
                const warnings = validationService.getWarnings(todayStr, null, cycles);
                const isShortCycle = warnings.some(w => w.code === 'SHORT_CYCLE');

                const performStart = async () => {
                  try {
                    await useCycleStore.getState().startPeriod(todayStr);
                  } catch (err: any) {
                    const isAlreadyActive = err.message.includes('already tracking');
                    Alert.alert(
                      isAlreadyActive ? 'Active Period' : 'Notice',
                      err.message,
                      [{ text: 'OK' }]
                    );
                  }
                };

                if (isShortCycle) {
                  setPendingStartDate(todayStr);
                  setShortCycleWarningVisible(true);
                } else {
                  await performStart();
                }
              }}
            />
            <GridActionButton
              label="End Period"
              icon="x-circle"
              variant="primary"
              onPress={async () => {
                try {
                  await useCycleStore.getState().endPeriod(todayStr);
                } catch (err: any) {
                  const isNotActive = err.message.includes('no active period');
                  Alert.alert(
                    isNotActive ? 'No Active Period' : 'Notice',
                    err.message,
                    [{ text: 'OK' }]
                  );
                }
              }}
            />
          </View>
          <View style={styles.quickActionsRow}>
            <GridActionButton
              label="Edit Cycle"
              icon="refresh-cw"
              variant="secondary"
              onPress={() => router.push('/calendar')}
            />
            <GridActionButton
              label="Log Intimacy"
              icon="heart"
              variant="secondary"
              onPress={() => router.push('/log')}
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
            onLearnMore={() => router.push('/learn')}
          />
        </View>

        <View style={styles.section}>
          <CycleHistoryChart cycles={cycles} />
        </View>
      </ScrollView>

      <ConfirmModal
        visible={shortCycleWarningVisible}
        title="Short Cycle Detected"
        message="You logged a period very recently. Are you sure you want to start a new cycle today?"
        confirmLabel="Yes, Start Period"
        isDestructive={true}
        onConfirm={async () => {
          setShortCycleWarningVisible(false);
          if (pendingStartDate) {
            try {
              await useCycleStore.getState().startPeriod(pendingStartDate);
            } catch (err: any) {
              const isAlreadyActive = err.message.includes('already tracking');
              Alert.alert(
                isAlreadyActive ? 'Active Period' : 'Notice',
                err.message,
                [{ text: 'OK' }]
              );
            }
          }
          setPendingStartDate(null);
        }}
        onCancel={() => {
          setShortCycleWarningVisible(false);
          setPendingStartDate(null);
        }}
      />
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
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    zIndex: 10,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  scrollContent: {
    padding: spacing.md * 0.1,
    gap: spacing.md * 0.5,
  },
  emptyState: {
    padding: spacing.lg * 0.9,
    borderRadius: borderRadius.DEFAULT,
    alignItems: 'center',
  },
  quickActionsContainer: {
    gap: spacing.sm * 0,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: spacing.sm * 0,
  },
  section: {
    marginTop: spacing.xs * 0.5,
  },
});

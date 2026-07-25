import { View, StyleSheet, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/presentation/hooks/useTheme';
import { spacing, borderRadius, fontFamily } from '@/design-system';
import { Text } from '../ui/Text';

import type { DailyLog } from '@/domain/models/DailyLog';

interface TodayLogCardProps {
  log: DailyLog | null;
  onEdit: () => void;
}

export function TodayLogCard({ log, onEdit }: TodayLogCardProps) {
  const { colors } = useTheme();

  if (!log) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        <View style={styles.emptyContent}>
          <Feather name="file-text" size={32} color={colors.text.tertiary} style={{ marginBottom: spacing[2] }} />
          <Text variant="body" style={{ color: colors.text.secondary, textAlign: 'center', marginBottom: spacing[4] }}>
            You haven&apos;t logged any symptoms or moods today.
          </Text>
          <Pressable accessibilityRole="button" onPress={onEdit} style={[styles.actionButton, { backgroundColor: `${colors.brand.primary}15` }]}>
            <Text variant="label" style={{ color: colors.brand.primary }}>Log Today&apos;s Data</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const hasMoods = log.moods.length > 0;
  const hasSymptoms = log.symptoms.length > 0;
  const showSummary = hasMoods || hasSymptoms || log.energyLevel || log.sleepQuality;

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={styles.header}>
        <Text style={{ fontFamily: fontFamily.headingBold, fontSize: 22, color: colors.brand.primary }}>
          Today&apos;s Log
        </Text>
        <Pressable accessibilityRole="button" onPress={onEdit} hitSlop={10}>
          <Feather name="plus-circle" size={22} color={colors.brand.primary} />
        </Pressable>
      </View>

      {!showSummary ? (
        <Text variant="body" style={{ color: colors.text.secondary, marginTop: spacing[2] }}>
          Log contains only flow or notes. Tap edit to add more details.
        </Text>
      ) : (
        <View style={styles.summaryContainer}>
          {hasMoods && (
            <View style={styles.row}>
              <Text variant="label" style={{ color: colors.text.secondary, width: 80 }}>Moods</Text>
              <View style={styles.chipList}>
                {log.moods.slice(0, 3).map((mood) => (
                  <View key={mood} style={[styles.miniChip, { backgroundColor: `${colors.brand.primary}20` }]}>
                    <Text variant="micro" style={{ color: colors.brand.primary }}>{mood.replace('mood_', '')}</Text>
                  </View>
                ))}
                {log.moods.length > 3 && (
                  <Text variant="micro" style={{ color: colors.text.tertiary }}>+{log.moods.length - 3}</Text>
                )}
              </View>
            </View>
          )}

          {hasSymptoms && (
            <View style={styles.row}>
              <Text variant="label" style={{ color: colors.text.secondary, width: 80 }}>Symptoms</Text>
              <View style={styles.chipList}>
                {log.symptoms.slice(0, 3).map((symp) => (
                  <View key={symp} style={[styles.miniChip, { backgroundColor: `${colors.brand.secondary}20` }]}>
                    <Text variant="micro" style={{ color: colors.brand.secondary }}>{symp.replace('symp_', '')}</Text>
                  </View>
                ))}
                {log.symptoms.length > 3 && (
                  <Text variant="micro" style={{ color: colors.text.tertiary }}>+{log.symptoms.length - 3}</Text>
                )}
              </View>
            </View>
          )}

          {(log.energyLevel || log.sleepQuality) && (
            <View style={[styles.row, { marginTop: spacing[2] }]}>
              {log.energyLevel && (
                <View style={styles.statItem}>
                  <Feather name="zap" size={14} color={colors.text.secondary} />
                  <Text variant="caption" style={{ color: colors.text.secondary, marginLeft: spacing[1] }}>
                    Energy: {log.energyLevel}/5
                  </Text>
                </View>
              )}
              {log.sleepQuality && (
                <View style={styles.statItem}>
                  <Feather name="moon" size={14} color={colors.text.secondary} />
                  <Text variant="caption" style={{ color: colors.text.secondary, marginLeft: spacing[1] }}>
                    Sleep: {log.sleepQuality}/5
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.DEFAULT,
    padding: spacing.md,
    width: '100%',
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: spacing[2],
  },
  actionButton: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.full,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  summaryContainer: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chipList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[1],
    alignItems: 'center',
    flex: 1,
  },
  miniChip: {
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing[4],
  },
});

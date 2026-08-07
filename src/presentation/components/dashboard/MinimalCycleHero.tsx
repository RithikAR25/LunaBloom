import { View, StyleSheet } from 'react-native';
import { Text } from '../ui/Text';
import { useTheme } from '@/presentation/hooks/useTheme';
import { spacing, borderRadius, fontFamily, letterSpacing } from '@/design-system';
import { PredictionConfidence } from '@/domain/prediction/models/TimelineEvent';

export interface MinimalCycleHeroProps {
  phaseName: string;
  cycleDay: number;
  periodCountdown: number | null;
  confidence?: PredictionConfidence | null;
  isMenstruating?: boolean;
}

const formatConfidence = (confidence: PredictionConfidence): string => {
  switch (confidence) {
    case PredictionConfidence.HIGH: return 'Prediction: High';
    case PredictionConfidence.MEDIUM: return 'Prediction: Medium';
    case PredictionConfidence.LOW: return 'Prediction: Low';
    default: return '';
  }
};

export function MinimalCycleHero({
  phaseName,
  cycleDay,
  periodCountdown,
  confidence,
  isMenstruating,
}: MinimalCycleHeroProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {phaseName ? (
        <Text style={[styles.phaseTitle, { color: colors.brand.primary }]}>
          {phaseName.toUpperCase()}
        </Text>
      ) : null}
      
      <Text style={[styles.dayText, { color: colors.brand.primary }]}>
        Day {cycleDay}
      </Text>

      <View style={styles.pillsContainer}>
        {!isMenstruating && periodCountdown !== null && (
          <View style={[styles.pill, { backgroundColor: colors.surfaceElevated }]}>
            <Text style={[styles.pillText, { color: colors.text.primary }]}>
              Period in {periodCountdown}d
            </Text>
          </View>
        )}

        <View style={[styles.pill, { backgroundColor: colors.surfaceElevated }]}>
          <Text style={[styles.pillText, { color: colors.text.primary }]}>
            Cycle Day {cycleDay}
          </Text>
        </View>

        {confidence != null && (
          <View style={[styles.pill, { backgroundColor: colors.surfaceElevated }]}>
            <Text style={[styles.pillText, { color: colors.text.primary }]}>
              {formatConfidence(confidence)}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.lg * 0.9,
  },
  phaseTitle: {
    fontFamily: fontFamily.headingBold,
    fontSize: 12,
    letterSpacing: letterSpacing.wide,
    textAlign: 'center',
  },
  dayText: {
    fontFamily: fontFamily.headingBold,
    fontSize: 64,
    lineHeight: 72,
    textAlign: 'center',
    marginVertical: spacing.sm * 0.9,
  },
  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.md * 0.9,
    marginTop: spacing.md * 0.9,
    paddingHorizontal: spacing.lg,
  },
  pill: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
  },
  pillText: {
    fontFamily: fontFamily.headingSemiBold,
    fontSize: 12,
  },
});

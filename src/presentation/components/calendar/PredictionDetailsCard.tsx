import { View, StyleSheet } from 'react-native';
import { Text } from '../ui/Text';
import { useTheme } from '../../hooks/useTheme';
import { spacing, borderRadius, fontFamily } from '../../../design-system';
import { Feather } from '@expo/vector-icons';
import { PredictionResult } from '../../../domain/prediction';
import { formatDateShort } from '../../../utils/dateUtils';

interface PredictionDetailsCardProps {
  prediction: PredictionResult | null;
}

export function PredictionDetailsCard({ prediction }: PredictionDetailsCardProps) {
  const { colors } = useTheme();

  if (!prediction || (prediction.confidenceLevel === 'LOW' && prediction.explanation.length === 1 && prediction.explanation[0] === 'More cycle history will improve predictions.')) {
    // Return empty if there's no meaningful prediction yet.
    return null;
  }

  const renderConfidenceBadge = () => {
    let color = colors.semantic.warning;
    let label = 'Low Confidence';
    if (prediction.confidenceLevel === 'HIGH') {
      color = colors.semantic.success;
      label = 'High Confidence';
    } else if (prediction.confidenceLevel === 'MEDIUM') {
      color = colors.brand.secondary;
      label = 'Medium Confidence';
    }

    return (
      <View style={[styles.badge, { backgroundColor: color + '20' }]}>
        <Text style={[styles.badgeText, { color }]}>{label}</Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text.primary }]}>Prediction Insights</Text>
        {renderConfidenceBadge()}
      </View>

      <View style={styles.content}>
        <View style={styles.row}>
          <Feather name="calendar" size={18} color={colors.text.secondary} />
          <Text style={[styles.dateText, { color: colors.text.primary }]}>
            Next Period: {formatDateShort(prediction.confidenceRange.earliest)} - {formatDateShort(prediction.confidenceRange.latest)}
          </Text>
        </View>

        {prediction.irregularityExplanation && (
          <View style={styles.detailRow}>
            <Feather name="alert-circle" size={16} color={colors.semantic.warning} style={styles.detailIcon} />
            <View style={styles.detailTextContainer}>
              <Text style={[styles.detailText, { color: colors.semantic.warning }]}>
                Cycle irregularity detected
              </Text>
              <Text style={[styles.detailSubtext, { color: colors.text.secondary }]}>
                {prediction.irregularityExplanation}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.explanationContainer}>
          <Text style={[styles.explanationTitle, { color: colors.text.secondary }]}>Why this prediction?</Text>
          {prediction.explanation.map((exp, index) => (
            <View key={index} style={styles.bulletRow}>
              <View style={[styles.bullet, { backgroundColor: colors.text.tertiary }]} />
              <Text style={[styles.explanationText, { color: colors.text.secondary }]}>{exp}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.DEFAULT,
    padding: spacing.md,
    marginVertical: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontFamily: fontFamily.headingBold,
    fontSize: 16,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dateText: {
    fontSize: 15,
    fontWeight: '500',
  },
  explanationContainer: {
    marginTop: spacing.xs,
    gap: 4,
  },
  explanationTitle: {
    fontSize: 13,
    marginBottom: 4,
    fontWeight: '500',
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingRight: spacing.md,
  },
  bullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 6,
  },
  explanationText: {
    fontSize: 13,
    lineHeight: 18,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: 'rgba(255, 153, 102, 0.1)', // Subtle warning bg
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
  },
  detailIcon: {
    marginTop: 2,
  },
  detailTextContainer: {
    flex: 1,
    gap: 4,
  },
  detailText: {
    fontSize: 14,
    fontWeight: '600',
  },
  detailSubtext: {
    fontSize: 13,
    lineHeight: 18,
  },
});

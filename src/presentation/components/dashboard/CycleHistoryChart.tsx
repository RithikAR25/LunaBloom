import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/presentation/hooks/useTheme';
import { spacing, borderRadius, useScaling } from '@/design-system';
import { Text } from '../ui/Text';
import { Heading } from '../ui/Heading';
import type { CycleEntry } from '@/domain/models/Cycle';

interface CycleHistoryChartProps {
  cycles: CycleEntry[];
}

export function CycleHistoryChart({ cycles }: CycleHistoryChartProps) {
  const { colors } = useTheme();
  const { scale, verticalScale } = useScaling();

  // Responsive geometry — derived from device dimensions at render time.
  // At the Pixel 10 baseline (412 × 917) all values equal their original
  // pixel constants: barWidth=24, colWidth=40, radius=12, barH=120, chartH=160.
  // See src/design-system/scaling.ts for the scaling contract.
  const scaledBarWidth = scale(24);
  const barPillRadius = Math.round(scaledBarWidth / 2); // preserves pill invariant at all sizes
  const barHeight = verticalScale(120);
  const chartHeight = verticalScale(160);

  // Get the last 4 completed cycles (must have an endDate to be completed)
  const completedCycles = [...cycles]
    .filter(c => c.endDate !== null && c.cycleLengthDays !== null)
    .sort((a, b) => (a.startDate < b.startDate ? 1 : -1)) // Sort descending
    .slice(0, 4); // Display newest to oldest from left to right

  if (completedCycles.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        <Heading level="h3" style={{ color: colors.text.primary, marginBottom: spacing[2] }}>
          Cycle History
        </Heading>
        <Text variant="body" style={{ color: colors.text.secondary }}>
          Not enough data yet. Complete a cycle to see your history.
        </Text>
      </View>
    );
  }

  // Find max length to scale bars properly
  const maxLength = Math.max(...completedCycles.map(c => c.cycleLengthDays as number), 40); // min scale of 40 days

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={styles.header}>
        <Heading level="h3" style={{ color: colors.text.primary }}>
          Cycle History
        </Heading>
      </View>

      <View style={[styles.chartContainer, { height: chartHeight }]}>
        {completedCycles.map((cycle, index) => {
          const length = cycle.cycleLengthDays as number;
          const height = Math.max((length / maxLength) * barHeight, 20); // min height of 20 (fixed legibility floor)

          return (
            <View
              key={cycle.id || index}
              style={[styles.barColumn, { width: scale(40) }]}
              testID="bar-column"
            >
              <Text variant="micro" style={{ color: colors.text.primary, marginBottom: spacing[1] }}>
                {length}d
              </Text>

              <View
                style={[
                  styles.barTrack,
                  {
                    backgroundColor: `${colors.brand.primary}15`,
                    height: barHeight,
                    width: scaledBarWidth,
                    borderRadius: barPillRadius,
                  },
                ]}
              >
                <View
                  style={[
                    styles.barFill,
                    {
                      backgroundColor: colors.brand.primary,
                      height: height,
                      borderRadius: barPillRadius,
                    },
                  ]}
                />
              </View>

              <Text variant="micro" style={{ color: colors.text.secondary, marginTop: spacing[1] }}>
                {new Date(cycle.startDate).toLocaleDateString(undefined, { month: 'short' })}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    width: '100%',
  },
  header: {
    marginBottom: spacing[4],
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    // height applied inline: verticalScale(160)
  },
  barColumn: {
    alignItems: 'center',
    // width applied inline: scale(40)
  },
  barTrack: {
    // width, borderRadius applied inline via scaledBarWidth / barPillRadius
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    // borderRadius applied inline via barPillRadius
  },
});


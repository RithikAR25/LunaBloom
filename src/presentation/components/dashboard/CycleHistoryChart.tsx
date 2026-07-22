import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/presentation/hooks/useTheme';
import { spacing, borderRadius } from '@/design-system';
import { Text } from '../ui/Text';
import { Heading } from '../ui/Heading';
import type { CycleEntry } from '@/domain/models/Cycle';

interface CycleHistoryChartProps {
  cycles: CycleEntry[];
}

export function CycleHistoryChart({ cycles }: CycleHistoryChartProps) {
  const { colors } = useTheme();

  // Get the last 4 completed cycles (must have an endDate to be completed)
  const completedCycles = [...cycles]
    .filter(c => c.endDate !== null && c.cycleLengthDays !== null)
    .sort((a, b) => (a.startDate < b.startDate ? 1 : -1)) // Sort descending
    .slice(0, 4)
    .reverse(); // Display oldest to newest from left to right

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
  const BAR_HEIGHT = 120; // max height in pixels

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={styles.header}>
        <Heading level="h3" style={{ color: colors.text.primary }}>
          Cycle History
        </Heading>
      </View>
      
      <View style={styles.chartContainer}>
        {completedCycles.map((cycle, index) => {
          const length = cycle.cycleLengthDays as number;
          const height = Math.max((length / maxLength) * BAR_HEIGHT, 20); // min height of 20
          
          return (
            <View key={cycle.id || index} style={styles.barColumn}>
              <Text variant="micro" style={{ color: colors.text.primary, marginBottom: spacing[1] }}>
                {length}d
              </Text>
              
              <View style={[styles.barTrack, { backgroundColor: `${colors.brand.primary}15`, height: BAR_HEIGHT }]}>
                <View 
                  style={[
                    styles.barFill, 
                    { 
                      backgroundColor: colors.brand.primary,
                      height: height 
                    }
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
    height: 160,
  },
  barColumn: {
    alignItems: 'center',
    width: 40,
  },
  barTrack: {
    width: 24,
    borderRadius: 12,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 12,
  },
});

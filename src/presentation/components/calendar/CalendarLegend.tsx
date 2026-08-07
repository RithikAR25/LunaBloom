import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/presentation/hooks/useTheme';
import { spacing, fontSize } from '@/design-system';

export function CalendarLegend() {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { marginTop: spacing[6] }]}>
      <View style={styles.legendItem}>
        <View style={[styles.dot, { backgroundColor: colors.phase.menstrual + '50' }]} />
        <Text style={[styles.label, { color: colors.text.secondary }]}>Period</Text>
      </View>
      <View style={styles.legendItem}>
        <View style={[styles.dot, { backgroundColor: colors.phase.predicted + '50', borderWidth: 1, borderStyle: 'dashed', borderColor: colors.phase.predicted }]} />
        <Text style={[styles.label, { color: colors.text.secondary }]}>Predicted</Text>
      </View>
      <View style={styles.legendItem}>
        <View style={[styles.dot, { backgroundColor: colors.phase.follicular + '60' }]} />
        <Text style={[styles.label, { color: colors.text.secondary }]}>Follicular</Text>
      </View>
      <View style={styles.legendItem}>
        <View style={[styles.dot, { backgroundColor: colors.phase.ovulatory + '80' }]} />
        <Text style={[styles.label, { color: colors.text.secondary }]}>Ovulation</Text>
      </View>
      <View style={styles.legendItem}>
        <View style={[styles.dot, { backgroundColor: 'transparent', borderColor: colors.phase.ovulatory , borderWidth: 1 }]} />
        <Text style={[styles.label, { color: colors.text.secondary }]}>Fertile Window</Text>
      </View>
      <View style={styles.legendItem}>
        <View style={[styles.dot, { backgroundColor: colors.phase.luteal + '50' }]} />
        <Text style={[styles.label, { color: colors.text.secondary }]}>Luteal</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  label: {
    fontSize: fontSize.caption,
  },
})

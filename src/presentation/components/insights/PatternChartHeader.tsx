import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useScaling, fontSize, fontFamily } from '@/design-system';
import { useTheme } from '../../hooks/useTheme';

interface Props {
  title: string;
  subtitle: string;
  viewMode: 'bar' | 'line';
  sortOrder: 'desc' | 'asc';
  onToggleView: () => void;
  onToggleSort: () => void;
}

export function PatternChartHeader({
  title,
  subtitle,
  viewMode,
  sortOrder,
  onToggleView,
  onToggleSort,
}: Props) {
  const { colors } = useTheme();
  const { scale } = useScaling();

  return (
    <View style={styles.headerRow}>
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: colors.text.primary }]}>{title}</Text>
        <Text style={[styles.subtitle, { color: colors.text.secondary }]}>{subtitle}</Text>
      </View>

      <View style={styles.controlsRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={viewMode === 'bar' ? 'Switch to line chart' : 'Switch to bar chart'}
          onPress={onToggleView}
          style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }, styles.iconButton]}
          hitSlop={8}
        >
          <Ionicons
            name={viewMode === 'bar' ? 'analytics-outline' : 'bar-chart-outline'}
            size={scale(18)}
            color={colors.text.secondary}
          />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={sortOrder === 'desc' ? 'Sort oldest to newest' : 'Sort newest to oldest'}
          onPress={onToggleSort}
          style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }, styles.iconButton]}
          hitSlop={8}
        >
          <Ionicons
            name="swap-vertical-outline"
            size={scale(18)}
            color={colors.text.secondary}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  textContainer: {
    flex: 1,
    paddingRight: 8,
  },
  title: {
    fontSize: fontSize.body,
    fontFamily: fontFamily.semiBold,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: fontSize.caption,
    fontFamily: fontFamily.regular,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    padding: 4,
  },
});

import { View, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useScaling, spacing } from '@/design-system';
import { Text } from '../ui/Text';
import { Ionicons } from '@expo/vector-icons';

interface SettingsRowProps {
  icon?: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  isLast?: boolean;
}

export function SettingsRow({ icon, label, value, onPress, isLast = false }: SettingsRowProps) {
  const { colors } = useTheme();
  const { scale } = useScaling();

  return (
    <Pressable accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: pressed ? colors.borderSubtle : 'transparent', minHeight: scale(56) },
        !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.borderSubtle },
      ]}
    >
      <View style={styles.left}>
        {icon && (
          <View style={[styles.iconContainer, { width: scale(28) }]}>
            <Ionicons name={icon} size={scale(20)} color={colors.text.secondary} />
          </View>
        )}
        <Text variant="body" style={{ color: colors.text.primary }}>
          {label}
        </Text>
      </View>
      <View style={styles.right}>
        {value && (
          <Text variant="body" style={[styles.value, { color: colors.text.secondary }]}>
            {value}
          </Text>
        )}
        {onPress && (
          <Ionicons name="chevron-forward" size={scale(20)} color={colors.text.tertiary} />
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    // minHeight: 56, // not scaled to prevent layout issues if not needed, wait, scaling it is better.
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    // width: scaled inline
    marginRight: spacing[3],
    alignItems: 'center',
  },
  value: {
    marginRight: spacing[2],
  },
});

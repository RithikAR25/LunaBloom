import { View, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { spacing } from '@/design-system';
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

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: pressed ? colors.borderSubtle : 'transparent' },
        !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.borderSubtle },
      ]}
    >
      <View style={styles.left}>
        {icon && (
          <View style={styles.iconContainer}>
            <Ionicons name={icon} size={20} color={colors.text.secondary} />
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
          <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
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
    minHeight: 56,
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
    width: 28,
    marginRight: spacing[3],
    alignItems: 'center',
  },
  value: {
    marginRight: spacing[2],
  },
});

import { View, StyleSheet, Switch } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useScaling, spacing } from '@/design-system';
import { Text } from '../ui/Text';
import { Ionicons } from '@expo/vector-icons';

interface SettingsToggleProps {
  icon?: keyof typeof Ionicons.glyphMap;
  label: string;
  value: boolean;
  onValueChange: (val: boolean) => void;
  isLast?: boolean;
}

export function SettingsToggle({ icon, label, value, onValueChange, isLast = false }: SettingsToggleProps) {
  const { colors } = useTheme();
  const { scale } = useScaling();

  return (
    <View
      style={[
        styles.container,
        { minHeight: scale(56) },
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
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.overlaySubtle, true: colors.brand.primary }}
        thumbColor={colors.text.inverse}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    // minHeight: 56, scaled inline
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    // width: scaled inline
    marginRight: spacing[3],
    alignItems: 'center',
  },
});

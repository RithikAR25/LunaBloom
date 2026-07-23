import { View, StyleSheet, Switch } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { spacing } from '@/design-system';
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

  return (
    <View
      style={[
        styles.container,
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
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: 'rgba(0,0,0,0.1)', true: colors.brand.primary }}
        thumbColor={'#fff'}
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
    minHeight: 56,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 28,
    marginRight: spacing[3],
    alignItems: 'center',
  },
});

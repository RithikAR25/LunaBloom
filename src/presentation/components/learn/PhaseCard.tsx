import { View, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { spacing, borderRadius } from '@/design-system';
import { Text } from '../ui/Text';
import { Ionicons } from '@expo/vector-icons';
import { PhaseIdentifier } from '../../../domain/repositories/IContentRepository';

interface PhaseCardProps {
  id: PhaseIdentifier;
  name: string;
  tagline: string;
  onPress: () => void;
}

export const PhaseCard = ({ id, name, tagline, onPress }: PhaseCardProps) => {
  const { colors } = useTheme();

  // Determine icon and color based on phase
  let iconName: keyof typeof Ionicons.glyphMap = 'flower-outline';
  let color = colors.brand.primary;

  switch (id) {
    case 'menstrual':
      iconName = 'water-outline';
      color = colors.phase.menstrual;
      break;
    case 'follicular':
      iconName = 'leaf-outline';
      color = colors.phase.follicular;
      break;
    case 'ovulatory':
      iconName = 'sunny-outline';
      color = colors.phase.ovulatory;
      break;
    case 'luteal':
      iconName = 'moon-outline';
      color = colors.phase.luteal;
      break;
  }

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.md,
      padding: spacing[4],
      marginBottom: spacing[4],
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: 'row',
      alignItems: 'center',
    },
    pressed: {
      opacity: 0.7,
      backgroundColor: colors.background,
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: 'rgba(0,0,0,0.05)',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing[4],
    },
    textContainer: {
      flex: 1,
    },
    name: {
      color: colors.text.primary,
      marginBottom: spacing[1],
    },
    tagline: {
      color: colors.text.secondary,
    },
    chevron: {
      marginLeft: spacing[2],
    },
  });

  return (
    <Pressable 
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Learn about the ${name} phase`}
    >
      <View style={styles.iconContainer}>
        <Ionicons name={iconName} size={24} color={color} />
      </View>
      <View style={styles.textContainer}>
        <Text variant="body" weight="bold" style={styles.name}>{name}</Text>
        <Text variant="caption" style={styles.tagline}>{tagline}</Text>
      </View>
      <View style={styles.chevron}>
        <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
      </View>
    </Pressable>
  );
};

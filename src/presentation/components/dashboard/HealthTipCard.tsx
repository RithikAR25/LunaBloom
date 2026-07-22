import { View, StyleSheet, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/presentation/hooks/useTheme';
import { spacing, borderRadius } from '@/design-system';
import { Text } from '../ui/Text';
import { Heading } from '../ui/Heading';

interface HealthTipCardProps {
  tip: string;
  onLearnMore?: () => void;
}

export function HealthTipCard({ tip, onLearnMore }: HealthTipCardProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderLeftColor: colors.brand.secondary }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Feather name="info" size={16} color={colors.brand.secondary} />
          <Heading level="h3" style={{ color: colors.brand.secondary, marginLeft: spacing[2] }}>
            Health Tip
          </Heading>
        </View>
        <Text variant="body" style={{ color: colors.text.secondary, marginTop: spacing[2], lineHeight: 22 }}>
          {tip}
        </Text>
        
        {onLearnMore && (
          <Pressable onPress={onLearnMore} style={styles.learnMoreButton}>
            <Text variant="label" style={{ color: colors.brand.primary }}>Learn More</Text>
            <Feather name="arrow-right" size={14} color={colors.brand.primary} style={{ marginLeft: spacing[1] }} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.lg,
    borderLeftWidth: 4,
    width: '100%',
    overflow: 'hidden',
  },
  content: {
    padding: spacing[4],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  learnMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing[3],
    alignSelf: 'flex-start',
  },
});

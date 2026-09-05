import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useScaling, spacing, borderRadius, fontSize, lineHeight } from '@/design-system';
import { Text } from '../ui/Text';
import { Ionicons } from '@expo/vector-icons';

export const MedicalDisclaimer = () => {
  const { colors } = useTheme();
  const { scale } = useScaling();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      padding: spacing[4],
      borderRadius: borderRadius.md,
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing[2],
      marginTop: spacing[8],
      marginBottom: spacing[8],
      borderWidth: 1,
      borderColor: colors.border,
    },
    iconContainer: {
      marginTop: 2,
    },
    textContainer: {
      flex: 1,
    },
    title: {
      color: colors.text.primary,
      marginBottom: spacing[1],
    },
    text: {
      color: colors.text.secondary,
      lineHeight: fontSize.caption * lineHeight.normal,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="medical-outline" size={scale(16)} color={colors.text.secondary} />
      </View>
      <View style={styles.textContainer}>
        <Text variant="caption" weight="bold" style={styles.title}>Medical Disclaimer</Text>
        <Text variant="caption" style={styles.text}>
          The educational content provided in this app is for informational purposes only 
          and should not be considered a substitute for professional medical advice, 
          diagnosis, or treatment. Always consult with a qualified healthcare provider 
          regarding any medical condition or concerns.
        </Text>
      </View>
    </View>
  );
};

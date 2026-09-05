import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useScaling, spacing, borderRadius, fontSize, lineHeight } from '@/design-system';
import { Text } from '../ui/Text';
import { LearnSection } from '../../../domain/repositories/IContentRepository';
import { Ionicons } from '@expo/vector-icons';

interface ContentSectionProps {
  section: LearnSection;
  iconName: keyof typeof Ionicons.glyphMap;
  showDetails: boolean;
}

export const ContentSection = ({ section, iconName, showDetails }: ContentSectionProps) => {
  const { colors } = useTheme();
  const { scale } = useScaling();
  
  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.md,
      padding: spacing[4],
      marginBottom: spacing[4],
      borderWidth: 1,
      borderColor: colors.border,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing[2],
    },
    iconContainer: {
      marginRight: spacing[2],
    },
    title: {
      color: colors.text.primary,
    },
    summary: {
      color: colors.text.secondary,
      lineHeight: fontSize.bodyMd * lineHeight.normal,
    },
    detailsContainer: {
      marginTop: spacing[4],
      paddingTop: spacing[4],
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    detailsText: {
      color: colors.text.primary,
      lineHeight: fontSize.bodyMd * lineHeight.normal,
      opacity: 0.9,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name={iconName} size={scale(20)} color={colors.brand.primary} />
        </View>
        <Text variant="body" weight="bold" style={styles.title}>{section.title}</Text>
      </View>
      
      <Text variant="body" style={styles.summary}>{section.summary}</Text>
      
      {showDetails && section.details && (
        <View style={styles.detailsContainer}>
          <Text variant="body" style={styles.detailsText}>{section.details}</Text>
        </View>
      )}
    </View>
  );
};

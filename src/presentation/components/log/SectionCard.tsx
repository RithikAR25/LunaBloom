import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/presentation/hooks/useTheme';
import { spacing, borderRadius } from '@/design-system';
import { Heading } from '../ui/Heading';
import { Text } from '../ui/Text';

interface SectionCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

export function SectionCard({ title, description, children, style }: SectionCardProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }, style]}>
      <View style={styles.header}>
        <Heading level="h3" style={{ color: colors.text.primary }}>
          {title}
        </Heading>
        {description && (
          <Text variant="caption" style={{ color: colors.text.secondary, marginTop: spacing[1] }}>
            {description}
          </Text>
        )}
      </View>
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.lg,
    width: '100%',
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[4],
    paddingBottom: spacing[2],
  },
  content: {
    padding: spacing[4],
    paddingTop: 0,
  },
});

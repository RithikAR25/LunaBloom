import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '@/presentation/hooks/useTheme';
import { spacing, borderRadius, fontSize, fontFamily } from '@/design-system';
import type { FlowIntensity } from '../../../domain/models';

interface FlowSelectorProps {
  value: FlowIntensity | null;
  onChange: (value: FlowIntensity) => void;
}

export function FlowSelector({ value, onChange }: FlowSelectorProps) {
  const { colors } = useTheme();

  const options: { label: string; value: FlowIntensity; description: string }[] = [
    { label: 'Spotting', value: 'SPOTTING', description: 'Very light, occasional drops.' },
    { label: 'Light', value: 'LIGHT', description: 'Requires a light pad or liner.' },
    { label: 'Medium', value: 'MEDIUM', description: 'Requires a regular pad or tampon.' },
    { label: 'Heavy', value: 'HEAVY', description: 'Requires a super pad or frequent changes.' },
  ];

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text.primary, marginBottom: spacing[2] }]}>
        Flow Intensity
      </Text>
      
      <View style={[styles.row, { gap: spacing[2] }]}>
        {options.map((opt) => {
          const isSelected = value === opt.value;
          return (
            <Pressable accessibilityRole="button"
              key={opt.value}
              style={[
                styles.option,
                {
                  backgroundColor: isSelected ? colors.brand.primary + '20' : colors.surface,
                  borderColor: isSelected ? colors.brand.primary : colors.border,
                  borderWidth: 1,
                  borderRadius: borderRadius.md,
                },
              ]}
              onPress={() => onChange(opt.value)}
            >
              <Text
                style={[
                  styles.optionText,
                  { color: isSelected ? colors.brand.primary : colors.text.secondary },
                ]}
              >
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      
      {value && (
        <Text style={[styles.description, { color: colors.text.secondary, marginTop: spacing[2] }]}>
          {options.find(o => o.value === value)?.description}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  title: {
    fontSize: fontSize.bodyMd,
    fontFamily: fontFamily.semiBold,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  option: {
    flex: 1,
    minWidth: '22%',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    fontSize: fontSize.labelMd,
    fontFamily: fontFamily.medium,
  },
  description: {
    fontSize: fontSize.caption,
    fontStyle: 'italic',
  },
});

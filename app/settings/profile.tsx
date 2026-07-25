import { useState } from 'react';
import { View, StyleSheet, ScrollView, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/presentation/hooks/useTheme';
import { spacing, borderRadius, fontSize } from '@/design-system';
import { Text } from '../../src/presentation/components/ui/Text';
import { Button } from '../../src/presentation/components/ui/Button';
import { useProfileStore } from '../../src/presentation/stores/useProfileStore';

export default function ProfileSettingsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  
  const profile = useProfileStore((state) => state.profile);
  const updateProfile = useProfileStore((state) => state.updateProfile);
  const isUpdating = useProfileStore((state) => state.isLoading);

  const [name, setName] = useState(profile?.preferredName || '');
  const [dob, setDob] = useState(profile?.dateOfBirth || '');
  const [height, setHeight] = useState(profile?.heightCm?.toString() || '');
  const [weight, setWeight] = useState(profile?.weightKg?.toString() || '');

  const handleSave = async () => {
    try {
      await updateProfile({
        preferredName: name || null,
        dateOfBirth: dob || null,
        heightCm: height ? parseFloat(height) : null,
        weightKg: weight ? parseFloat(weight) : null,
      });
      router.back();
    } catch {
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text variant="caption" weight="bold" style={[styles.label, { color: colors.text.secondary }]}>
            PREFERRED NAME
          </Text>
          <TextInput 
            accessibilityLabel="Text input field"
            accessibilityHint="Enter your preferred name"
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text.primary, borderColor: colors.borderSubtle }]}
            value={name}
            onChangeText={setName}
            placeholder="What should we call you?"
            placeholderTextColor={colors.text.tertiary}
          />
        </View>

        <View style={styles.section}>
          <Text variant="caption" weight="bold" style={[styles.label, { color: colors.text.secondary }]}>
            DATE OF BIRTH
          </Text>
          <TextInput 
            accessibilityLabel="Text input field"
            accessibilityHint="Enter your date of birth"
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text.primary, borderColor: colors.borderSubtle }]}
            value={dob}
            onChangeText={setDob}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.text.tertiary}
          />
        </View>

        <View style={styles.section}>
          <Text variant="caption" weight="bold" style={[styles.label, { color: colors.text.secondary }]}>
            HEIGHT (CM)
          </Text>
          <TextInput 
            accessibilityLabel="Text input field"
            accessibilityHint="Enter your height"
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text.primary, borderColor: colors.borderSubtle }]}
            value={height}
            onChangeText={setHeight}
            placeholder="e.g. 165"
            keyboardType="numeric"
            placeholderTextColor={colors.text.tertiary}
          />
        </View>

        <View style={styles.section}>
          <Text variant="caption" weight="bold" style={[styles.label, { color: colors.text.secondary }]}>
            WEIGHT (KG)
          </Text>
          <TextInput 
            accessibilityLabel="Text input field"
            accessibilityHint="Enter your weight"
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text.primary, borderColor: colors.borderSubtle }]}
            value={weight}
            onChangeText={setWeight}
            placeholder="e.g. 60"
            keyboardType="numeric"
            placeholderTextColor={colors.text.tertiary}
          />
        </View>

        <View style={styles.saveButton}>
          <Button 
            label="Save Changes" 
            onPress={handleSave} 
            disabled={isUpdating}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing[4],
    paddingBottom: spacing[8],
  },
  section: {
    marginBottom: spacing[4],
  },
  label: {
    marginBottom: spacing[2],
    marginLeft: spacing[1],
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing[4],
    fontSize: fontSize.bodyMd,
  },
  saveButton: {
    marginTop: spacing[4],
  },
});

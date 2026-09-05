import { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../../src/presentation/hooks/useTheme';
import { spacing, borderRadius, fontSize } from '@/design-system';
import { Text } from '../../src/presentation/components/ui/Text';
import { Button } from '../../src/presentation/components/ui/Button';
import { AlertModal } from '../../src/presentation/components/ui/AlertModal';
import { formatDateToISO, parseISODateLocal } from '../../src/utils/dateUtils';
import { useProfileStore } from '../../src/presentation/stores/useProfileStore';
import { ValidationService } from '../../src/domain/services/ValidationService';

export default function ProfileSettingsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  
  const profile = useProfileStore((state) => state.profile);
  const updateProfile = useProfileStore((state) => state.updateProfile);
  const isUpdating = useProfileStore((state) => state.isLoading);
  const validationService = useMemo(() => new ValidationService(), []);

  const [name, setName] = useState(profile?.preferredName || '');
  const [dob, setDob] = useState(profile?.dateOfBirth || '');
  const [height, setHeight] = useState(profile?.heightCm?.toString() || '');
  const [weight, setWeight] = useState(profile?.weightKg?.toString() || '');

  const [alertState, setAlertState] = useState<{ visible: boolean; title: string; message: string; }>({
    visible: false,
    title: '',
    message: ''
  });

  const [showPicker, setShowPicker] = useState(false);

  const getWeightIcon = (w: string) => {
    const val = parseFloat(w);
    if (isNaN(val)) return null;
    
    let iconName: React.ComponentProps<typeof MaterialCommunityIcons>['name'] = 'ladybug';
    if (val < 20) iconName = 'ladybug';
    else if (val < 30) iconName = 'butterfly-outline';
    else if (val < 40) iconName = 'bird';
    else if (val < 50) iconName = 'cat';
    else if (val < 60) iconName = 'sheep';
    else if (val < 70) iconName = 'cow';
    else if (val < 80) iconName = 'panda';
    else if (val < 100) iconName = 'pig-variant';
    else if (val < 150) iconName = 'elephant';
    else iconName = 'snail';

    return <MaterialCommunityIcons name={iconName as any} size={24} color={colors.brand.primary} style={{ marginLeft: spacing[2] }} />;
  };

  // Validation States
  const [nameError, setNameError] = useState('');
  const [dobError, setDobError] = useState('');
  const [heightError, setHeightError] = useState('');
  const [weightError, setWeightError] = useState('');

  const handleSave = async () => {
    setNameError('');
    setDobError('');
    setHeightError('');
    setWeightError('');
    let hasError = false;

    if (name) {
      const res = validationService.validateName(name);
      if (!res.isValid) {
        setNameError(res.error!);
        hasError = true;
      }
    }

    if (dob) {
      const res = validationService.validateDateOfBirth(dob);
      if (!res.isValid) {
        setDobError(res.error!);
        hasError = true;
      }
    }

    if (height) {
      const res = validationService.validateHeight(parseFloat(height));
      if (!res.isValid) {
        setHeightError(res.error!);
        hasError = true;
      }
    }

    if (weight) {
      const res = validationService.validateWeight(parseFloat(weight));
      if (!res.isValid) {
        setWeightError(res.error!);
        hasError = true;
      }
    }

    if (hasError) return;

    try {
      await updateProfile({
        preferredName: name || null,
        dateOfBirth: dob || null,
        heightCm: height ? parseFloat(height) : null,
        weightKg: weight ? parseFloat(weight) : null,
      });
      router.back();
    } catch {
      setAlertState({ visible: true, title: 'Error', message: 'Failed to save profile. Please try again.' });
    }
  };

  const onDateChange = (_event: any, selectedDate?: Date) => {
    setShowPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDob(formatDateToISO(selectedDate));
      setDobError('');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView showsVerticalScrollIndicator={false} style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
        
        <View style={styles.section}>
          <Text variant="caption" weight="bold" style={[styles.label, { color: colors.text.secondary }]}>
            PREFERRED NAME
          </Text>
          <TextInput 
            accessibilityLabel="Text input field"
            accessibilityHint="Enter your preferred name"
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text.primary, borderColor: nameError ? colors.semantic.error : colors.borderSubtle }]}
            value={name}
            onChangeText={(text) => { setName(text); setNameError(''); }}
            placeholder="What should we call you?"
            placeholderTextColor={colors.text.tertiary}
          />
          {!!nameError && <Text variant="caption" style={{ color: colors.semantic.error, marginTop: 4, marginLeft: 4 }}>{nameError}</Text>}
        </View>

        <View style={styles.section}>
          <Text variant="caption" weight="bold" style={[styles.label, { color: colors.text.secondary }]}>
            DATE OF BIRTH
          </Text>
          {Platform.OS === 'ios' ? (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <DateTimePicker
                value={dob ? parseISODateLocal(dob) : new Date()}
                mode="date"
                display="default"
                onChange={onDateChange}
                maximumDate={new Date()}
              />
            </View>
          ) : (
            <View>
              <Button
                variant="secondary"
                label={dob ? parseISODateLocal(dob).toLocaleDateString() : 'Select Date'}
                onPress={() => setShowPicker(true)}
              />
              {showPicker && (
                <DateTimePicker
                  value={dob ? parseISODateLocal(dob) : new Date()}
                  mode="date"
                  display="default"
                  onChange={onDateChange}
                  maximumDate={new Date()}
                />
              )}
            </View>
          )}
          {!!dobError && <Text variant="caption" style={{ color: colors.semantic.error, marginTop: 4, marginLeft: 4 }}>{dobError}</Text>}
        </View>

        <View style={styles.section}>
          <Text variant="caption" weight="bold" style={[styles.label, { color: colors.text.secondary }]}>
            HEIGHT (CM)
          </Text>
          <TextInput 
            accessibilityLabel="Text input field"
            accessibilityHint="Enter your height"
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text.primary, borderColor: heightError ? colors.semantic.error : colors.borderSubtle }]}
            value={height}
            onChangeText={(text) => { setHeight(text); setHeightError(''); }}
            placeholder="e.g. 165"
            keyboardType="numeric"
            placeholderTextColor={colors.text.tertiary}
          />
          {!!heightError && <Text variant="caption" style={{ color: colors.semantic.error, marginTop: 4, marginLeft: 4 }}>{heightError}</Text>}
        </View>

        <View style={styles.section}>
          <Text variant="caption" weight="bold" style={[styles.label, { color: colors.text.secondary }]}>
            WEIGHT (KG)
          </Text>
          <View style={[styles.input, { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderColor: weightError ? colors.semantic.error : colors.borderSubtle }]}>
            <TextInput 
              accessibilityLabel="Text input field"
              accessibilityHint="Enter your weight"
              style={{ flex: 1, color: colors.text.primary, fontSize: fontSize.bodyMd, height: '100%' }}
              value={weight}
              onChangeText={(text) => { setWeight(text); setWeightError(''); }}
              placeholder="e.g. 60"
              keyboardType="numeric"
              placeholderTextColor={colors.text.tertiary}
            />
            {weight.trim().length > 0 && !isNaN(parseFloat(weight)) && getWeightIcon(weight)}
          </View>
          {!!weightError && <Text variant="caption" style={{ color: colors.semantic.error, marginTop: 4, marginLeft: 4 }}>{weightError}</Text>}
        </View>

        <View style={styles.saveButton}>
          <Button 
            label="Save Changes" 
            onPress={handleSave} 
            disabled={isUpdating}
          />
        </View>

        <AlertModal
          visible={alertState.visible}
          type="error"
          title={alertState.title}
          message={alertState.message}
          onDismiss={() => setAlertState(prev => ({ ...prev, visible: false }))}
        />
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

import { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/presentation/hooks/useTheme';
import { spacing, borderRadius } from '@/design-system';
import { Text } from '../../src/presentation/components/ui/Text';
import { Button } from '../../src/presentation/components/ui/Button';
import { AlertModal } from '../../src/presentation/components/ui/AlertModal';
import { useProfileStore } from '../../src/presentation/stores/useProfileStore';
import { Ionicons } from '@expo/vector-icons';
import { UserGoal, BirthControlType, MedicalCondition } from '../../src/domain/models/index';

const GOALS = [
  { value: UserGoal.TrackCycle, label: 'Track Cycle' },
  { value: UserGoal.Conceive, label: 'Trying to Conceive' },
  { value: UserGoal.AvoidPregnancy, label: 'Avoid Pregnancy' },
  { value: UserGoal.GeneralHealth, label: 'General Health & Wellness' },
];

const BIRTH_CONTROLS = [
  { value: 'NONE', label: 'None' },
  { value: 'PILL', label: 'Pill' },
  { value: 'HORMONAL_IUD', label: 'Hormonal IUD' },
  { value: 'COPPER_IUD', label: 'Copper IUD' },
  { value: 'IMPLANT', label: 'Implant' },
];

const CONDITIONS = [
  { value: 'PCOS', label: 'PCOS' },
  { value: 'ENDOMETRIOSIS', label: 'Endometriosis' },
  { value: 'IRREGULAR_CYCLES', label: 'Irregular Cycles' },
  { value: 'THYROID', label: 'Thyroid Issue' },
];

export default function HealthSettingsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  
  const profile = useProfileStore((state) => state.profile);
  const updateProfile = useProfileStore((state) => state.updateProfile);
  const isUpdating = useProfileStore((state) => state.isLoading);

  const [goal, setGoal] = useState<UserGoal>(profile?.primaryGoal || UserGoal.TrackCycle);
  const [bcType, setBcType] = useState<BirthControlType>(profile?.birthControlType || 'NONE');
  const [conditions, setConditions] = useState<MedicalCondition[]>(profile?.conditions || []);

  const [alertState, setAlertState] = useState<{ visible: boolean; title: string; message: string; }>({
    visible: false,
    title: '',
    message: ''
  });

  const toggleCondition = (cond: MedicalCondition) => {
    if (conditions.includes(cond)) {
      setConditions(conditions.filter(c => c !== cond));
    } else {
      setConditions([...conditions, cond]);
    }
  };

  const handleSave = async () => {
    try {
      await updateProfile({
        primaryGoal: goal,
        birthControlType: bcType,
        conditions: conditions,
      });
      router.back();
    } catch {
      setAlertState({ visible: true, title: 'Error', message: 'Failed to save health info. Please try again.' });
    }
  };

  const renderRadio = (selected: boolean) => (
    <View style={[styles.radio, selected && { borderColor: colors.brand.primary }]}>
      {selected && <View style={[styles.radioInner, { backgroundColor: colors.brand.primary }]} />}
    </View>
  );

  const renderCheckbox = (selected: boolean) => (
    <View style={[styles.checkbox, { borderColor: colors.borderSubtle }, selected && { backgroundColor: colors.brand.primary, borderColor: colors.brand.primary }]}>
      {selected && <Ionicons name="checkmark" size={16} color={colors.text.inverse} />}
    </View>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      
      <View style={styles.section}>
        <Text variant="caption" weight="bold" style={[styles.label, { color: colors.text.secondary }]}>
          PRIMARY GOAL
        </Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.borderSubtle }]}>
          {GOALS.map((g, i) => (
            <Pressable accessibilityRole="button" 
              key={g.value}
              style={[styles.row, i < GOALS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.borderSubtle }]}
              onPress={() => setGoal(g.value)}
            >
              <Text variant="body" style={{ color: colors.text.primary }}>{g.label}</Text>
              {renderRadio(goal === g.value)}
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text variant="caption" weight="bold" style={[styles.label, { color: colors.text.secondary }]}>
          BIRTH CONTROL TYPE
        </Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.borderSubtle }]}>
          {BIRTH_CONTROLS.map((bc, i) => (
            <Pressable accessibilityRole="button" 
              key={bc.value}
              style={[styles.row, i < BIRTH_CONTROLS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.borderSubtle }]}
              onPress={() => setBcType(bc.value as BirthControlType)}
            >
              <Text variant="body" style={{ color: colors.text.primary }}>{bc.label}</Text>
              {renderRadio(bcType === bc.value)}
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text variant="caption" weight="bold" style={[styles.label, { color: colors.text.secondary }]}>
          HEALTH CONDITIONS
        </Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.borderSubtle }]}>
          {CONDITIONS.map((cond, i) => (
            <Pressable accessibilityRole="button" 
              key={cond.value}
              style={[styles.row, i < CONDITIONS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.borderSubtle }]}
              onPress={() => toggleCondition(cond.value as MedicalCondition)}
            >
              <Text variant="body" style={{ color: colors.text.primary }}>{cond.label}</Text>
              {renderCheckbox(conditions.includes(cond.value as MedicalCondition))}
            </Pressable>
          ))}
        </View>
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
    marginBottom: spacing[6],
  },
  label: {
    marginBottom: spacing[2],
    marginLeft: spacing[1],
  },
  card: {
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing[4],
    minHeight: 56,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    marginTop: spacing[2],
  },
});

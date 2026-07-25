import { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

import { useTheme } from '@/presentation/hooks/useTheme';
import { spacing } from '@/design-system';
import { Text } from '@/presentation/components/ui/Text';
import { Heading } from '@/presentation/components/ui/Heading';
import { Button } from '@/presentation/components/ui/Button';

import { useDailyLogStore } from '@/presentation/stores/useDailyLogStore';
import { useCycleStore } from '@/presentation/stores/useCycleStore';
import { useContentStore } from '@/presentation/stores/useContentStore';
import type { FlowIntensity } from '@/domain/models';

import { FlowSelector } from '@/presentation/components/log/FlowSelector';
import { SectionCard } from '@/presentation/components/log/SectionCard';
import { SelectableChip } from '@/presentation/components/log/SelectableChip';
import { RangeSlider } from '@/presentation/components/log/RangeSlider';
import { DotRating } from '@/presentation/components/log/DotRating';


export default function LogScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { activeCycle } = useCycleStore();
  const { currentLog, saveLogData, isLoading, error } = useDailyLogStore();
  const { symptomsData } = useContentStore();

  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Local state for the form
  const [flow, setFlow] = useState<FlowIntensity | null>(null);
  const [moods, setMoods] = useState<string[]>([]);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [painLevel, setPainLevel] = useState<number | null>(null);
  const [energyLevel, setEnergyLevel] = useState<number | null>(null);
  const [sleepQuality, setSleepQuality] = useState<number | null>(null);
  
  const [prevLog, setPrevLog] = useState<any>(null);

  if (currentLog !== prevLog) {
    setPrevLog(currentLog);
    if (currentLog) {
      setFlow(currentLog.flowIntensity);
      setMoods(currentLog.moods);
      setSymptoms(currentLog.symptoms);
      setPainLevel(currentLog.painLevel);
      setEnergyLevel(currentLog.energyLevel);
      setSleepQuality(currentLog.sleepQuality);
    } else {
      setFlow(null);
      setMoods([]);
      setSymptoms([]);
      setPainLevel(null);
      setEnergyLevel(null);
      setSleepQuality(null);
    }
  }

  const toggleMood = (id: string) => {
    setMoods(prev => {
      if (prev.includes(id)) return prev.filter(m => m !== id);
      if (prev.length >= 5) return prev; // Max 5 moods
      return [...prev, id];
    });
  };

  const toggleSymptom = (id: string) => {
    setSymptoms(prev => {
      if (prev.includes(id)) return prev.filter(s => s !== id);
      return [...prev, id];
    });
  };

  const handleSave = async () => {
    try {
      const dateStr = date.toISOString().split('T')[0] || '';
      await saveLogData(dateStr, {
        flowIntensity: flow,
        moods,
        symptoms,
        painLevel,
        energyLevel,
        sleepQuality,
      });
      router.back();
    } catch {
      // Error is handled by the store and displayed in UI
    }
  };



  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={15}>
          <Feather name="arrow-left" size={24} color={colors.text.primary} />
        </Pressable>
        <Heading level="h2" style={{ color: colors.text.primary }}>Daily Log</Heading>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}>
        <View style={styles.datePickerContainer}>
          <Pressable accessibilityRole="button" 
            style={[styles.dateButton, { backgroundColor: colors.surface }]} 
            onPress={() => setShowDatePicker(true)}
          >
            <Feather name="calendar" size={18} color={colors.brand.primary} />
            <Text variant="body" weight="bold" style={{ color: colors.text.primary, marginLeft: spacing[2] }}>
              {date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
            </Text>
          </Pressable>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={(_, selectedDate) => {
              setShowDatePicker(Platform.OS === 'ios');
              if (selectedDate) {
                setDate(selectedDate);
                // In a real app, you would also trigger a loadLogForDate here
                useDailyLogStore.getState().loadLogForDate(selectedDate.toISOString().split('T')[0] || '');
              }
            }}
          />
        )}

        {/* Error Message */}
        {error && (
          <View style={[styles.errorContainer, { backgroundColor: `${colors.semantic.error}20` }]}>
            <Feather name="alert-circle" size={16} color={colors.semantic.error} style={{ marginRight: spacing[2] }} />
            <Text variant="caption" style={{ color: colors.semantic.error }}>{error}</Text>
          </View>
        )}

        {activeCycle && (
          <SectionCard title="Menstrual Flow" style={{ marginBottom: spacing[4] }}>
            <FlowSelector value={flow} onChange={setFlow} />
          </SectionCard>
        )}

        <SectionCard title="Moods" description="Select up to 5" style={{ marginBottom: spacing[4] }}>
          <View style={styles.chipContainer}>
            {symptomsData?.moods.map((mood) => (
              <SelectableChip
                key={mood.id}
                label={mood.label}
                icon={mood.icon as any}
                variant="mood"
                selected={moods.includes(mood.id)}
                onPress={() => toggleMood(mood.id)}
              />
            ))}
          </View>
        </SectionCard>

        <SectionCard title="Symptoms" style={{ marginBottom: spacing[4] }}>
          <View style={styles.chipContainer}>
            {symptomsData?.symptoms.map((symp) => (
              <SelectableChip
                key={symp.id}
                label={symp.label}
                variant="symptom"
                selected={symptoms.includes(symp.id)}
                onPress={() => toggleSymptom(symp.id)}
              />
            ))}
          </View>
        </SectionCard>

        <SectionCard title="Wellbeing" style={{ marginBottom: spacing[4] }}>
          <View style={styles.wellbeingItem}>
            <Text variant="label" style={{ color: colors.text.primary, marginBottom: spacing[2] }}>Pain Level</Text>
            <RangeSlider value={painLevel} onValueChange={setPainLevel} />
          </View>

          <View style={styles.wellbeingItem}>
            <Text variant="label" style={{ color: colors.text.primary, marginBottom: spacing[2] }}>Energy</Text>
            <DotRating value={energyLevel} onValueChange={setEnergyLevel} />
          </View>

          <View style={styles.wellbeingItem}>
            <Text variant="label" style={{ color: colors.text.primary, marginBottom: spacing[2] }}>Sleep Quality</Text>
            <DotRating value={sleepQuality} onValueChange={setSleepQuality} color={colors.brand.secondary} />
          </View>
        </SectionCard>
      </ScrollView>

      {/* Fixed Save Button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom || spacing[4], backgroundColor: colors.background, borderTopColor: colors.borderSubtleDark }]}>
        <Button 
          label="Save Log" 
          onPress={handleSave} 
          disabled={isLoading}
          loading={isLoading}
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[4],
  },
  scrollContent: {
    paddingHorizontal: spacing[4],
  },
  datePickerContainer: {
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: 20,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  wellbeingItem: {
    marginBottom: spacing[6],
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing[4],
    paddingTop: spacing[4],
    borderTopWidth: 1,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[3],
    borderRadius: 8,
    marginBottom: spacing[4],
  },
});

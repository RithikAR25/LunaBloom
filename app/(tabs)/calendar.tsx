import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/presentation/hooks/useTheme';
import { spacing } from '@/design-system';
import { useCycleStore } from '@/presentation/stores/useCycleStore';
import { CycleCalendar } from '@/presentation/components/calendar/CycleCalendar';
import { todayISO } from '@/utils/dateUtils';
import { Button } from '@/presentation/components/ui/Button';

/** Calendar Screen — Phase 1 */
export default function CalendarScreen() {
  const { colors } = useTheme();
  const { cycles, activeCycle, loadCycles, startPeriod, endPeriod, error, clearError } = useCycleStore();
  const [selectedDate, setSelectedDate] = useState<string | null>(todayISO());

  useEffect(() => {
    loadCycles();
  }, [loadCycles]);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [{ text: 'OK', onPress: clearError }]);
    }
  }, [error, clearError]);

  const handleSelectDate = (dateStr: string) => {
    setSelectedDate(dateStr);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.header, { padding: spacing[4] }]}>
          <Text style={[styles.title, { color: colors.text.primary }]}>Calendar</Text>
          <Text style={[styles.sub, { color: colors.text.secondary }]}>Your cycle history</Text>
        </View>

        <CycleCalendar
          cycles={cycles}
          selectedDate={selectedDate}
          onSelectDate={handleSelectDate}
        />

        <View style={[styles.actions, { padding: spacing[6] }]}>
          {selectedDate && (
            <Text style={[styles.selectedLabel, { color: colors.text.primary, marginBottom: spacing[4] }]}>
              Selected: {selectedDate}
            </Text>
          )}
          
          <Button
            label={activeCycle ? 'End Period' : 'Start Period'}
            variant={activeCycle ? 'secondary' : 'primary'}
            onPress={() => {
              if (activeCycle) {
                endPeriod(selectedDate || todayISO());
              } else {
                startPeriod(selectedDate || todayISO());
              }
            }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1 },
  header: { alignItems: 'center', gap: 4 },
  title: { fontSize: 24, fontWeight: '700' },
  sub: { fontSize: 15 },
  actions: { alignItems: 'center', marginTop: 16 },
  selectedLabel: { fontSize: 16, fontWeight: '500' },
});

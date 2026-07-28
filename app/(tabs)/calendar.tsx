import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/presentation/hooks/useTheme';
import { spacing } from '@/design-system';
import { useCycleStore } from '@/presentation/stores/useCycleStore';
import { useProfileStore } from '@/presentation/stores/useProfileStore';
import { CycleCalendar } from '@/presentation/components/calendar/CycleCalendar';
import { todayISO } from '@/utils/dateUtils';
import { Button } from '@/presentation/components/ui/Button';
import { ConfirmModal } from '@/presentation/components/ui/ConfirmModal';
import { EditCycleModal } from '@/presentation/components/calendar/EditCycleModal';
import type { CycleEntry } from '@/domain/models/Cycle';
import { ValidationService } from '@/domain/services/ValidationService';

/** Calendar Screen — Phase 1 */
export default function CalendarScreen() {
  const { colors } = useTheme();
  const { cycles, loadCycles, startPeriod, endPeriod, editCycle, deleteCycle, error, clearError } = useCycleStore();
  const { profile } = useProfileStore();
  const [selectedDate, setSelectedDate] = useState<string>(todayISO());

  interface WarningState {
    title: string;
    message: string;
    confirmLabel: string;
    onConfirm: () => void;
  }
  const [warningState, setWarningState] = useState<WarningState | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

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

  const getCycleForDate = (dateStr: string | null): CycleEntry | null => {
    if (!dateStr) return null;
    return cycles.find(c => {
      if (c.endDate) return dateStr >= c.startDate && dateStr <= c.endDate;
      return dateStr >= c.startDate;
    }) || null;
  };

  const selectedCycle = getCycleForDate(selectedDate);

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
          
          <View style={{ flexDirection: 'row', gap: spacing[4], justifyContent: 'center', width: '100%' }}>
            {selectedCycle ? (
              <>
                <View style={{ flex: 1 }}>
                  <Button
                    label="Edit Cycle"
                    variant="secondary"
                    onPress={() => setIsEditModalVisible(true)}
                  />
                </View>
                {!selectedCycle.endDate && (
                  <View style={{ flex: 1 }}>
                    <Button
                      label="End Period"
                      variant="primary"
                      onPress={async () => {
                        const endDate = selectedDate || todayISO();
                        const activeCycle = cycles.find(c => c.endDate === null);
                        
                        if (activeCycle) {
                          const validationService = new ValidationService();
                          const warnings = validationService.getWarnings(activeCycle.startDate, endDate, cycles, profile?.avgCycleLength, activeCycle.id);
                          
                          if (warnings.length > 0) {
                            const isMultiple = warnings.length > 1;
                            const firstWarning = warnings[0]!;
                            setWarningState({
                              title: isMultiple ? 'Unusual Patterns Detected' : firstWarning.title,
                              message: isMultiple 
                                ? 'These patterns can occur, but please confirm the dates are correct:\n\n' + warnings.map(w => `• ${w.message}`).join('\n')
                                : firstWarning.message,
                              confirmLabel: 'Save Anyway',
                              onConfirm: async () => {
                                try { await endPeriod(endDate); } catch {}
                              }
                            });
                            return;
                          }
                        }

                        try {
                          await endPeriod(endDate);
                        } catch {}
                      }}
                    />
                  </View>
                )}
              </>
            ) : (
              <View style={{ flex: 1 }}>
                <Button
                  label="Start Period"
                  variant="primary"
                  onPress={async () => {
                    const date = selectedDate || todayISO();
                    const validationService = new ValidationService();
                    const warnings = validationService.getWarnings(date, null, cycles, profile?.avgCycleLength);
                    
                    if (warnings.length > 0) {
                      const isMultiple = warnings.length > 1;
                      const firstWarning = warnings[0]!;
                      setWarningState({
                        title: isMultiple ? 'Unusual Patterns Detected' : firstWarning.title,
                        message: isMultiple 
                          ? 'These patterns can occur, but please confirm the dates are correct:\n\n' + warnings.map(w => `• ${w.message}`).join('\n')
                          : firstWarning.message,
                        confirmLabel: 'Save Anyway',
                        onConfirm: async () => {
                          try { await startPeriod(date); } catch {}
                        }
                      });
                    } else {
                      try {
                        await startPeriod(date);
                      } catch {}
                    }
                  }}
                />
              </View>
            )}
          </View>
        </View>

        <EditCycleModal
          visible={isEditModalVisible}
          cycle={selectedCycle}
          onClose={() => setIsEditModalVisible(false)}
          onSave={async (id, start, end, notes, isExcluded) => {
            try {
              await editCycle(id, start, end, notes ?? null, isExcluded);
            } catch {}
          }}
          onDelete={async (id) => {
            try {
              await deleteCycle(id);
            } catch {}
          }}
        />

        <ConfirmModal
          visible={!!warningState}
          title={warningState?.title || ''}
          message={warningState?.message || ''}
          confirmLabel={warningState?.confirmLabel || 'Save Anyway'}
          isDestructive={true}
          onConfirm={() => {
            warningState?.onConfirm();
            setWarningState(null);
          }}
          onCancel={() => {
            setWarningState(null);
          }}
        />
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

import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/presentation/hooks/useTheme';
import { spacing } from '@/design-system';
import { useCycleStore } from '@/presentation/stores/useCycleStore';
import { useProfileStore } from '@/presentation/stores/useProfileStore';
import { CycleCalendar } from '@/presentation/components/calendar/CycleCalendar';
import { todayISO } from '@/utils/dateUtils';
import { Button } from '@/presentation/components/ui/Button';
import { ConfirmModal } from '@/presentation/components/ui/ConfirmModal';
import { AlertModal } from '@/presentation/components/ui/AlertModal';
import { EditCycleModal } from '@/presentation/components/calendar/EditCycleModal';
import type { CycleEntry } from '@/domain/models/Cycle';
import { ValidationService } from '@/domain/services/ValidationService';
import type { ViewMode } from '@/presentation/components/calendar/ViewModeSlider';

/** Calendar Screen — Phase 1 */
export default function CalendarScreen() {
  const { colors } = useTheme();
  const { cycles, loadCycles, startPeriod, endPeriod, editCycle, deleteCycle } = useCycleStore();
  const { profile } = useProfileStore();
  const [selectedDate, setSelectedDate] = useState<string>(todayISO());

  const [alertState, setAlertState] = useState<{ visible: boolean; title: string; message: string; }>({
    visible: false,
    title: '',
    message: ''
  });

  interface WarningState {
    title: string;
    message: string;
    confirmLabel: string;
    onConfirm: () => void;
    showExclusionToggle?: boolean;
  }
  const [warningState, setWarningState] = useState<WarningState | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [includeInPredictions, setIncludeInPredictions] = useState(true);

  useEffect(() => {
    loadCycles();
  }, [loadCycles]);



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
        <CycleCalendar
          cycles={cycles}
          selectedDate={selectedDate}
          onSelectDate={handleSelectDate}
          onViewModeChange={setViewMode}
        />

        {viewMode === 'month' && (
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
                                try { await endPeriod(endDate, !includeInPredictions); } catch (err: any) { setAlertState({ visible: true, title: 'Error', message: err.message }); }
                              },
                              showExclusionToggle: true
                            });
                            return;
                          }
                        }

                        try {
                          await endPeriod(endDate);
                        } catch (err: any) {
                          setAlertState({ visible: true, title: 'Error', message: err.message });
                        }
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
                          try { await startPeriod(date, !includeInPredictions); } catch (err: any) { setAlertState({ visible: true, title: 'Error', message: err.message }); }
                        },
                        showExclusionToggle: true
                      });
                    } else {
                      try {
                        await startPeriod(date);
                      } catch (err: any) {
                        setAlertState({ visible: true, title: 'Error', message: err.message });
                      }
                    }
                  }}
                />
              </View>
            )}
          </View>
        </View>
        )}

        <EditCycleModal
          visible={isEditModalVisible}
          cycle={selectedCycle}
          onClose={() => setIsEditModalVisible(false)}
          onSave={async (id, start, end, notes, isExcluded) => {
            try {
              await editCycle(id, start, end, notes ?? null, isExcluded);
            } catch (err: any) {
              setAlertState({ visible: true, title: 'Error', message: err.message });
            }
          }}
          onDelete={async (id) => {
            try {
              await deleteCycle(id);
            } catch (err: any) {
              setAlertState({ visible: true, title: 'Error', message: err.message });
            }
          }}
        />

        <ConfirmModal
          visible={!!warningState}
          title={warningState?.title || ''}
          message={warningState?.message || ''}
          confirmLabel={warningState?.confirmLabel || 'Save Anyway'}
          isDestructive={true}
          onConfirm={() => {
            const confirmFn = warningState?.onConfirm;
            setWarningState(null);
            if (confirmFn) confirmFn();
            setIncludeInPredictions(true); // reset
          }}
          onCancel={() => {
            setWarningState(null);
            setIncludeInPredictions(true); // reset
          }}
        >
          {warningState?.showExclusionToggle && (
            <View style={[styles.toggleContainer, { borderColor: colors.surface }]}>
              <View style={styles.toggleTextContainer}>
                <Text style={{ color: colors.text.primary, fontWeight: '600' }}>Include in Predictions</Text>
                <Text style={{ color: colors.text.secondary, fontSize: 13, marginTop: 4, lineHeight: 18 }}>
                  Turn this off if this cycle is unusual so it doesn&apos;t skew your future predictions.
                </Text>
              </View>
              <Switch
                value={includeInPredictions}
                onValueChange={setIncludeInPredictions}
                trackColor={{ false: colors.surface, true: colors.brand.primary }}
                thumbColor={Platform.OS === 'android' ? colors.background : undefined}
              />
            </View>
          )}
        </ConfirmModal>
        <AlertModal
          visible={alertState.visible}
          type="error"
          title={alertState.title}
          message={alertState.message}
          onDismiss={() => setAlertState(prev => ({ ...prev, visible: false }))}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1 },
  actions: { alignItems: 'center', marginTop: 16 },
  selectedLabel: { fontSize: 16, fontWeight: '500' },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
  },
  toggleTextContainer: {
    flex: 1,
    paddingRight: spacing.md,
  },
});

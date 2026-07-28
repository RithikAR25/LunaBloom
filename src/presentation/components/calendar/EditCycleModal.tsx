import { useState } from 'react';
import { View, StyleSheet, Modal, Platform, TouchableOpacity, ScrollView, Switch } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '@/presentation/hooks/useTheme';
import { spacing, borderRadius } from '@/design-system';
import { Text } from '../ui/Text';
import { Button } from '../ui/Button';
import type { CycleEntry } from '@/domain/models/Cycle';
import { ValidationService } from '@/domain/services/ValidationService';
import { ConfirmModal } from '../ui/ConfirmModal';
import { useCycleStore } from '@/presentation/stores/useCycleStore';
import { useProfileStore } from '@/presentation/stores/useProfileStore';

interface EditCycleModalProps {
  visible: boolean;
  cycle: CycleEntry | null;
  onClose: () => void;
  onSave: (id: string, startDate: string, endDate: string | null, notes?: string | null, isExcludedFromPredictions?: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function EditCycleModal({ visible, cycle, onClose, onSave, onDelete }: EditCycleModalProps) {
  const { colors } = useTheme();
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(null);
  
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [includeInPredictions, setIncludeInPredictions] = useState(true);

  const [startDateError, setStartDateError] = useState('');
  const [endDateError, setEndDateError] = useState('');
  const validationService = new ValidationService();

  interface WarningState {
    title: string;
    message: string;
    confirmLabel: string;
    onConfirm: () => void;
  }
  const [warningState, setWarningState] = useState<WarningState | null>(null);

  const [prevVisible, setPrevVisible] = useState(false);
  const [prevCycleId, setPrevCycleId] = useState<string | null>(null);

  if (visible && (!prevVisible || (cycle && cycle.id !== prevCycleId))) {
    setPrevVisible(true);
    if (cycle) {
      setPrevCycleId(cycle.id);
      setStartDate(new Date(cycle.startDate + 'T00:00:00'));
      setEndDate(cycle.endDate ? new Date(cycle.endDate + 'T00:00:00') : null);
      setIncludeInPredictions(!cycle.isExcludedFromPredictions);
    }
  } else if (!visible && prevVisible) {
    setPrevVisible(false);
  }

  if (!cycle) return null;

  const formatDate = (date: Date | null) => {
    if (!date) return 'Select Date';
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const handleSave = async () => {
    setStartDateError('');
    setEndDateError('');
    let hasError = false;

    const startStr = formatDate(startDate);
    const endStr = endDate ? formatDate(endDate) : null;

    const startRes = validationService.validateHistoricalDate(startStr);
    if (!startRes.isValid) {
      setStartDateError(startRes.error!);
      hasError = true;
    }

    if (endStr) {
      const endRes = validationService.validateHistoricalDate(endStr);
      if (!endRes.isValid) {
        setEndDateError(endRes.error!);
        hasError = true;
      }
      if (endStr < startStr) {
        setEndDateError('End date cannot be before start date.');
        hasError = true;
      }
    }

    if (hasError) return;

    const { cycles } = useCycleStore.getState();
    const { profile } = useProfileStore.getState();
    const warnings = validationService.getWarnings(startStr, endStr, cycles, profile?.avgCycleLength, cycle.id);
    
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
          setIsSaving(true);
          try {
            await onSave(cycle.id, startStr, endStr, cycle.notes, !includeInPredictions);
            onClose();
          } catch {
            // Error handled by store/parent
          } finally {
            setIsSaving(false);
          }
        }
      });
      return;
    }

    setIsSaving(true);
    try {
      await onSave(cycle.id, startStr, endStr, cycle.notes, !includeInPredictions);
      onClose();
    } catch {
      // Error handled by the store and parent
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsSaving(true);
    try {
      await onDelete(cycle.id);
      onClose();
    } catch {
      // Handled
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <Text variant="body" weight="bold" style={[styles.title, { color: colors.text.primary }]}>
            Edit Cycle
          </Text>

          <ScrollView style={styles.form}>
            {/* Start Date */}
            <View style={styles.field}>
              <Text style={{ color: colors.text.secondary, marginBottom: spacing[2] }}>Start Date</Text>
              {Platform.OS === 'ios' ? (
                <DateTimePicker
                  value={startDate}
                  mode="date"
                  display="default"
                  onChange={(_event, date) => { if (date) setStartDate(date); }}
                  maximumDate={new Date()}
                />
              ) : (
                <View>
                  <Button
                    variant="secondary"
                    label={formatDate(startDate)}
                    onPress={() => setShowStartPicker(true)}
                  />
                  {showStartPicker && (
                    <DateTimePicker
                      value={startDate}
                      mode="date"
                      display="default"
                      onChange={(_event, date) => {
                        setShowStartPicker(false);
                        if (date) setStartDate(date);
                      }}
                      maximumDate={new Date()}
                    />
                  )}
                </View>
              )}
              {!!startDateError && <Text variant="caption" style={{ color: colors.semantic.error, marginTop: spacing[1] }}>{startDateError}</Text>}
            </View>

            {/* End Date */}
            <View style={styles.field}>
              <Text style={{ color: colors.text.secondary, marginBottom: spacing[2] }}>End Date (Optional)</Text>
              {Platform.OS === 'ios' ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <DateTimePicker
                    value={endDate || new Date()}
                    mode="date"
                    display="default"
                    onChange={(_event, date) => { if (date) setEndDate(date); }}
                    maximumDate={new Date()}
                  />
                  <TouchableOpacity accessibilityRole="button" onPress={() => setEndDate(null)}>
                    <Text style={{ color: colors.semantic.error }}>Clear</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View>
                  <Button
                    variant="secondary"
                    label={formatDate(endDate)}
                    onPress={() => setShowEndPicker(true)}
                  />
                  {endDate && (
                    <TouchableOpacity accessibilityRole="button" onPress={() => setEndDate(null)} style={{ marginTop: spacing[2] }}>
                      <Text style={{ color: colors.semantic.error, textAlign: 'center' }}>Clear End Date</Text>
                    </TouchableOpacity>
                  )}
                  {showEndPicker && (
                    <DateTimePicker
                      value={endDate || new Date()}
                      mode="date"
                      display="default"
                      onChange={(_event, date) => {
                        setShowEndPicker(false);
                        if (date) setEndDate(date);
                      }}
                      maximumDate={new Date()}
                    />
                  )}
                </View>
              )}
              {!!endDateError && <Text variant="caption" style={{ color: colors.semantic.error, marginTop: spacing[1] }}>{endDateError}</Text>}
            </View>

            {/* Prediction Exclusion Toggle */}
            <View style={[styles.field, styles.toggleContainer]}>
              <View style={styles.toggleTextContainer}>
                <Text style={{ color: colors.text.primary, fontWeight: '600' }}>Include in Predictions</Text>
                <Text style={{ color: colors.text.secondary, fontSize: 13, marginTop: 4, lineHeight: 18 }}>
                  Turn this off if this cycle was unusually short or long so it doesn&apos;t skew your average cycle predictions.
                </Text>
              </View>
              <Switch
                value={includeInPredictions}
                onValueChange={setIncludeInPredictions}
                trackColor={{ false: colors.surface, true: colors.brand.primary }}
                thumbColor={Platform.OS === 'android' ? colors.background : undefined}
              />
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Button
              variant="danger"
              label="Delete"
              onPress={handleDelete}
              disabled={isSaving}
            />
            <View style={styles.footerRight}>
              <Button
                variant="secondary"
                label="Cancel"
                onPress={onClose}
                disabled={isSaving}
              />
              <Button
                variant="primary"
                label="Save"
                onPress={handleSave}
                loading={isSaving}
                disabled={isSaving}
              />
            </View>
          </View>
        </View>
      </View>
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
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing[6],
    maxHeight: '80%',
  },
  title: {
    fontSize: 20,
    marginBottom: spacing[6],
  },
  form: {
    marginBottom: spacing[6],
  },
  field: {
    marginBottom: spacing[6],
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: spacing[8],
  },
  footerRight: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[2],
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  toggleTextContainer: {
    flex: 1,
    paddingRight: spacing[4],
  }
});

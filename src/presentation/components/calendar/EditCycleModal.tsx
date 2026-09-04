import { useState, useEffect, useMemo, useRef } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, ScrollView, Switch, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/presentation/hooks/useTheme';
import { spacing, borderRadius, fontFamily, fontSize } from '@/design-system';
import { Text } from '../ui/Text';
import type { CycleEntry } from '@/domain/models/Cycle';
import { ValidationService } from '@/domain/services/ValidationService';
import { ConfirmModal } from '../ui/ConfirmModal';
import { useCycleStore } from '@/presentation/stores/useCycleStore';
import { useProfileStore } from '@/presentation/stores/useProfileStore';
import { DateRangePickerGrid } from './DateRangePickerGrid';
import { formatDateShort, isAfter, isBefore, daysBetween } from '@/utils/dateUtils';

interface EditCycleModalProps {
  visible: boolean;
  cycle: CycleEntry | null;
  onClose: () => void;
  onSave: (id: string, startDate: string, endDate: string | null, notes?: string | null, isExcludedFromPredictions?: boolean, confirmMerge?: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

type TabType = 'From' | 'To';

export function EditCycleModal({ visible, cycle, onClose, onSave, onDelete }: EditCycleModalProps) {
  const { colors } = useTheme();

  // Local UI State
  const [activeTab, setActiveTab] = useState<TabType>('From');
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  
  // Temporary Date Range State (stored as ISO strings: YYYY-MM-DD)
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  
  const [includeInPredictions, setIncludeInPredictions] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [startDateError, setStartDateError] = useState('');
  const [endDateError, setEndDateError] = useState('');

  const draggingBoundaryRef = useRef<'start' | 'end' | null>(null);

  const validationService = useMemo(() => new ValidationService(), []);

  interface WarningState {
    title: string;
    message: string;
    confirmLabel: string;
    onConfirm: () => void;
  }
  const [warningState, setWarningState] = useState<WarningState | null>(null);

  // Initialize/Reset State when modal opens or cycle changes
  useEffect(() => {
    if (visible && cycle) {
      setStartDate(cycle.startDate);
      setEndDate(cycle.endDate || null);
      setIncludeInPredictions(!cycle.isExcludedFromPredictions);
      setActiveTab('From');
      
      const parts = cycle.startDate.split('-');
      if (parts.length >= 3) {
        setCurrentMonth(new Date(parseInt(parts[0]!, 10), parseInt(parts[1]!, 10) - 1, 1));
      } else {
        setCurrentMonth(new Date());
      }
      
      setStartDateError('');
      setEndDateError('');
    } else if (!visible) {
      // Clear warnings and errors when closed
      setWarningState(null);
      setStartDateError('');
      setEndDateError('');
    }
  }, [visible, cycle]);

  if (!cycle) return null;

  const handleDateSelect = (dateStr: string) => {
    // 1. Intent Detection for existing boundaries
    const isTappingExistingStart = Boolean(startDate && dateStr === startDate);
    const isTappingExistingEnd = Boolean(endDate && dateStr === endDate);

    // Handle 1-day cycles where Start == End
    if (isTappingExistingStart && isTappingExistingEnd) {
      return; // Keep current active tab and do not modify dates
    }

    // Switch to FROM if they tapped the start boundary
    if (isTappingExistingStart && activeTab !== 'From') {
      setActiveTab('From');
      return; // Stop here, don't change any dates
    }
    
    // Switch to TO if they tapped the end boundary
    if (isTappingExistingEnd && activeTab !== 'To') {
      setActiveTab('To');
      return; // Stop here, don't change any dates
    }

    setStartDateError('');
    setEndDateError('');

    if (activeTab === 'From') {
      // Picking a new From date
      if (endDate && isAfter(dateStr, endDate)) {
        // new start > current end → clear temporary end, switch to To
        setStartDate(dateStr);
        setEndDate(null);
        setActiveTab('To');
      } else {
        // new start <= current end → keep end, switch to To
        setStartDate(dateStr);
        setActiveTab('To');
      }
    } else {
      // Picking a new To date
      if (startDate && isBefore(dateStr, startDate)) {
        // new end < current start → do not accept selection
        // Guide user by switching back to From
        setActiveTab('From');
        setStartDate(dateStr);
        setEndDate(null);
      } else {
        setEndDate(dateStr);
      }
    }
  };

  const handleDragBoundary = (draggedBoundary: 'start' | 'end', newDateStr: string) => {
    setStartDateError('');
    setEndDateError('');

    const activeBoundary = draggingBoundaryRef.current || draggedBoundary;
    if (!draggingBoundaryRef.current) {
      draggingBoundaryRef.current = activeBoundary;
    }

    if (activeBoundary === 'start') {
      if (endDate && isAfter(newDateStr, endDate)) {
        // FLIP forward: dragging start past end
        setStartDate(endDate);
        setEndDate(newDateStr);
        draggingBoundaryRef.current = 'end';
        setActiveTab('To');
      } else {
        setStartDate(newDateStr);
      }
    } else {
      if (startDate && isBefore(newDateStr, startDate)) {
        // FLIP backward: dragging end before start
        setEndDate(startDate);
        setStartDate(newDateStr);
        draggingBoundaryRef.current = 'start';
        setActiveTab('From');
      } else {
        setEndDate(newDateStr);
      }
    }
  };

  const handleDragEnd = () => {
    draggingBoundaryRef.current = null;
  };

  const handlePrevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleSave = async () => {
    setStartDateError('');
    setEndDateError('');
    let hasError = false;

    if (!startDate) {
      setStartDateError('Start date is required.');
      return;
    }

    // UI-only checks before proceeding to domain
    const startRes = validationService.validateHistoricalDate(startDate);
    if (!startRes.isValid) {
      setStartDateError(startRes.error!);
      hasError = true;
    }

    if (endDate) {
      const endRes = validationService.validateHistoricalDate(endDate);
      if (!endRes.isValid) {
        setEndDateError(endRes.error!);
        hasError = true;
      }
      if (isBefore(endDate, startDate)) {
        setEndDateError('End date cannot be before start date.');
        hasError = true;
      }
    }

    if (hasError) return;

    const executeSave = async (confirmMerge = false) => {
      setIsSaving(true);
      try {
        await onSave(cycle.id, startDate, endDate, cycle.notes, !includeInPredictions, confirmMerge);
        onClose();
      } catch (err: any) {
        if (err.name === 'MergeRequiredError') {
          const N = err.overlappingCycleIds?.length || 1;
          setWarningState({
            title: 'Merge Periods',
            message: `This change overlaps with ${N} existing logged period(s). They will be merged into a single continuous period. Existing notes and daily logs will be preserved.`,
            confirmLabel: 'Merge',
            onConfirm: () => executeSave(true)
          });
        }
      } finally {
        setIsSaving(false);
      }
    };

    // Soft Warnings (preserved ownership)
    const { cycles } = useCycleStore.getState();
    const { profile } = useProfileStore.getState();
    const warnings = validationService.getWarnings(startDate, endDate, cycles, profile?.avgCycleLength, cycle.id);
    
    if (warnings.length > 0) {
      const isMultiple = warnings.length > 1;
      const firstWarning = warnings[0]!;
      setWarningState({
        title: isMultiple ? 'Unusual Patterns Detected' : firstWarning.title,
        message: isMultiple 
          ? 'These patterns can occur, but please confirm the dates are correct:\n\n' + warnings.map(w => `• ${w.message}`).join('\n')
          : firstWarning.message,
        confirmLabel: 'Save Anyway',
        onConfirm: () => executeSave(false)
      });
      return;
    }

    // Hard Domain validation and execution
    await executeSave(false);
  };

  const handleDelete = async () => {
    setIsSaving(true);
    try {
      await onDelete(cycle.id);
      onClose();
    } catch {
      // Handled by parent
    } finally {
      setIsSaving(false);
    }
  };

  const formatMonthYear = (date: Date) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.card, { backgroundColor: colors.background }]}>
          


          {/* Header */}
          <View style={styles.header}>
            <Text weight="bold" style={{ color: colors.text.primary, fontFamily: fontFamily.bold, fontSize: 24, letterSpacing: -0.5 }}>
              Edit Cycle
            </Text>
            <TouchableOpacity onPress={onClose} style={[styles.closeButton, { backgroundColor: colors.surface }]}>
              <Text style={{ color: colors.text.secondary, fontSize: 16, fontWeight: 'bold' }}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form} bounces={false} showsVerticalScrollIndicator={false}>
            {/* Date Range Cards */}
            <View style={styles.dateCardsRow}>
              {/* Start Date Card */}
              <Pressable 
                style={[
                  styles.dateCard, 
                  { backgroundColor: colors.background, borderColor: activeTab === 'From' ? colors.brand.primary : colors.border },
                  activeTab === 'From' && { borderWidth: 2 }
                ]}
                onPress={() => setActiveTab('From')}
              >
                <View style={styles.dateCardHeader}>
                  <Text style={[styles.dateCardLabel, { color: activeTab === 'From' ? colors.brand.primary : colors.text.secondary }]}>FROM</Text>
                  <View style={[styles.dot, { backgroundColor: activeTab === 'From' ? colors.brand.primary : colors.border }]} />
                </View>
                <Text style={[styles.dateCardValue, { color: colors.text.primary }]}>
                  {startDate ? formatDateShort(startDate) : 'Select Date'}
                </Text>
                {startDate && (
                  <Text style={[styles.dateCardSubtext, { color: colors.text.secondary }]}>
                    Cycle Day 1
                  </Text>
                )}
              </Pressable>

              {/* End Date Card */}
              <Pressable 
                style={[
                  styles.dateCard, 
                  { backgroundColor: colors.background, borderColor: activeTab === 'To' ? colors.brand.primary : colors.border },
                  activeTab === 'To' && { borderWidth: 2 }
                ]}
                onPress={() => setActiveTab('To')}
              >
                <View style={styles.dateCardHeader}>
                  <Text style={[styles.dateCardLabel, { color: activeTab === 'To' ? colors.brand.primary : colors.text.secondary }]}>TO</Text>
                  <View style={[styles.dot, { backgroundColor: activeTab === 'To' ? colors.brand.primary : colors.border }]} />
                </View>
                <Text style={[styles.dateCardValue, { color: colors.text.primary }]}>
                  {endDate ? formatDateShort(endDate) : 'Ongoing'}
                </Text>
                {startDate && endDate && (
                  <Text style={[styles.dateCardSubtext, { color: colors.text.secondary }]}>
                    {daysBetween(startDate, endDate) + 1} Day Duration
                  </Text>
                )}
              </Pressable>
            </View>

            {/* Clear End Date Pill */}
            <View style={{ alignItems: 'center', marginBottom: spacing[5] }}>
              {endDate && (
                <TouchableOpacity 
                  accessibilityRole="button" 
                  onPress={() => setEndDate(null)} 
                  style={[styles.clearEndPill, { backgroundColor: colors.brand.secondaryContainer }]}
                >
                  <Feather name="x-circle" size={14} color={colors.brand.primary} />
                  <Text style={{ color: colors.brand.primary, fontSize: fontSize.caption, fontFamily: fontFamily.semiBold }}>
                    Mark as Ongoing (Clear End Date)
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Errors */}
            {!!startDateError && <Text variant="caption" style={{ color: colors.semantic.error, marginBottom: spacing[2], textAlign: 'center' }}>{startDateError}</Text>}
            {!!endDateError && <Text variant="caption" style={{ color: colors.semantic.error, marginBottom: spacing[2], textAlign: 'center' }}>{endDateError}</Text>}

            {/* Calendar Card */}
            <View style={[styles.calendarCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
              {/* Month Navigation */}
              <View style={styles.monthNav}>
                <TouchableOpacity onPress={handlePrevMonth} style={[styles.navButton]}>
                  <Text style={{ color: colors.text.secondary, fontSize: 24, fontWeight: 'bold' }}>‹</Text>
                </TouchableOpacity>
                <Text style={{ color: colors.text.primary, fontFamily: fontFamily.bold, fontSize: fontSize.bodyLg }}>
                  {formatMonthYear(currentMonth)}
                </Text>
                <TouchableOpacity onPress={handleNextMonth} style={[styles.navButton]}>
                  <Text style={{ color: colors.text.secondary, fontSize: 24, fontWeight: 'bold' }}>›</Text>
                </TouchableOpacity>
              </View>

              <DateRangePickerGrid
                currentMonth={currentMonth}
                startDate={startDate}
                endDate={endDate}
                onSelectDate={handleDateSelect}
                onDragBoundary={handleDragBoundary}
                onDragEnd={handleDragEnd}
              />
            </View>

            {/* Prediction Exclusion Toggle */}
            <View style={[styles.toggleContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.toggleTextContainer}>
                <Text style={{ color: colors.text.primary, fontFamily: fontFamily.bold, fontSize: fontSize.labelMd }}>Include in Predictions</Text>
                <Text style={{ color: colors.text.secondary, fontSize: 12, marginTop: 4, lineHeight: 18 }}>
                  Turn this off if this cycle was unusually short or long so it doesn&apos;t skew your averages.
                </Text>
              </View>
              <Switch
                value={includeInPredictions}
                onValueChange={setIncludeInPredictions}
                trackColor={{ false: colors.border, true: colors.brand.primary }}
                thumbColor={colors.background}
              />
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.footer}>
            <TouchableOpacity 
              style={[styles.footerBtn, styles.deleteBtn, { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)' }]} 
              onPress={handleDelete}
              disabled={isSaving}
            >
              <Feather name="trash-2" size={16} color={colors.semantic.error} />
              <Text style={[styles.footerBtnText, { color: colors.semantic.error }]}>Delete</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.footerBtn, styles.cancelBtn, { backgroundColor: colors.surface, borderColor: colors.border }]} 
              onPress={onClose}
              disabled={isSaving}
            >
              <Text style={[styles.footerBtnText, { color: colors.text.primary }]}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.footerBtn, styles.saveBtn, { backgroundColor: colors.brand.primary }]} 
              onPress={handleSave}
              disabled={isSaving}
            >
              <Text style={[styles.footerBtnText, { color: '#FFF' }]}>{isSaving ? 'Saving...' : 'Save Changes'}</Text>
            </TouchableOpacity>
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
    justifyContent: 'center', 
    alignItems: 'center',
    padding: spacing[4],
  },
  card: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 32, // Match rounded-3xl from Stitch
    padding: spacing[6],
    paddingTop: spacing[4],
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[5],
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  form: {
    flexShrink: 1,
    marginBottom: spacing[2],
  },
  dateCardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing[3],
    gap: spacing[3],
  },
  dateCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  dateCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[1],
  },
  dateCardLabel: {
    fontFamily: fontFamily.semiBold,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dateCardValue: {
    fontFamily: fontFamily.bold,
    fontSize: 20,
  },
  dateCardSubtext: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    marginTop: 2,
  },
  clearEndPill: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  calendarCard: {
    borderWidth: 1,
    borderRadius: borderRadius.xl,
    paddingTop: spacing[4],
    paddingRight: spacing[4],
    paddingBottom: spacing[2],
    paddingLeft: spacing[4],
    marginBottom: spacing[5],
  },
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
    paddingHorizontal: spacing[2],
  },
  navButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    marginBottom: spacing[1],
  },
  toggleTextContainer: {
    flex: 1,
    paddingRight: spacing[4],
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginTop: spacing[4],
  },
  footerBtn: {
    paddingVertical: spacing[2],
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing[1],
  },
  deleteBtn: {
    flex: 3,
    borderWidth: 1,
  },
  cancelBtn: {
    flex: 4,
    borderWidth: 1,
  },
  saveBtn: {
    flex: 5,
  },
  footerBtnText: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.labelMd,
  }
});

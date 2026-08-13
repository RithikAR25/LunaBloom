import { useState, useMemo, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { FadeIn, FadeOut, Keyframe, runOnJS } from 'react-native-reanimated';
import { CalendarHeader } from './CalendarHeader';
import { CalendarGrid, CalendarDayData } from './CalendarGrid';
import { CalendarLegend } from './CalendarLegend';
import { YearCalendar } from './YearCalendar';
import { ViewModeSlider, ViewMode } from './ViewModeSlider';
import { DayState } from './DayCell';
import type { CycleEntry } from '../../../domain/models/Cycle';
import { todayISO } from '../../../utils/dateUtils';
import { useProfileStore } from '../../../presentation/stores/useProfileStore';
import { PredictionEngine } from '../../../domain/prediction';

// ── Zooming OUT (Month → Year) ──
const ZoomOutMonth = new Keyframe({
  0: { transform: [{ scale: 1 }], opacity: 1 },
  100: { transform: [{ scale: 0.95 }], opacity: 0 },
}).duration(200);

const ZoomInYear = new Keyframe({
  0: { transform: [{ scale: 0.95 }], opacity: 0 },
  100: { transform: [{ scale: 1 }], opacity: 1 },
}).duration(300);

// ── Zooming IN (Year → Month) ──
const ZoomOutYear = new Keyframe({
  0: { transform: [{ scale: 1 }], opacity: 1 },
  100: { transform: [{ scale: 1.05 }], opacity: 0 },
}).duration(200);

const ZoomInMonth = new Keyframe({
  0: { transform: [{ scale: 1.05 }], opacity: 0 },
  100: { transform: [{ scale: 1 }], opacity: 1 },
}).duration(300);

type TransitionType = 'fade' | 'zoom-out' | 'zoom-in';

interface CycleCalendarProps {
  cycles: CycleEntry[];
  selectedDate: string | null;
  onSelectDate: (dateStr: string) => void;
  onViewModeChange?: (mode: ViewMode) => void;
}

export function CycleCalendar({ cycles, selectedDate, onSelectDate, onViewModeChange }: CycleCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [transitionType, setTransitionType] = useState<TransitionType>('fade');

  // Reset to current month + Month view on every tab focus (existing behaviour preserved)
  useFocusEffect(
    useCallback(() => {
      setCurrentMonth(new Date());
      setViewMode('month');
      onViewModeChange?.('month');
    }, [onViewModeChange])
  );

  const profile = useProfileStore((s) => s.profile);
  const avgCycleLength = profile?.avgCycleLength || 28;
  const avgPeriodDuration = profile?.avgPeriodDuration || 5;

  // ── Stable engine instance ──────────────────────────────────────────────────
  // PredictionEngine is stateless for getPhaseForDate — safe to memoize once.
  const engine = useMemo(() => new PredictionEngine(), []);

  // ── Timeline (recomputed when cycles or profile change, NOT on month/view) ──
  const timelineData = useMemo(() => {
    return engine.generateTimeline(cycles, avgCycleLength, avgPeriodDuration);
  }, [engine, cycles, avgCycleLength, avgPeriodDuration]);

  // ── Monthly grid (recomputed when month or timelineData changes) ────────────
  const days = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const result: (CalendarDayData | null)[] = [];

    // Leading padding cells
    for (let i = 0; i < firstDayOfWeek; i++) {
      result.push(null);
    }

    for (let i = 1; i <= totalDays; i++) {
      const d = new Date(Date.UTC(year, month, i));
      const dateStr = d.toISOString().split('T')[0]!;
      const phaseInfo = engine.getPhaseForDate(dateStr, timelineData);

      let state: DayState = 'none';
      if (phaseInfo.isPredictedMenstrual) {
        state = 'predicted_menstrual';
      } else {
        switch (phaseInfo.phase) {
          case 'MENSTRUAL': state = 'menstrual'; break;
          case 'FOLLICULAR': state = 'follicular'; break;
          case 'OVULATION': state = 'ovulatory'; break;
          case 'LUTEAL': state = 'luteal'; break;
        }
      }

      result.push({
        dateStr,
        dayNumber: i,
        state,
        fertilityStatus: phaseInfo.fertilityStatus,
        source: phaseInfo.source,
      });
    }

    return result;
  }, [currentMonth, engine, timelineData]);

  // ── Navigation ──────────────────────────────────────────────────────────────
  // Year mode: < / > navigate by year while preserving the month position.
  // Month mode: < / > navigate by month as before.
  const handlePrevMonth = useCallback(() => {
    setTransitionType('fade');
    if (viewMode === 'year') {
      setCurrentMonth(prev => new Date(prev.getFullYear() - 1, prev.getMonth(), 1));
    } else {
      setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    }
  }, [viewMode]);

  const handleNextMonth = useCallback(() => {
    setTransitionType('fade');
    if (viewMode === 'year') {
      setCurrentMonth(prev => new Date(prev.getFullYear() + 1, prev.getMonth(), 1));
    } else {
      setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    }
  }, [viewMode]);

  // ── Year view date selection ─────────────────────────────────────────────────
  // Tapping a date in Year view: select it, navigate to its month, switch to Month view.
  const handleYearDateSelect = useCallback((dateStr: string) => {
    onSelectDate(dateStr);
    const parts = dateStr.split('-');
    const year = parseInt(parts[0]!, 10);
    const month = parseInt(parts[1]!, 10) - 1; // 0-indexed
    setCurrentMonth(new Date(year, month, 1));
    setTransitionType('zoom-in');
    setViewMode('month');
    onViewModeChange?.('month');
  }, [onSelectDate, onViewModeChange]);

  // ── Swipe gesture (Applies to both Month and Year modes) ────────────────────
  const pan = useMemo(
    () =>
      Gesture.Pan().onEnd((e) => {
        if (e.translationX > 50) {
          runOnJS(handlePrevMonth)();
        } else if (e.translationX < -50) {
          runOnJS(handleNextMonth)();
        }
      }),
    [handlePrevMonth, handleNextMonth]
  );

  return (
    <View style={styles.container}>
      <ViewModeSlider 
        value={viewMode} 
        onChange={(mode) => {
          setTransitionType(mode === 'year' ? 'zoom-out' : 'zoom-in');
          setViewMode(mode);
          onViewModeChange?.(mode);
        }} 
      />

      <CalendarHeader
        currentMonth={currentMonth}
        viewMode={viewMode}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onDateChange={setCurrentMonth}
      />

      {viewMode === 'month' ? (
        <GestureDetector gesture={pan}>
          <Animated.View
            key={currentMonth.toISOString()}
            entering={transitionType === 'zoom-in' ? ZoomInMonth : FadeIn.duration(300)}
            exiting={transitionType === 'zoom-out' ? ZoomOutMonth : FadeOut.duration(300)}
          >
            <CalendarGrid
              days={days}
              selectedDate={selectedDate}
              todayDate={todayISO()}
              onSelectDate={onSelectDate}
            />
            <CalendarLegend />
          </Animated.View>
        </GestureDetector>
      ) : (
        <GestureDetector gesture={pan}>
          <Animated.View
            key={currentMonth.getFullYear().toString()}
            entering={transitionType === 'zoom-out' ? ZoomInYear : FadeIn.duration(300)}
            exiting={transitionType === 'zoom-in' ? ZoomOutYear : FadeOut.duration(300)}
          >
            <YearCalendar
              year={currentMonth.getFullYear()}
              timelineData={timelineData}
              selectedDate={selectedDate}
              onSelectDate={handleYearDateSelect}
            />
          </Animated.View>
        </GestureDetector>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});

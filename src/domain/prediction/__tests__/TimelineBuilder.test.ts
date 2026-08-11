import { CyclePredictionService } from '../services/CyclePredictionService';
import { TimelineBuilder } from '../services/TimelineBuilder';
import type { CycleEntry } from '../../models/Cycle';
import { addDays } from '../../../utils/dateUtils';

describe('TimelineBuilder - Active Cycle & Prediction Gating', () => {
  let predictionService: CyclePredictionService;
  let builder: TimelineBuilder;
  const baseDate = '2026-08-11';
  const avgCycleLength = 28;
  const defaultPeriodDuration = 5;

  beforeEach(() => {
    predictionService = new CyclePredictionService();
    builder = new TimelineBuilder(predictionService);
  });

  const createCycle = (startDate: string, endDate: string | null = null, cycleLengthDays: number | null = null): CycleEntry => ({
    id: `cycle-${startDate}`,
    startDate,
    endDate,
    durationDays: endDate ? (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24) + 1 : null,
    cycleLengthDays,
    notes: null,
    isExcludedFromPredictions: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    syncStatus: 'LOCAL',
  });

  // A helper to easily check the timeline output
  const runMatrixTest = (state: 'Active' | 'Completed', day: number) => {
    const isCompleted = state === 'Completed';
    // If completed, the endDate is Day N. If active, endDate is null.
    const endDate = isCompleted ? addDays(baseDate, day - 1) : null;
    const cycles = [createCycle(baseDate, endDate, null)];
    // Mock prediction with some fixed values based on 28-day cycle
    const prediction = predictionService.predict(cycles, avgCycleLength, defaultPeriodDuration)!;
    
    // The reference date is Day N
    const referenceDate = addDays(baseDate, day - 1);

    const { events, intervals } = builder.build(cycles, prediction, referenceDate, defaultPeriodDuration);

    const menstrualDays = intervals
      .filter(i => i.phase === 'MENSTRUAL' && i.source === 'LOGGED')
      .reduce((total, i) => total + (new Date(i.endDate).getTime() - new Date(i.startDate).getTime()) / (1000 * 60 * 60 * 24) + 1, 0);

    const hasPredictions = intervals.some(i => i.source === 'PREDICTED') || events.some(e => e.source === 'PREDICTED');
    
    // Check exact MENSTRUAL dates to prevent off-by-one errors
    const loggedMenstrualInterval = intervals.find(i => i.phase === 'MENSTRUAL' && i.source === 'LOGGED')!;
    
    return {
      menstrualDays,
      hasPredictions,
      startDate: loggedMenstrualInterval.startDate,
      endDate: loggedMenstrualInterval.endDate
    };
  };

  describe('Boundary Rules (Active vs Completed)', () => {
    it.each([
      ['Active', 1, 1, false],
      ['Active', 2, 2, false],
      ['Active', 3, 3, false],
      ['Active', 4, 4, false],
      ['Active', 5, 5, true],
      ['Active', 7, 5, true],
      ['Completed', 3, 3, true],
      ['Completed', 5, 5, true],
      ['Completed', 7, 7, true],
    ] as const)('%s Cycle Day %i -> %i menstrual days, predictions: %s', (state, day, expectedDays, expectedPredictions) => {
      const result = runMatrixTest(state, day);
      
      expect(result.menstrualDays).toBe(expectedDays);
      expect(result.hasPredictions).toBe(expectedPredictions);

      // Verify exact dates
      expect(result.startDate).toBe(baseDate);
      expect(result.endDate).toBe(addDays(baseDate, expectedDays - 1));
    });
  });

  describe('Historical Data Preservation', () => {
    it('preserves historical LOGGED and RECONSTRUCTED data while suppressing future PREDICTED data on active Day 3', () => {
      const historicalStartDate = '2026-07-14'; // 28 days before baseDate
      // Historical cycle is completed
      const historicalCycle = createCycle(historicalStartDate, addDays(historicalStartDate, 4), 28);
      
      // Current active cycle on Day 3
      const currentCycle = createCycle(baseDate, null, null);
      
      const referenceDate = addDays(baseDate, 2); // Day 3
      
      const cycles = [currentCycle, historicalCycle];
      const prediction = predictionService.predict(cycles, avgCycleLength, defaultPeriodDuration)!;
      
      const { events, intervals } = builder.build(cycles, prediction, referenceDate, defaultPeriodDuration);
      
      // Historical LOGGED data should exist
      const historicalPeriod = intervals.find(i => i.startDate === historicalStartDate && i.source === 'LOGGED');
      expect(historicalPeriod).toBeDefined();

      // Historical RECONSTRUCTED data should exist
      const reconstructedFollicular = intervals.find(i => i.source === 'RECONSTRUCTED' && i.phase === 'FOLLICULAR');
      expect(reconstructedFollicular).toBeDefined();
      
      // Future PREDICTED data should NOT exist (because it's active Day 3)
      const predictedEvents = events.filter(e => e.source === 'PREDICTED');
      const predictedIntervals = intervals.filter(i => i.source === 'PREDICTED');
      
      expect(predictedEvents.length).toBe(0);
      expect(predictedIntervals.length).toBe(0);
    });
  });
});

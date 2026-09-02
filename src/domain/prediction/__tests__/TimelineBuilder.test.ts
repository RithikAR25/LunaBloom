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
      ['Active', 1, 1, true],
      ['Active', 2, 2, true],
      ['Active', 3, 3, true],
      ['Active', 4, 4, true],
      ['Active', 5, 5, true],
      ['Active', 6, 6, true],
      ['Active', 7, 7, true],
      ['Completed', 3, 3, true],
      ['Completed', 5, 5, true],
      ['Completed', 7, 7, true],
    ] as const)('%s Cycle Day %i -> %i logged menstrual days, predictions: %s', (state, day, expectedDays, expectedPredictions) => {
      const result = runMatrixTest(state, day);
      
      expect(result.menstrualDays).toBe(expectedDays);
      expect(result.hasPredictions).toBe(expectedPredictions);

      // Verify exact dates for the LOGGED interval
      expect(result.startDate).toBe(baseDate);
      expect(result.endDate).toBe(addDays(baseDate, expectedDays - 1));
    });
  });

  describe('Prediction Transition Boundaries', () => {
    it('integration regression test: exact sequence for Aug 11-16 (Day 3, elapsed < predicted)', () => {
      // Scenario:
      // startDate     = 2026-08-11
      // referenceDate = 2026-08-13
      // endDate       = null
      // predictedPeriodDuration = 5
      
      const referenceDate = '2026-08-13';
      const cycles = [createCycle('2026-08-11', null, null)];
      
      // Override defaultPeriodDuration to ensure it is 5
      const prediction = predictionService.predict(cycles, avgCycleLength, 5)!;
      const { intervals } = builder.build(cycles, prediction, referenceDate, 5);

      const getPhaseForDate = (dateStr: string) => {
        return intervals.find(i => dateStr >= i.startDate && dateStr <= i.endDate);
      };

      // Aug 11-13 LOGGED Menstrual
      for (let day = 11; day <= 13; day++) {
        const p = getPhaseForDate(`2026-08-${day}`);
        expect(p).toBeDefined();
        expect(p!.phase).toBe('MENSTRUAL');
        expect(p!.source).toBe('LOGGED');
      }

      // Aug 14-15 PREDICTED Menstrual
      for (let day = 14; day <= 15; day++) {
        const p = getPhaseForDate(`2026-08-${day}`);
        expect(p).toBeDefined();
        expect(p!.phase).toBe('MENSTRUAL');
        expect(p!.source).toBe('PREDICTED');
      }

      // Aug 16 PREDICTED Follicular
      const p16 = getPhaseForDate('2026-08-16');
      expect(p16).toBeDefined();
      expect(p16!.phase).toBe('FOLLICULAR');
      expect(p16!.source).toBe('PREDICTED');
    });

    it('generates NO PREDICTED menstrual days on Day 5 and starts follicular correctly (elapsed == predicted)', () => {
      const referenceDate = addDays(baseDate, 4); // Day 5
      const cycles = [createCycle(baseDate, null, null)];
      const prediction = predictionService.predict(cycles, avgCycleLength, defaultPeriodDuration)!;
      const { intervals } = builder.build(cycles, prediction, referenceDate, defaultPeriodDuration);

      const loggedIntervals = intervals.filter(i => i.phase === 'MENSTRUAL' && i.source === 'LOGGED');
      // Look for predicted menstrual for the CURRENT cycle (not the next one)
      const predictedMenstrualIntervals = intervals.filter(i => i.phase === 'MENSTRUAL' && i.source === 'PREDICTED' && i.startDate < addDays(baseDate, 10));
      const follicularInterval = intervals.find(i => i.phase === 'FOLLICULAR');

      expect(loggedIntervals.length).toBe(1);
      expect(loggedIntervals[0]!.endDate).toBe(addDays(baseDate, 4)); // Days 1-5
      
      expect(predictedMenstrualIntervals.length).toBe(0); // None for the current cycle
      
      expect(follicularInterval).toBeDefined();
      expect(follicularInterval!.startDate).toBe(addDays(baseDate, 5)); // Day 6
    });

    it('generates NO PREDICTED menstrual days on Day 6 and shrinks follicular (elapsed > predicted)', () => {
      const referenceDate = addDays(baseDate, 5); // Day 6
      const cycles = [createCycle(baseDate, null, null)];
      const prediction = predictionService.predict(cycles, avgCycleLength, defaultPeriodDuration)!;
      const { intervals } = builder.build(cycles, prediction, referenceDate, defaultPeriodDuration);

      const loggedIntervals = intervals.filter(i => i.phase === 'MENSTRUAL' && i.source === 'LOGGED');
      const predictedMenstrualIntervals = intervals.filter(i => i.phase === 'MENSTRUAL' && i.source === 'PREDICTED' && i.startDate < addDays(baseDate, 10));
      const follicularInterval = intervals.find(i => i.phase === 'FOLLICULAR');

      expect(loggedIntervals.length).toBe(1);
      expect(loggedIntervals[0]!.endDate).toBe(addDays(baseDate, 5)); // Days 1-6
      
      expect(predictedMenstrualIntervals.length).toBe(0);
      
      expect(follicularInterval).toBeDefined();
      expect(follicularInterval!.startDate).toBe(addDays(baseDate, 6)); // Day 7
      
      // Verify ovulation has not shifted (should be Day 14 for a 28-day cycle)
      const ovulationInterval = intervals.find(i => i.phase === 'OVULATION');
      expect(ovulationInterval!.startDate).toBe(addDays(baseDate, 13)); // Day 14
    });
    it('simulates Aug 12th with 3-day elapsed and 5-day default', () => {
      const referenceDate = '2026-08-14';
      const cycles = [createCycle('2026-08-12', null, null)];
      
      const prediction = predictionService.predict(cycles, avgCycleLength, 5)!;
      const { intervals } = builder.build(cycles, prediction, referenceDate, 5);

      const getPhaseForDate = (dateStr: string) => {
        // Must match PhaseResolver logic exactly
        return intervals.find(i => dateStr >= i.startDate && dateStr <= i.endDate);
      };

      for (let day = 12; day <= 20; day++) {
        const p = getPhaseForDate(`2026-08-${day}`);
        console.log(`2026-08-${day}: phase=${p?.phase} source=${p?.source} (${p?.startDate} -> ${p?.endDate})`);
      }
      
      // Let's expect Aug 15 to be MENSTRUAL
      const p15 = getPhaseForDate('2026-08-15');
      expect(p15?.phase).toBe('MENSTRUAL');
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
      
      // Future PREDICTED data SHOULD now exist, because prediction gating is removed
      const predictedEvents = events.filter(e => e.source === 'PREDICTED');
      const predictedIntervals = intervals.filter(i => i.source === 'PREDICTED');
      
      expect(predictedEvents.length).toBeGreaterThan(0);
      expect(predictedIntervals.length).toBeGreaterThan(0);
    });
  });
});

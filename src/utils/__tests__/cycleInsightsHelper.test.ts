import { calculateCycleInsights, getFullCycleDateRange, getPhaseForCycleDay } from '../cycleInsightsHelper';
import type { CycleEntry } from '../../domain/models/Cycle';
import type { DailyLog } from '../../domain/models/DailyLog';

describe('cycleInsightsHelper', () => {
  const baseCycle: CycleEntry = {
    id: 'cycle-1',
    startDate: '2026-07-22',
    endDate: '2026-07-26',
    durationDays: 5,
    cycleLengthDays: 28,
    notes: null,
    createdAt: '',
    updatedAt: '',
    deletedAt: null,
    syncStatus: 'LOCAL',
  };

  const createLog = (date: string, overrides: Partial<DailyLog> = {}): DailyLog => ({
    id: `log-${date}`,
    date,
    cycleEntryId: 'cycle-1',
    cycleDay: 1,
    flowIntensity: null,
    symptoms: [],
    moods: [],
    painLevel: null,
    energyLevel: null,
    sleepQuality: null,
    sleepHours: null,
    waterIntakeLiters: null,
    exerciseMinutes: null,
    exerciseType: null,
    libidoLevel: null,
    notes: null,
    createdAt: '',
    updatedAt: '',
    deletedAt: null,
    syncStatus: 'LOCAL',
    ...overrides,
  });

  describe('getFullCycleDateRange', () => {
    it('calculates range based on the day before the next cycle starts', () => {
      const cycleA = { ...baseCycle, id: 'a', startDate: '2026-07-22' };
      const cycleB = { ...baseCycle, id: 'b', startDate: '2026-08-19' };
      
      const result = getFullCycleDateRange(cycleA, [cycleB, cycleA]);
      expect(result.start).toBe('2026-07-22');
      expect(result.end).toBe('2026-08-18');
      expect(result.isCurrent).toBe(false);
    });

    it('handles cross-month and cross-year boundaries correctly', () => {
      const cycleA = { ...baseCycle, id: 'a', startDate: '2025-12-20' };
      const cycleB = { ...baseCycle, id: 'b', startDate: '2026-01-17' };
      
      const result = getFullCycleDateRange(cycleA, [cycleA, cycleB]);
      expect(result.start).toBe('2025-12-20');
      expect(result.end).toBe('2026-01-16');
      expect(result.isCurrent).toBe(false);
    });

    it('returns null end date and isCurrent=true for the latest cycle with no subsequent cycle', () => {
      const cycleA = { ...baseCycle, id: 'a', startDate: '2026-07-22' };
      
      const result = getFullCycleDateRange(cycleA, [cycleA]);
      expect(result.start).toBe('2026-07-22');
      expect(result.end).toBeNull();
      expect(result.isCurrent).toBe(true);
    });
  });

  describe('calculateCycleInsights', () => {
    it('calculates phase lengths correctly for a standard cycle', () => {
      const insights = calculateCycleInsights(baseCycle, [], 28);
      expect(insights.phaseLengths).toEqual({
        menstrual: 5,
        follicular: 5, 
        ovulatory: 4,
        luteal: 14,
      });
    });

    it('handles zero-data averages properly', () => {
      const insights = calculateCycleInsights(baseCycle, [createLog('2026-07-22')], 28);
      expect(insights.avgPain).toBeNull();
      expect(insights.avgEnergy).toBeNull();
      expect(insights.totalLogsCount).toBe(1);
      expect(insights.flowDays).toEqual({
        heavy: [], medium: [], light: [], spotting: [], very_heavy: []
      });
    });

    it('extracts correct flow days relative to cycle start date', () => {
      const logs = [
        createLog('2026-07-22', { flowIntensity: 'HEAVY' }), // Day 1
        createLog('2026-07-23', { flowIntensity: 'MEDIUM' }), // Day 2
        createLog('2026-07-25', { flowIntensity: 'LIGHT' }), // Day 4
        createLog('2026-07-26', { flowIntensity: 'SPOTTING' }), // Day 5
        createLog('2026-08-10', { painLevel: 5 }), // Day 20, no flow
      ];
      
      const insights = calculateCycleInsights(baseCycle, logs, 28);
      
      expect(insights.flowDays).toEqual({
        heavy: [1],
        medium: [2],
        light: [4],
        spotting: [5],
        very_heavy: [],
      });
    });
    
    it('sorts multiple flow days ascendingly', () => {
      const logs = [
        createLog('2026-07-24', { flowIntensity: 'HEAVY' }), // Day 3
        createLog('2026-07-22', { flowIntensity: 'HEAVY' }), // Day 1
      ];
      
      const insights = calculateCycleInsights(baseCycle, logs, 28);
      expect(insights.flowDays.heavy).toEqual([1, 3]);
    });
  });

  describe('getPhaseForCycleDay', () => {
    it('maps days to correct phases matching authoritative boundaries', () => {
      // Setup based on user prompt example:
      // Menstrual=5, Follicular=5, Ovulatory=4, Luteal=14
      const lengths = {
        menstrual: 5,
        follicular: 5,
        ovulatory: 4,
        luteal: 14
      };

      // Days 1-5 -> Menstrual
      expect(getPhaseForCycleDay(1, lengths)).toBe('menstrual');
      expect(getPhaseForCycleDay(5, lengths)).toBe('menstrual');

      // Days 6-10 -> Follicular
      expect(getPhaseForCycleDay(6, lengths)).toBe('follicular');
      expect(getPhaseForCycleDay(10, lengths)).toBe('follicular');

      // Days 11-14 -> Ovulatory
      expect(getPhaseForCycleDay(11, lengths)).toBe('ovulatory');
      expect(getPhaseForCycleDay(14, lengths)).toBe('ovulatory');

      // Days 15-28 -> Luteal
      expect(getPhaseForCycleDay(15, lengths)).toBe('luteal');
      expect(getPhaseForCycleDay(28, lengths)).toBe('luteal');
    });
  });
});

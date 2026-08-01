import { CyclePredictionService } from '../CyclePredictionService';
import type { CycleEntry } from '../../models/Cycle';
import { addDays, todayISO } from '../../../utils/dateUtils';

describe('CyclePredictionService', () => {
  let service: CyclePredictionService;

  beforeEach(() => {
    service = new CyclePredictionService();
  });

  const createCycle = (startDate: string, length: number | null, isExcluded = false): CycleEntry => ({
    id: `cycle-${startDate}`,
    startDate,
    endDate: length ? addDays(startDate, 4) : null,
    durationDays: length ? 5 : null,
    cycleLengthDays: length,
    notes: null,
    isExcludedFromPredictions: isExcluded,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    syncStatus: 'LOCAL',
  });

  describe('predictNextPeriod', () => {
    it('returns LOW confidence for < 3 cycles', () => {
      const cycles = [createCycle('2023-01-01', 28)];
      const result = service.predictNextPeriod(cycles, 28);
      expect(result.confidence).toBe('LOW');
      expect(result.explanation[0]).toBe('More cycle history will improve predictions.');
    });

    it('returns HIGH confidence for >= 4 consistent cycles', () => {
      const cycles = [
        createCycle('2023-01-01', 28),
        createCycle('2023-01-29', 28),
        createCycle('2023-02-26', 28),
        createCycle('2023-03-26', 28),
      ];
      const result = service.predictNextPeriod(cycles, 28);
      expect(result.confidence).toBe('HIGH');
      expect(result.predictedCycleLength).toBe(28);
      expect(result.explanation.length).toBe(1);
    });

    it('down-weights outlier cycle length', () => {
      const cycles = [
        createCycle('2023-01-01', 28),
        createCycle('2023-01-29', 28),
        createCycle('2023-02-26', 45), // outlier
        createCycle('2023-04-12', 28),
        createCycle('2023-05-10', 28),
      ];
      const result = service.predictNextPeriod(cycles, 28);
      // Prediction should be closer to 28 than average of (28,28,45,28,28) which is 31.4
      expect(result.predictedCycleLength).toBeLessThan(31);
      // Because std dev is large due to 45, confidence shouldn't be HIGH if stdDev > 3
      // Check the explanation mentions unusual cycles
      const hasUnusual = result.explanation.some(e => e.includes('unusual cycle'));
      expect(hasUnusual).toBe(true);
    });
  });

  describe('getPhaseForDate', () => {
    it('identifies predicted menstrual window', () => {
      const base = todayISO();
      // Suppose we have a cycle starting 28 days ago, so today is the expected next start
      const cycles = [
        createCycle(addDays(base, -28), 28),
        createCycle(addDays(base, -56), 28),
        createCycle(addDays(base, -84), 28),
        createCycle(addDays(base, -112), 28),
      ];

      const result = service.getPhaseForDate(base, cycles);
      expect(result.isPredictionStartWindow).toBe(true);
      expect(result.phase).not.toBe('MENSTRUAL'); // unless it is actively logged as menstrual
    });
  });
});

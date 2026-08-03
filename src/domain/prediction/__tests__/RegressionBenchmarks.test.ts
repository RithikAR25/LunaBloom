import { CyclePredictionService } from '../services/CyclePredictionService';
import { PredictionConfidence } from '../models/TimelineEvent';
import { TimelineBuilder } from '../services/TimelineBuilder';
import { PhaseResolver } from '../services/PhaseResolver';
import { TimelineIndexer } from '../services/TimelineIndexer';
import type { CycleEntry } from '../../models/Cycle';
import { addDays } from '../../../utils/dateUtils';

describe('Exhaustive Regression and Benchmarks', () => {
  let predictionService: CyclePredictionService;
  let builder: TimelineBuilder;
  let indexer: TimelineIndexer;
  let resolver: PhaseResolver;

  beforeEach(() => {
    predictionService = new CyclePredictionService();
    builder = new TimelineBuilder();
    indexer = new TimelineIndexer();
    resolver = new PhaseResolver();
  });

  const createCycle = (startDate: string, length: number | null, duration: number | null = null, isExcluded = false): CycleEntry => ({
    id: `cycle-${startDate}`,
    startDate,
    endDate: length ? addDays(startDate, duration ? duration - 1 : 4) : null,
    durationDays: length ? (duration ? duration : 5) : null,
    cycleLengthDays: length,
    notes: null,
    isExcludedFromPredictions: isExcluded,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    syncStatus: 'LOCAL',
  });

  describe('Regression: Cycle Variances & Anomalies', () => {
    it('handles alternating 28 and 35 day cycles correctly (irregular pattern)', () => {
      const cycles = [
        createCycle('2023-01-01', 35, 5),
        createCycle('2023-02-05', 28, 5),
        createCycle('2023-03-05', 35, 5),
        createCycle('2023-04-09', 28, 5),
        createCycle('2023-05-07', 35, 5),
      ];
      // Since it's sorted, we need it to be from newest to oldest normally, but predictionService handles the math.
      // Wait, predictNextPeriod expects cycles sorted newest-first.
      const sortedCycles = [...cycles].sort((a,b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
      
      const prediction = predictionService.predictNextPeriod(sortedCycles, 28);
      // Average of 35 and 28 is ~31.5 -> 32
      expect(prediction.predictedCycleLength).toBe(32);
      expect(prediction.isIrregular).toBe(false); // Stdev of [35,28,35,28,35] is around 3.5 days, not > 7.
      expect(prediction.confidenceLevel).toBe(PredictionConfidence.MEDIUM); // 5 cycles
    });

    it('handles extreme irregular patterns (>7 day variance)', () => {
      const cycles = [
        createCycle('2023-01-01', 20, 5),
        createCycle('2023-01-21', 45, 5),
        createCycle('2023-03-07', 15, 5),
        createCycle('2023-03-22', 60, 5),
      ];
      const sortedCycles = [...cycles].sort((a,b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
      
      const prediction = predictionService.predictNextPeriod(sortedCycles, 28);
      expect(prediction.isIrregular).toBe(true);
      expect(prediction.confidenceLevel).toBe(PredictionConfidence.LOW); 
    });

    it('ignores explicitly excluded data anomalies', () => {
      const cycles = [
        createCycle('2023-01-01', 28, 5),
        createCycle('2023-01-29', 28, 5),
        createCycle('2023-02-26', 15, 5, true), // Excluded!
        createCycle('2023-03-13', 28, 5),
      ];
      const sortedCycles = [...cycles].sort((a,b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
      
      const prediction = predictionService.predictNextPeriod(sortedCycles, 28);
      // Should calculate based on 28s only
      expect(prediction.predictedCycleLength).toBe(28);
      expect(prediction.isIrregular).toBe(false);
    });
  });

  describe('Performance Benchmark', () => {
    it('generates a 1-year timeline index and resolves 365 lookups under 50ms', () => {
      const baseStart = '2026-01-01';
      const cycles = [
        createCycle(baseStart, 28, 5),
        createCycle('2025-12-04', 28, 5),
        createCycle('2025-11-06', 28, 5)
      ];

      const startMs = Date.now();
      
      const prediction = predictionService.predictNextPeriod(cycles, 28);
      // Generate up to 12 projections for a full year
      const projected = predictionService.generateFutureCycles(cycles[0]!, prediction, 5);
      
      const events = builder.generateTimeline(cycles, projected);
      const index = indexer.buildDateIndex(events);

      for (let i = 0; i < 365; i++) {
        const d = addDays(baseStart, i);
        const ev = index.get(d) || [];
        resolver.getPhaseForDate(d, ev, events);
      }

      const endMs = Date.now();
      const diff = endMs - startMs;
      
      // We expect it to be extremely fast (O(1) lookups).
      // Under node, this should take << 50ms.
      expect(diff).toBeLessThan(50);
    });
  });
});

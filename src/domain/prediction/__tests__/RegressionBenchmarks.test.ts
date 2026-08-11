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
  let resolver: PhaseResolver;

  beforeEach(() => {
    predictionService = new CyclePredictionService();
    builder = new TimelineBuilder(predictionService);
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
      const sortedCycles = [...cycles].sort((a,b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
      
      const prediction = predictionService.predict(sortedCycles, 28)!;
      // Median is 35, MAD is ~3.5
      // Because it's an LWMA with Cauchy weighting, the most recent cycle (35) gets highest recency weight.
      // Weighted result shifts towards 35. With given formula it yields 35
      expect(prediction.predictedCycleLength).toBe(35);
      expect(prediction.explanation).not.toContain('Your cycle length varies significantly.');
      expect(prediction.confidence).toBe(PredictionConfidence.HIGH); // MAD is 0 for [35,28,35,28,35] (median of abs diffs is 0), so it is HIGH confidence
    });

    it('handles extreme irregular patterns (>7 day variance)', () => {
      const cycles = [
        createCycle('2023-01-01', 20, 5),
        createCycle('2023-01-21', 45, 5),
        createCycle('2023-03-07', 15, 5),
        createCycle('2023-03-22', 60, 5),
      ];
      const sortedCycles = [...cycles].sort((a,b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
      
      const prediction = predictionService.predict(sortedCycles, 28)!;
      expect(prediction.explanation).toContain('Your cycle length varies significantly.');
      expect(prediction.confidence).toBe(PredictionConfidence.LOW); 
    });

    it('ignores explicitly excluded data anomalies', () => {
      const cycles = [
        createCycle('2023-01-01', 28, 5),
        createCycle('2023-01-29', 28, 5),
        createCycle('2023-02-26', 15, 5, true), // Excluded!
        createCycle('2023-03-13', 28, 5),
      ];
      const sortedCycles = [...cycles].sort((a,b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
      
      const prediction = predictionService.predict(sortedCycles, 28)!;
      // Should calculate based on 28s only
      expect(prediction.predictedCycleLength).toBe(28);
      expect(prediction.explanation).not.toContain('Your cycle length varies significantly.');
    });

    it('predictive exclusion verification test', () => {
      const baseCycles = [
        createCycle('2023-01-01', 26, 5),
        createCycle('2023-01-27', 28, 5),
        createCycle('2023-02-24', 30, 5),
      ];

      // Predict without anomaly
      const predictionWithoutAnomaly = predictionService.predict(
        [...baseCycles].sort((a,b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()), 
        28
      )!;

      // Predict with anomaly INCLUDED
      const cyclesWithIncludedAnomaly = [
        ...baseCycles,
        createCycle('2023-03-26', 24, 5, false) // anomalous cycle
      ].sort((a,b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
      
      const predictionWithIncludedAnomaly = predictionService.predict(cyclesWithIncludedAnomaly, 28)!;

      // Predict with anomaly EXCLUDED
      const cyclesWithExcludedAnomaly = [
        ...baseCycles,
        createCycle('2023-03-26', 24, 5, true) // anomalous cycle EXCLUDED
      ].sort((a,b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

      const predictionWithExcludedAnomaly = predictionService.predict(cyclesWithExcludedAnomaly, 28)!;

      // 1. Verify the included anomaly actually changes the prediction 
      // (proving the math model incorporates it)
      expect(predictionWithIncludedAnomaly.predictedCycleLength).not.toBe(predictionWithoutAnomaly.predictedCycleLength);
      
      // 2. Verify the excluded anomaly is ignored completely
      // (proving it has 0 influence)
      expect(predictionWithExcludedAnomaly.predictedCycleLength).toBe(predictionWithoutAnomaly.predictedCycleLength);
    });
  });

  describe('Performance Benchmark', () => {
    it('generates a 1-month timeline and resolves 30 lookups under 50ms', () => {
      const baseStart = '2026-01-01';
      const cycles = [
        createCycle(baseStart, 28, 5),
        createCycle('2025-12-04', 28, 5),
        createCycle('2025-11-06', 28, 5)
      ];

      const startMs = Date.now();
      
      const prediction = predictionService.predict(cycles, 28);
      const { events, intervals } = builder.build(cycles, prediction, baseStart, 5);
      
      const indexer = new TimelineIndexer();
      const index = indexer.buildDateIndex(events);

      for (let i = 0; i < 30; i++) {
        const d = addDays(baseStart, i);
        resolver.getPhaseForDate(d, intervals, index);
      }

      const endMs = Date.now();
      const diff = endMs - startMs;
      
      // We expect it to be extremely fast (O(1) lookups).
      // Under node, this should take << 50ms.
      expect(diff).toBeLessThan(50);
    });
  });
});

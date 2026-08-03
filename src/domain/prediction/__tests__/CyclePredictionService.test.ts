import { CyclePredictionService } from '../services/CyclePredictionService';
import { PredictionConfidence } from '../models/TimelineEvent';
import { TimelineBuilder } from '../services/TimelineBuilder';
import { PhaseResolver } from '../services/PhaseResolver';
import { TimelineIndexer } from '../services/TimelineIndexer';
import type { CycleEntry } from '../../models/Cycle';
import { addDays } from '../../../utils/dateUtils';

describe('Prediction Module', () => {
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

  describe('CyclePredictionService', () => {
    it('returns LOW confidence for < 2 valid cycles', () => {
      const cycles = [createCycle('2023-01-01', 28)];
      const result = predictionService.predictNextPeriod(cycles, 28);
      expect(result.confidenceLevel).toBe(PredictionConfidence.LOW);
    });

    it('returns HIGH confidence for >= 3 consistent cycles', () => {
      const cycles = [
        createCycle('2023-01-01', 28),
        createCycle('2023-01-29', 28),
        createCycle('2023-02-26', 28),
        createCycle('2023-03-26', 28),
      ];
      const result = predictionService.predictNextPeriod(cycles, 28);
      expect(result.confidenceLevel).toBe(PredictionConfidence.HIGH);
    });

    it('returns MEDIUM confidence for slightly varying cycles', () => {
      const cycles = [
        createCycle('2023-01-01', 28, 5),
        createCycle('2023-01-29', 35, 5),
        createCycle('2023-03-05', 28, 5),
        createCycle('2023-04-02', 38, 5),
      ];
      const result = predictionService.predictNextPeriod(cycles, 28);
      expect(result.confidenceLevel).toBe(PredictionConfidence.MEDIUM);
      expect(result.isIrregular).toBe(false);
    });
  });

  describe('Timeline Generation (Biological Horizon)', () => {
    it('projects accurately without confusing cycle length and bleeding duration', () => {
      const baseStart = '2026-06-05';
      const cycles = [
        createCycle(baseStart, 30, 5),
        createCycle('2026-05-06', 30, 5),
        createCycle('2026-04-06', 30, 5)
      ]; // Highly regular 30-day cycles

      const prediction = predictionService.predictNextPeriod(cycles, 28);
      const projected = predictionService.generateFutureCycles(cycles[0]!, prediction, 5);

      expect(projected.length).toBe(3);

      // Prediction 1 (Active/First Projected)
      expect(projected[0]!.predictedStartDate).toBe('2026-07-05'); // +30 days from June 5
      expect(projected[0]!.predictedEndDate).toBe('2026-07-09'); // 5 day period
      expect(projected[0]!.predictedCycleLength).toBe(30);
      expect(projected[0]!.confidence).toBe(PredictionConfidence.HIGH);

      // Prediction 2
      expect(projected[1]!.predictedStartDate).toBe('2026-08-04'); // +30 days from July 5
      expect(projected[1]!.predictedEndDate).toBe('2026-08-08'); // 5 day period
      expect(projected[1]!.confidence).toBe(PredictionConfidence.MEDIUM); // degraded

      // Prediction 3
      expect(projected[2]!.predictedStartDate).toBe('2026-09-03'); // +30 days from August 4
      expect(projected[2]!.predictedEndDate).toBe('2026-09-07'); // 5 day period
      expect(projected[2]!.confidence).toBe(PredictionConfidence.LOW); // degraded
    });
  });

  describe('PhaseResolver', () => {
    it('degrades to UNKNOWN when requesting dates beyond the prediction horizon', () => {
      const baseStart = '2026-06-05';
      const cycles = [
        createCycle(baseStart, 30),
        createCycle('2026-05-06', 30),
      ];

      const prediction = predictionService.predictNextPeriod(cycles, 28);
      const projected = predictionService.generateFutureCycles(cycles[0]!, prediction, 5);
      const events = builder.generateTimeline(cycles, projected);
      const index = indexer.buildDateIndex(events);

      // Requesting well beyond the 3 cycles + 16 days luteal cap
      const futureDate = addDays(baseStart, 130);
      const activeEvents = index.get(futureDate) || [];
      const phase = resolver.getPhaseForDate(futureDate, activeEvents, events);
      
      expect(phase.phase).toBe('UNKNOWN');
      expect(phase.fertilityStatus).toBe('unknown');
    });

    it('suppresses fertility status when confidence is LOW (3rd projection)', () => {
      const baseStart = '2026-06-05';
      const cycles = [
        createCycle(baseStart, 30, 5),
        createCycle('2026-05-06', 30, 5),
        createCycle('2026-04-06', 30, 5)
      ]; // HIGH base confidence

      const prediction = predictionService.predictNextPeriod(cycles, 28);
      const projected = predictionService.generateFutureCycles(cycles[0]!, prediction, 5);
      const events = builder.generateTimeline(cycles, projected);
      const index = indexer.buildDateIndex(events);

      // Request date inside the 3rd projected cycle's fertile window
      // 3rd projection starts 2026-09-03
      // Ovulation = 30 - 14 = 16 days after start = 2026-09-18
      const fertileDay = '2026-09-18';
      
      const activeEvents = index.get(fertileDay) || [];
      const phase = resolver.getPhaseForDate(fertileDay, activeEvents, events);
      
      // Phase should still be ovulatory structurally, but fertility is unknown
      expect(phase.phase).toBe('OVULATORY');
      expect(phase.fertilityStatus).toBe('unknown');
    });
  });
});

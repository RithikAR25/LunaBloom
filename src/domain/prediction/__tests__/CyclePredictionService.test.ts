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
    builder = new TimelineBuilder(predictionService);
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
    it('returns null if no valid cycles', () => {
      const result = predictionService.predict([], 28);
      expect(result).toBeNull();
    });

    it('returns LOW confidence for < 2 valid cycles', () => {
      const cycles = [createCycle('2023-01-01', 28)];
      const result = predictionService.predict(cycles, 28);
      expect(result!.confidence).toBe(PredictionConfidence.LOW);
    });

    it('returns HIGH confidence for >= 3 consistent cycles', () => {
      const cycles = [
        createCycle('2023-01-01', 28),
        createCycle('2023-01-29', 28),
        createCycle('2023-02-26', 28),
        createCycle('2023-03-26', 28),
      ];
      const result = predictionService.predict(cycles, 28);
      expect(result!.confidence).toBe(PredictionConfidence.HIGH);
    });

    it('returns MEDIUM confidence for slightly varying cycles', () => {
      const cycles = [
        createCycle('2023-01-01', 28, 5),
        createCycle('2023-01-29', 35, 5),
        createCycle('2023-03-05', 28, 5),
        createCycle('2023-04-02', 38, 5),
      ];
      const result = predictionService.predict(cycles, 28);
      expect(result!.confidence).toBe(PredictionConfidence.MEDIUM);
    });
  });

  describe('Timeline Generation (Biological Horizon)', () => {
    it('generates exactly one predicted cycle without multiple projections', () => {
      const baseStart = '2026-06-05';
      const cycles = [
        createCycle(baseStart, 30, 5),
        createCycle('2026-05-06', 30, 5),
        createCycle('2026-04-06', 30, 5)
      ];

      const prediction = predictionService.predict(cycles, 28);

      expect(prediction).not.toBeNull();

      // Prediction 1
      expect(prediction!.nextPeriodStart).toBe('2026-07-05'); // +30 days from June 5
      expect(prediction!.nextPeriodEnd).toBe('2026-07-09'); // 5 day period
      expect(prediction!.predictedCycleLength).toBe(30);
      expect(prediction!.confidence).toBe(PredictionConfidence.HIGH);
    });
  });

  describe('PhaseResolver', () => {
    it('returns null phase (ordinary day) when requesting dates far beyond the predicted cycle', () => {
      const baseStart = '2026-05-06';
      const cycles = [
        createCycle(baseStart, 30),
      ]; // May 6 logged

      const prediction = predictionService.predict(cycles, 28);
      const { events, intervals } = builder.build(cycles, prediction, '2026-10-20', 5);
      const index = indexer.buildDateIndex(events);

      // Predicted is June 5. October 20 is far beyond the single prediction
      const futureDate = '2026-10-20';
      const phase = resolver.getPhaseForDate(futureDate, intervals, index);
      
      expect(phase.phase).toBeNull();
      expect(phase.fertilityStatus).toBe('unknown');
    });

    it('returns null phase if there are no logged cycles at all', () => {
      const phase = resolver.getPhaseForDate('2026-01-01', [], new Map());
      expect(phase.phase).toBeNull();
      expect(phase.fertilityStatus).toBe('unknown');
    });

    it('Regression Test 1: The Luteal Fix (Aug 4 for single July 16 log)', () => {
      const cycles = [
        createCycle('2026-07-16', null)
      ];

      // With the new architecture, an active period (endDate = null) is NEVER capped by predictions.
      // Since the user hasn't ended the period, Day 20 (Aug 4) remains LOGGED MENSTRUAL.
      const prediction = predictionService.predict(cycles, 28, 5);
      const { events, intervals } = builder.build(cycles, prediction, '2026-08-04', 5);
      const index = indexer.buildDateIndex(events);

      const phase = resolver.getPhaseForDate('2026-08-04', intervals, index);
      
      expect(phase.phase).toBe('MENSTRUAL');
      expect(phase.cycleDay).toBe(20);
      expect(phase.fertilityStatus).toBe('not_fertile');
      expect(phase.pregnancyChance).toBe('LOW');
    });

    describe('Pregnancy Chance Mapping (Product Rule)', () => {
      it('maps fertile to HIGH chance', () => {
        // Mock intervals and events to simulate ovulation day
        const events = new Map();
        events.set('2026-08-05', [{ type: 'OVULATION', date: '2026-08-05' } as any]);
        const intervals = [{ phase: 'FERTILE_WINDOW', startDate: '2026-08-01', endDate: '2026-08-06', source: 'PREDICTED' } as any];
        const phase = resolver.getPhaseForDate('2026-08-05', intervals, events);
        
        expect(phase.fertilityStatus).toBe('fertile');
        expect(phase.pregnancyChance).toBe('HIGH');
      });

      it('maps possible to MEDIUM chance', () => {
        const events = new Map();
        events.set('2026-08-02', [{ type: 'FERTILE_WINDOW', date: '2026-08-02' } as any]);
        const intervals = [{ phase: 'FERTILE_WINDOW', startDate: '2026-08-01', endDate: '2026-08-06', source: 'PREDICTED' } as any];
        const phase = resolver.getPhaseForDate('2026-08-02', intervals, events);
        
        expect(phase.fertilityStatus).toBe('possible');
        expect(phase.pregnancyChance).toBe('MEDIUM');
      });

      it('maps not_fertile to LOW chance', () => {
        const events = new Map();
        const intervals = [{ phase: 'MENSTRUAL', startDate: '2026-08-01', endDate: '2026-08-05', source: 'LOGGED' } as any];
        const phase = resolver.getPhaseForDate('2026-08-03', intervals, events);
        
        expect(phase.fertilityStatus).toBe('not_fertile');
        expect(phase.pregnancyChance).toBe('LOW');
      });

      it('maps unknown to UNKNOWN chance', () => {
        const phase = resolver.getPhaseForDate('2026-08-03', [], new Map());
        
        expect(phase.fertilityStatus).toBe('unknown');
        expect(phase.pregnancyChance).toBe('UNKNOWN');
      });
    });
  });
});

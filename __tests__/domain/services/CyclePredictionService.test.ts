import { CyclePredictionService } from '../../../src/domain/services/CyclePredictionService';
import type { CycleEntry } from '../../../src/domain/models/Cycle';
import { describe, it, expect } from '@jest/globals';

describe('CyclePredictionService', () => {
  const predictionService = new CyclePredictionService();

  const baseCycle = (id: string, startDate: string, cycleLengthDays: number | null): CycleEntry => ({
    id,
    startDate,
    endDate: null,
    durationDays: null,
    cycleLengthDays,
    notes: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    syncStatus: 'LOCAL',
  });

  describe('Medical Standards Verification Matrix', () => {
    it('handles Sparse Data (1 cycle)', () => {
      const cycles: CycleEntry[] = [
        baseCycle('1', '2024-03-01', null), // Just started
      ];
      
      const result = predictionService.predictOvulation(cycles, 28);
      
      expect(result.confidence).toBe('LOW');
      expect(result.fertilityStatus).toBe('unknown');
    });

    it('handles Regular cycle (28, 28, 28)', () => {
      const cycles: CycleEntry[] = [
        baseCycle('3', '2024-03-01', 28),
        baseCycle('2', '2024-02-02', 28),
        baseCycle('1', '2024-01-05', 28),
      ];
      
      const result = predictionService.predictOvulation(cycles, 28);
      
      expect(result.confidence).toBe('HIGH');
      expect(result.fertilityStatus).toBe('possible');
    });

    it('handles Long cycle (35, 35, 35, 35)', () => {
      const cycles: CycleEntry[] = [
        baseCycle('4', '2024-04-15', 35),
        baseCycle('3', '2024-03-11', 35),
        baseCycle('2', '2024-02-05', 35),
        baseCycle('1', '2024-01-01', 35),
      ];
      
      const result = predictionService.predictOvulation(cycles, 28);
      
      expect(result.confidence).toBe('HIGH');
      expect(result.fertilityStatus).toBe('possible');
    });

    it('handles Stable Short Cycle (20, 20, 20)', () => {
      const cycles: CycleEntry[] = [
        baseCycle('3', '2024-02-09', 20),
        baseCycle('2', '2024-01-20', 20),
        baseCycle('1', '2024-01-01', 20),
      ];
      
      const result = predictionService.predictOvulation(cycles, 28);
      
      // Standard deviation is 0, so confidence is HIGH based purely on variance,
      // BUT avgLength < 21 forces fertilityStatus to unknown and LOW confidence for ovulation!
      expect(result.confidence).toBe('LOW');
      expect(result.fertilityStatus).toBe('unknown');
      expect(result.explanation).toBeDefined();
    });

    it('handles Highly Irregular cycle (18, 33, 22, 37)', () => {
      const cycles: CycleEntry[] = [
        baseCycle('4', '2024-04-21', 18),
        baseCycle('3', '2024-03-19', 33),
        baseCycle('2', '2024-02-25', 22),
        baseCycle('1', '2024-01-19', 37),
      ];
      
      const result = predictionService.predictOvulation(cycles, 28);
      
      // Std dev > 7 -> LOW confidence
      expect(result.confidence).toBe('LOW');
      expect(result.fertilityStatus).toBe('unknown');
    });

    it('handles The Stress Outlier (28, 29, 28, 45, 27, 28)', () => {
      const cycles: CycleEntry[] = [
        baseCycle('6', '2024-06-01', 28),
        baseCycle('5', '2024-05-04', 27),
        baseCycle('4', '2024-04-07', 45), // outlier
        baseCycle('3', '2024-02-22', 28),
        baseCycle('2', '2024-01-25', 29),
        baseCycle('1', '2023-12-28', 28),
      ];
      
      const periodResult = predictionService.predictNextPeriod(cycles, 28);
      
      // The outlier should be downweighted. 
      // The median is 28, so predicted cycle length should remain close to 28 (not ~30.8 as a simple mean would give).
      expect(periodResult.predictedCycleLength).toBe(28);
      
      // Check that it's flagged as an unusual cycle in the explanation
      const hasUnusualExplanation = periodResult.explanation.some(exp => exp.includes('unusual cycle'));
      expect(hasUnusualExplanation).toBe(true);
    });

    it('respects biological separation in getPhaseForDate (actual vs predicted)', () => {
      const cycles: CycleEntry[] = [
        {
          ...baseCycle('1', '2024-08-01', 28),
          endDate: '2024-08-05' // 5 days of menstruation
        }
      ];

      // Test day 2 of the cycle (should be MENSTRUAL based on actual logged dates)
      const resultMenstrual = predictionService.getPhaseForDate('2024-08-02', cycles);
      expect(resultMenstrual.phase).toBe('MENSTRUAL');

      // Test day 10 of the cycle (FOLLICULAR, outside logged dates)
      const resultFollicular = predictionService.getPhaseForDate('2024-08-10', cycles);
      expect(resultFollicular.phase).toBe('FOLLICULAR');
    });
  });
});

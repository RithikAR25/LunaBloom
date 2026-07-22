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

  describe('predictNextPeriod', () => {
    it('should use fallback length and LOW confidence when no valid cycles exist', () => {
      const cycles: CycleEntry[] = [];
      const result = predictionService.predictNextPeriod(cycles, 28);
      
      expect(result.confidenceLevel).toBe('LOW');
      expect(result.basedOnCycles).toBe(0);
      expect(result.isIrregular).toBe(false);
    });

    it('should calculate weighted average correctly for regular cycles', () => {
      const cycles: CycleEntry[] = [
        baseCycle('1', '2024-03-01', 28), // newest
        baseCycle('2', '2024-02-02', 28),
        baseCycle('3', '2024-01-05', 28), // oldest
      ];
      
      const result = predictionService.predictNextPeriod(cycles, 28);
      
      expect(result.confidenceLevel).toBe('HIGH');
      expect(result.basedOnCycles).toBe(3);
      expect(result.isIrregular).toBe(false);
      expect(result.predictedStartDate).toBe('2024-03-29'); // 2024-03-01 + 28 days
    });

    it('should detect irregular cycles', () => {
      const cycles: CycleEntry[] = [
        baseCycle('1', '2024-03-01', 20),
        baseCycle('2', '2024-02-10', 35),
        baseCycle('3', '2024-01-06', 40),
      ];
      
      const result = predictionService.predictNextPeriod(cycles, 28);
      
      expect(result.isIrregular).toBe(true);
      expect(result.confidenceLevel).toBe('LOW'); // because standard deviation > 7
      expect(result.irregularityExplanation).toBeDefined();
    });
  });

  describe('predictOvulation', () => {
    it('should predict ovulation 14 days before next period', () => {
      const cycles: CycleEntry[] = [
        baseCycle('1', '2024-03-01', 28),
      ];
      
      const result = predictionService.predictOvulation(cycles, 28);
      
      // Next period = 2024-03-29. Ovulation = 2024-03-15
      expect(result.predictedOvulationDate).toBe('2024-03-15');
      expect(result.fertileWindowStart).toBe('2024-03-10'); // 5 days before
      expect(result.fertileWindowEnd).toBe('2024-03-15');
    });
  });
});

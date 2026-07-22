import { describe, it, expect } from '@jest/globals';
import { CycleAnalysisService } from '../../../src/domain/services/CycleAnalysisService';
import type { CycleEntry } from '../../../src/domain/models/Cycle';
import type { SyncStatus } from '../../../src/domain/models';

describe('CycleAnalysisService', () => {
  const service = new CycleAnalysisService();

  const mockCycle = (id: string, start: string, end: string | null, length: number | null, duration: number | null): CycleEntry => ({
    id,
    startDate: start,
    endDate: end,
    cycleLengthDays: length,
    durationDays: duration,
    notes: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    syncStatus: 'synced' as SyncStatus,
  });

  it('should return UNKNOWN trend and nulls for empty array', () => {
    const stats = service.getStatistics([]);
    expect(stats.cycleLengthTrend).toBe('UNKNOWN');
    expect(stats.averageCycleLength).toBeNull();
    expect(stats.regularityScore).toBeNull();
  });

  it('should calculate averages but return UNKNOWN trend for < 3 completed cycles', () => {
    const cycles = [
      mockCycle('1', '2023-01-01', '2023-01-28', 28, 5),
      mockCycle('2', '2023-01-29', '2023-02-26', 29, 4),
    ];
    
    const stats = service.getStatistics(cycles);
    expect(stats.averageCycleLength).toBe(29); // (28+29)/2 = 28.5 -> 29
    expect(stats.averagePeriodDuration).toBe(5); // (5+4)/2 = 4.5 -> 5
    expect(stats.shortestCycle).toBe(28);
    expect(stats.longestCycle).toBe(29);
    expect(stats.cycleLengthTrend).toBe('UNKNOWN');
    expect(stats.regularityScore).toBeNull();
  });

  it('should ignore incomplete cycles when calculating averages', () => {
    const cycles = [
      mockCycle('1', '2023-01-01', '2023-01-28', 28, 5),
      mockCycle('2', '2023-01-29', null, null, 4), // active cycle
    ];
    
    const stats = service.getStatistics(cycles);
    expect(stats.averageCycleLength).toBe(28);
    expect(stats.averagePeriodDuration).toBe(5);
    expect(stats.cycleLengthTrend).toBe('UNKNOWN');
  });

  it('should calculate INCREASING trend for length increasing over time', () => {
    const cycles = [
      mockCycle('1', '2023-01-01', '2023-01-26', 26, 5),
      mockCycle('2', '2023-01-27', '2023-02-24', 28, 5),
      mockCycle('3', '2023-02-25', '2023-03-27', 31, 5),
    ];
    
    const stats = service.getStatistics(cycles);
    expect(stats.cycleLengthTrend).toBe('INCREASING');
    expect(stats.regularityScore).not.toBeNull();
  });

  it('should calculate DECREASING trend for length decreasing over time', () => {
    const cycles = [
      mockCycle('1', '2023-01-01', '2023-01-31', 31, 5),
      mockCycle('2', '2023-02-01', '2023-02-28', 28, 5),
      mockCycle('3', '2023-03-01', '2023-03-26', 26, 5),
    ];
    
    const stats = service.getStatistics(cycles);
    expect(stats.cycleLengthTrend).toBe('DECREASING');
  });

  it('should calculate STABLE trend for length not changing significantly', () => {
    const cycles = [
      mockCycle('1', '2023-01-01', '2023-01-28', 28, 5),
      mockCycle('2', '2023-01-29', '2023-02-25', 28, 5),
      mockCycle('3', '2023-02-26', '2023-03-25', 28, 5),
    ];
    
    const stats = service.getStatistics(cycles);
    expect(stats.cycleLengthTrend).toBe('STABLE');
    expect(stats.regularityScore).toBe(100); // perfectly regular
  });
});

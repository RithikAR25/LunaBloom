import { describe, it, expect } from '@jest/globals';
import { CyclePhaseService } from '../../../src/domain/services/CyclePhaseService';
import type { CycleEntry } from '../../../src/domain/models/Cycle';
import type { SyncStatus } from '../../../src/domain/models';

describe('CyclePhaseService', () => {
  const mockCycle = (start: string, length: number | null, duration: number | null): CycleEntry => ({
    id: '1',
    startDate: start,
    endDate: length ? new Date(new Date(start).getTime() + (length - 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]! : null,
    cycleLengthDays: length,
    durationDays: duration,
    notes: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    syncStatus: 'synced' as SyncStatus,
  });

  it('should return UNKNOWN for date before start date', () => {
    const cycle = mockCycle('2023-01-05', 28, 5);
    expect(CyclePhaseService.getPhaseForDate('2023-01-04', cycle)).toBe('UNKNOWN');
  });

  it('should return MENSTRUAL for day 1 to duration', () => {
    const cycle = mockCycle('2023-01-01', 28, 5);
    expect(CyclePhaseService.getPhaseForDate('2023-01-01', cycle)).toBe('MENSTRUAL');
    expect(CyclePhaseService.getPhaseForDate('2023-01-05', cycle)).toBe('MENSTRUAL');
  });

  it('should return FOLLICULAR after menstruation and before ovulation window', () => {
    const cycle = mockCycle('2023-01-01', 28, 5);
    // Luteal is last 14 days (Day 15-28). Ovulatory is 4 days before that (Day 11-14).
    // Follicular should be Day 6 to Day 10.
    expect(CyclePhaseService.getPhaseForDate('2023-01-06', cycle)).toBe('FOLLICULAR');
    expect(CyclePhaseService.getPhaseForDate('2023-01-10', cycle)).toBe('FOLLICULAR');
  });

  it('should return OVULATORY for 4 days before luteal', () => {
    const cycle = mockCycle('2023-01-01', 28, 5);
    expect(CyclePhaseService.getPhaseForDate('2023-01-11', cycle)).toBe('OVULATORY');
    expect(CyclePhaseService.getPhaseForDate('2023-01-14', cycle)).toBe('OVULATORY');
  });

  it('should return LUTEAL for last 14 days of cycle', () => {
    const cycle = mockCycle('2023-01-01', 28, 5);
    expect(CyclePhaseService.getPhaseForDate('2023-01-15', cycle)).toBe('LUTEAL');
    expect(CyclePhaseService.getPhaseForDate('2023-01-28', cycle)).toBe('LUTEAL');
  });

  it('should return UNKNOWN for date after cycle end date', () => {
    const cycle = mockCycle('2023-01-01', 28, 5); // Ends on Jan 28
    expect(CyclePhaseService.getPhaseForDate('2023-01-29', cycle)).toBe('UNKNOWN');
  });

  it('should handle missing duration by defaulting to 5', () => {
    const cycle = mockCycle('2023-01-01', 28, null);
    expect(CyclePhaseService.getPhaseForDate('2023-01-05', cycle)).toBe('MENSTRUAL');
    expect(CyclePhaseService.getPhaseForDate('2023-01-06', cycle)).toBe('FOLLICULAR');
  });

  it('should handle short cycles by overlapping phases cleanly', () => {
    const cycle = mockCycle('2023-01-01', 20, 5);
    // Day 1-5: MENSTRUAL
    // Luteal start: Math.max(20 - 13, 5 + 1) = max(7, 6) = 7
    // Ovulatory start: Math.max(7 - 4, 6) = max(3, 6) = 6
    expect(CyclePhaseService.getPhaseForDate('2023-01-05', cycle)).toBe('MENSTRUAL');
    expect(CyclePhaseService.getPhaseForDate('2023-01-06', cycle)).toBe('OVULATORY');
    expect(CyclePhaseService.getPhaseForDate('2023-01-07', cycle)).toBe('LUTEAL');
  });
});

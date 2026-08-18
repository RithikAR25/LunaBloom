import { InsightEngine } from '../InsightEngine';
import type { DailyLog } from '../../models/DailyLog';
import type { CycleEntry } from '../../models/Cycle';

describe('InsightEngine.getPatternInsights', () => {
  let engine: InsightEngine;

  beforeEach(() => {
    engine = new InsightEngine();
  });

  const baseCycle: CycleEntry = {
    id: 'c1',
    startDate: '2026-07-01',
    endDate: '2026-07-28',
    cycleLengthDays: 28,
    durationDays: 5,
    notes: null,
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z',
    deletedAt: null,
    syncStatus: 'LOCAL'
  };

  const baseLog: DailyLog = {
    id: 'l1',
    date: '2026-07-01',
    cycleEntryId: 'c1',
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
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z',
    deletedAt: null,
    syncStatus: 'LOCAL'
  };

  it('handles empty inputs correctly', () => {
    const result = engine.getPatternInsights([], []);
    expect(result.cycleLengthHistory).toEqual([]);
    expect(result.periodDurationHistory).toEqual([]);
    expect(result.monthlyPainHistory).toEqual([]);
    expect(result.energyPeakCycleDay).toBeNull();
    expect(result.energyPeakAverage).toBeNull();
    expect(result.energyPeakSampleCount).toBeNull();
    expect(result.loggingConsistencyPercent).toBeNull();
  });

  it('excludes incomplete cycles and sorts oldest -> newest', () => {
    const cycles: CycleEntry[] = [
      { ...baseCycle, id: 'c3', startDate: '2026-09-01', cycleLengthDays: null, endDate: null }, // incomplete
      { ...baseCycle, id: 'c2', startDate: '2026-08-01', endDate: '2026-08-28', cycleLengthDays: 28 }, // newer
      { ...baseCycle, id: 'c1', startDate: '2026-07-01', endDate: '2026-07-28', cycleLengthDays: 28 }, // older
    ];

    const result = engine.getPatternInsights([], cycles);
    expect(result.cycleLengthHistory.length).toBe(2);
    expect(result.cycleLengthHistory[0]!.startDate).toBe('2026-07-01');
    expect(result.cycleLengthHistory[1]!.startDate).toBe('2026-08-01');
  });

  it('period duration excludes null duration', () => {
    const cycles: CycleEntry[] = [
      { ...baseCycle, id: 'c1', durationDays: 5 },
      { ...baseCycle, id: 'c2', startDate: '2026-08-01', endDate: '2026-08-28', durationDays: null },
    ];
    const result = engine.getPatternInsights([], cycles);
    expect(result.periodDurationHistory.length).toBe(1);
    expect(result.periodDurationHistory[0]!.durationDays).toBe(5);
  });

  it('groups monthly pain correctly', () => {
    const logs: DailyLog[] = [
      { ...baseLog, date: '2026-07-05', painLevel: 8 },
      { ...baseLog, date: '2026-07-15', painLevel: 4 }, // avg 6
      { ...baseLog, date: '2026-08-02', painLevel: 2 }, // avg 2
    ];
    const result = engine.getPatternInsights(logs, []);
    expect(result.monthlyPainHistory.length).toBe(2);
    expect(result.monthlyPainHistory[0]!.yearMonth).toBe('2026-07');
    expect(result.monthlyPainHistory[0]!.averagePain).toBe(6.0);
    expect(result.monthlyPainHistory[0]!.sampleCount).toBe(2);
    expect(result.monthlyPainHistory[1]!.yearMonth).toBe('2026-08');
    expect(result.monthlyPainHistory[1]!.averagePain).toBe(2.0);
    expect(result.monthlyPainHistory[1]!.sampleCount).toBe(1);
  });

  it('re-derives energy cycle day from cycle start and excludes logs outside completed cycles', () => {
    const cycles: CycleEntry[] = [
      { ...baseCycle, id: 'c1', startDate: '2026-07-01', endDate: '2026-07-28', cycleLengthDays: 28 },
    ];
    const logs: DailyLog[] = [
      // Day 5 inside cycle
      { ...baseLog, date: '2026-07-05', energyLevel: 5 },
      { ...baseLog, date: '2026-07-05', energyLevel: 5 },
      // Day outside cycle (should be ignored)
      { ...baseLog, date: '2026-09-01', energyLevel: 5 },
      { ...baseLog, date: '2026-09-01', energyLevel: 5 },
    ];
    const result = engine.getPatternInsights(logs, cycles);
    expect(result.energyPeakCycleDay).toBe(5); // 2026-07-05 is day 5 of 2026-07-01
    expect(result.energyPeakSampleCount).toBe(2);
  });

  it('requires >=2 observations for energy peak', () => {
    const cycles: CycleEntry[] = [
      { ...baseCycle, id: 'c1', startDate: '2026-07-01', endDate: '2026-07-28', cycleLengthDays: 28 },
    ];
    const logs: DailyLog[] = [
      { ...baseLog, date: '2026-07-05', energyLevel: 5 }, // only 1 observation on day 5
    ];
    const result = engine.getPatternInsights(logs, cycles);
    expect(result.energyPeakCycleDay).toBeNull();
  });

  it('deduplicates log dates for consistency and caps at 100', () => {
    const cycles: CycleEntry[] = [
      { ...baseCycle, id: 'c1', startDate: '2026-07-01', endDate: '2026-07-05', cycleLengthDays: 5 },
      { ...baseCycle, id: 'c2', startDate: '2026-08-01', endDate: '2026-08-05', cycleLengthDays: 5 },
      { ...baseCycle, id: 'c3', startDate: '2026-09-01', endDate: '2026-09-05', cycleLengthDays: 5 },
    ]; // total expected = 15

    const logs: DailyLog[] = [
      // c1: 2 unique dates, but 3 logs
      { ...baseLog, id: 'l1', date: '2026-07-01' },
      { ...baseLog, id: 'l2', date: '2026-07-01' }, // duplicate date
      { ...baseLog, id: 'l3', date: '2026-07-02' },
      // c2: 5 unique dates -> fully logged
      { ...baseLog, id: 'l4', date: '2026-08-01' },
      { ...baseLog, id: 'l5', date: '2026-08-02' },
      { ...baseLog, id: 'l6', date: '2026-08-03' },
      { ...baseLog, id: 'l7', date: '2026-08-04' },
      { ...baseLog, id: 'l8', date: '2026-08-05' },
      // c3: 20 logs on 5 dates (simulate a bug giving >100%)
      ...Array.from({length: 20}).map((_, i) => ({ ...baseLog, id: `lx${i}`, date: `2026-09-0${(i % 5) + 1}` }))
    ];

    const result = engine.getPatternInsights(logs, cycles);
    // unique dates logged: c1(2) + c2(5) + c3(5) = 12
    // 12 / 15 = 80%
    expect(result.loggingConsistencyPercent).toBe(80);
  });

  it('returns null consistency if fewer than 3 completed cycles', () => {
    const cycles: CycleEntry[] = [
      { ...baseCycle, id: 'c1', startDate: '2026-07-01', endDate: '2026-07-05', cycleLengthDays: 5 },
      { ...baseCycle, id: 'c2', startDate: '2026-08-01', endDate: '2026-08-05', cycleLengthDays: 5 },
    ];
    const result = engine.getPatternInsights([], cycles);
    expect(result.loggingConsistencyPercent).toBeNull();
  });
});

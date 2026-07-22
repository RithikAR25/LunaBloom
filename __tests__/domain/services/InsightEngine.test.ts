import { describe, it, expect } from '@jest/globals';
import { InsightEngine } from '../../../src/domain/services/InsightEngine';
import type { DailyLog } from '../../../src/domain/models/DailyLog';
import type { CycleEntry } from '../../../src/domain/models/Cycle';
import type { SyncStatus, FlowIntensity } from '../../../src/domain/models';

describe('InsightEngine', () => {
  const engine = new InsightEngine();

  const mockCycle = (id: string, start: string, end: string | null, length: number | null): CycleEntry => ({
    id,
    startDate: start,
    endDate: end,
    cycleLengthDays: length,
    durationDays: 5,
    notes: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    syncStatus: 'synced' as SyncStatus,
  });

  const mockLog = (date: string, cycleEntryId: string | null, symptoms: string[], moods: string[], pain: number | null, energy: number | null, sleep: number | null): DailyLog => ({
    id: `log-${date}`,
    date,
    cycleEntryId,
    cycleDay: null,
    flowIntensity: null as FlowIntensity | null,
    symptoms,
    moods,
    painLevel: pain,
    energyLevel: energy,
    sleepQuality: sleep,
    sleepHours: null,
    waterIntakeLiters: null,
    exerciseMinutes: null,
    exerciseType: null,
    libidoLevel: null,
    notes: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    syncStatus: 'synced' as SyncStatus,
  });

  const cycles = [
    mockCycle('c1', '2023-01-01', '2023-01-28', 28),
  ];

  it('should categorize log falling on day 1 as MENSTRUAL', () => {
    const logs = [mockLog('2023-01-01', 'c1', ['symp_cramps'], ['mood_sad'], 4, 2, 3)];
    const trends = engine.getSymptomTrends(logs, cycles);
    
    const menstrual = trends.find(t => t.phase === 'MENSTRUAL')!;
    expect(menstrual.topSymptoms[0]!.symptomId).toBe('symp_cramps');
  });

  it('should categorize log outside cycle bounds as UNKNOWN', () => {
    const logs = [mockLog('2022-12-31', 'c1', ['symp_headache'], [], null, null, null)];
    const trends = engine.getSymptomTrends(logs, cycles);
    
    const unknown = trends.find(t => t.phase === 'UNKNOWN')!;
    expect(unknown.topSymptoms[0]!.symptomId).toBe('symp_headache');
  });

  it('should sort symptoms by frequency and return top 3', () => {
    const logs = [
      mockLog('2023-01-01', 'c1', ['a', 'b', 'c', 'd'], [], null, null, null), // Menstrual
      mockLog('2023-01-02', 'c1', ['a', 'b', 'c'], [], null, null, null),      // Menstrual
      mockLog('2023-01-03', 'c1', ['a', 'b'], [], null, null, null),           // Menstrual
      mockLog('2023-01-04', 'c1', ['a'], [], null, null, null),                // Menstrual
    ];
    
    const trends = engine.getSymptomTrends(logs, cycles);
    const menstrual = trends.find(t => t.phase === 'MENSTRUAL')!;
    
    expect(menstrual.topSymptoms.length).toBe(3);
    expect(menstrual.topSymptoms[0]!.symptomId).toBe('a');
    expect(menstrual.topSymptoms[0]!.count).toBe(4);
    expect(menstrual.topSymptoms[1]!.symptomId).toBe('b');
    expect(menstrual.topSymptoms[1]!.count).toBe(3);
  });

  it('should average wellbeing metrics and provide sample counts', () => {
    const logs = [
      mockLog('2023-01-01', 'c1', [], [], 4, null, 3), // Menstrual
      mockLog('2023-01-02', 'c1', [], [], 2, null, 5), // Menstrual
      mockLog('2023-01-10', 'c1', [], [], null, 4, 4), // Follicular (assuming Day 10 is follicular for 28 day cycle)
    ];

    const trends = engine.getWellbeingTrends(logs, cycles);
    
    const menstrual = trends.find(t => t.phase === 'MENSTRUAL')!;
    expect(menstrual.metrics.averagePain).toBe(3); // (4+2)/2
    expect(menstrual.metrics.painSampleCount).toBe(2);
    expect(menstrual.metrics.averageEnergy).toBeNull();
    expect(menstrual.metrics.energySampleCount).toBe(0);
    expect(menstrual.metrics.averageSleep).toBe(4); // (3+5)/2
    expect(menstrual.metrics.sleepSampleCount).toBe(2);

    const follicular = trends.find(t => t.phase === 'FOLLICULAR')!;
    expect(follicular.metrics.averageEnergy).toBe(4);
    expect(follicular.metrics.energySampleCount).toBe(1);
    expect(follicular.metrics.averagePain).toBeNull();
  });
});

import { StartPeriod } from '../StartPeriod';
import { ICycleRepository } from '../../../repositories/ICycleRepository';
import { CycleEntry } from '../../../models/Cycle';
import { ValidationService } from '../../../services/ValidationService';
import { todayISO, addDays } from '../../../../utils/dateUtils';
import { TimelineBuilder } from '../../../prediction/services/TimelineBuilder';
import { CyclePredictionService } from '../../../prediction/services/CyclePredictionService';
import { TimelineEventType } from '../../../prediction/models/TimelineEvent';

class MockCycleRepository implements ICycleRepository {
  private cycles: CycleEntry[] = [];
  
  async getAll(): Promise<CycleEntry[]> {
    return [...this.cycles];
  }
  
  async save(cycle: CycleEntry): Promise<void> {
    this.cycles.push(cycle);
  }

  async getById(id: string): Promise<CycleEntry | null> {
    return this.cycles.find(c => c.id === id) || null;
  }

  async getLastN(n: number): Promise<CycleEntry[]> {
    return this.cycles.slice(-n).reverse();
  }

  async softDelete(id: string): Promise<void> {
    const cycle = await this.getById(id);
    if (cycle) {
      cycle.deletedAt = new Date().toISOString();
    }
  }
  
  async update(id: string, data: Partial<CycleEntry>): Promise<void> {
    const cycle = this.cycles.find(c => c.id === id);
    if (cycle) {
      Object.assign(cycle, data);
    }
  }

  async delete(id: string): Promise<void> {
    this.cycles = this.cycles.filter(c => c.id !== id);
  }

  async mergeCycles(_retainedCycleId: string, _absorbedCycleIds: string[], _mergedData: Partial<CycleEntry>): Promise<void> {
    // Mock implementation
  }

  // Helper for tests to set up initial state
  setCycles(cycles: CycleEntry[]) {
    this.cycles = cycles;
  }
}

describe('StartPeriod Use Case', () => {
  let repo: MockCycleRepository;
  let validationService: ValidationService;
  let startPeriod: StartPeriod;

  beforeEach(() => {
    repo = new MockCycleRepository();
    validationService = new ValidationService();
    startPeriod = new StartPeriod(repo, validationService);
  });

  const today = todayISO();
  const yesterday = addDays(today, -1);
  const twoDaysAgo = addDays(today, -2);
  const threeDaysAgo = addDays(today, -3);
  const fourDaysAgo = addDays(today, -4);
  const fiveDaysAgo = addDays(today, -5);

  it('1. Start today -> active', async () => {
    const cycle = await startPeriod.execute(today, 5);
    expect(cycle.endDate).toBeNull();
    expect(cycle.durationDays).toBeNull();
  });

  it('2. Start yesterday -> active', async () => {
    const cycle = await startPeriod.execute(yesterday, 5);
    expect(cycle.endDate).toBeNull();
    expect(cycle.durationDays).toBeNull();
  });

  it('3. Start 3 days ago with 5-day default -> active', async () => {
    const cycle = await startPeriod.execute(threeDaysAgo, 5);
    expect(cycle.endDate).toBeNull();
    expect(cycle.durationDays).toBeNull();
  });

  it('4. Start 4 days ago with 5-day default -> active today', async () => {
    // 4 days ago (e.g. Aug 10) + (5 - 1) = Aug 14 (today).
    // Because calculatedEndDate >= today, it should still be active today!
    const cycle = await startPeriod.execute(fourDaysAgo, 5);
    expect(cycle.endDate).toBeNull();
    expect(cycle.durationDays).toBeNull();
  });

  it('5. Start 5+ days ago -> historical', async () => {
    // 5 days ago (e.g. Aug 9) + (5 - 1) = Aug 13 (yesterday).
    // calculatedEndDate < today, so it naturally ended.
    const cycle = await startPeriod.execute(fiveDaysAgo, 5);
    expect(cycle.endDate).toBe(addDays(fiveDaysAgo, 4));
    expect(cycle.durationDays).toBe(5);
  });

  it('6. Attempting to create another active cycle when one exists throws error', async () => {
    await startPeriod.execute(threeDaysAgo, 5);
    // There is an active cycle. Trying to log today should throw.
    await expect(startPeriod.execute(today, 5)).rejects.toThrow("You're already tracking a period.");
  });

  it('7. Historical insertion must not overlap the next logged cycle', async () => {
    // There is a cycle starting today.
    await startPeriod.execute(today, 5);
    
    // Attempt to log a period starting 3 days ago.
    // Default duration is 5 days. It would normally extend to today + 1 (future) or today.
    // But there is a cycle starting today.
    // So it should cap at two days ago to avoid touching.
    const cycle = await startPeriod.execute(threeDaysAgo, 5);
    expect(cycle.endDate).toBe(twoDaysAgo);
    expect(cycle.durationDays).toBe(2); // threeDaysAgo, twoDaysAgo
  });

  it('8. Uses custom/default duration provided', async () => {
    // Custom duration of 3 days. Log 3 days ago.
    // 3 days ago + (3 - 1) = 1 day ago (yesterday).
    // It should be historical because it ended yesterday.
    const cycle = await startPeriod.execute(threeDaysAgo, 3);
    expect(cycle.endDate).toBe(yesterday);
    expect(cycle.durationDays).toBe(3);
  });

  describe('End-to-End Regression (Aug 12 bug)', () => {
    it('integrates properly with TimelineBuilder', async () => {
      // Mock today as 2026-08-14
      jest.useFakeTimers().setSystemTime(new Date('2026-08-14T12:00:00Z'));
      
      const startDate = '2026-08-12';
      const referenceDate = '2026-08-14'; // Today
      const defaultDuration = 5;

      // Make sure ValidationService understands what today is in tests
      const validationService = new ValidationService();
      const repo = new MockCycleRepository();
      const localStartPeriod = new StartPeriod(repo, validationService);

      const cycle = await localStartPeriod.execute(startDate, defaultDuration);
      
      // Asset StartPeriod output
      expect(cycle.endDate).toBeNull();
      expect(cycle.durationDays).toBeNull();

      // Pass through TimelineBuilder
      const predictionService = new CyclePredictionService();
      const timelineBuilder = new TimelineBuilder(predictionService);
      
      const prediction = predictionService.predict([cycle], 28, defaultDuration);
      
      const { events, intervals } = timelineBuilder.build([cycle], prediction, referenceDate, defaultDuration);
      
      // Expected Logged Menstrual events
      const loggedPeriodEvent = events.find(e => e.source === 'LOGGED' && e.type === TimelineEventType.PERIOD);
      expect(loggedPeriodEvent).toBeDefined();
      expect(loggedPeriodEvent!.date).toBe('2026-08-12');
      expect(loggedPeriodEvent!.duration).toBe(3); // Aug 12, 13, 14
      
      const loggedPeriodInterval = intervals.find(i => i.source === 'LOGGED' && i.phase === 'MENSTRUAL');
      expect(loggedPeriodInterval).toBeDefined();
      expect(loggedPeriodInterval!.startDate).toBe('2026-08-12');
      expect(loggedPeriodInterval!.endDate).toBe('2026-08-14');

      // Expected Predicted Menstrual
      const predictedPeriodInterval = intervals.find(i => i.source === 'PREDICTED' && i.phase === 'MENSTRUAL' && i.startDate === '2026-08-15');
      expect(predictedPeriodInterval).toBeDefined();
      expect(predictedPeriodInterval!.endDate).toBe('2026-08-16');

      // Expected Predicted Follicular
      const follicularInterval = intervals.find(i => i.phase === 'FOLLICULAR');
      expect(follicularInterval).toBeDefined();
      expect(follicularInterval!.startDate).toBe('2026-08-17');

      jest.useRealTimers();
    });
  });
});

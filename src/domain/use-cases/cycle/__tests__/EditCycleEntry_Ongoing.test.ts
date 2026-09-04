import { EditCycleEntry } from '../EditCycleEntry';
import { StartPeriod } from '../StartPeriod';
import { CycleDurationResolver } from '../../../services/CycleDurationResolver';
import { ValidationService } from '../../../services/ValidationService';
import type { CycleEntry } from '../../../models/Cycle';
import { todayISO, addDays } from '../../../../utils/dateUtils';
import { MergeRequiredError } from '../../../errors';

describe('EditCycleEntry - Ongoing Cycle Normalization', () => {
  let mockRepo: any;
  let validationService: ValidationService;
  let useCase: EditCycleEntry;
  const today = todayISO();

  beforeEach(() => {
    mockRepo = {
      getAll: async () => [],
      getById: async (id: string) => ({ id, startDate: '2020-01-01', endDate: '2020-01-05' } as CycleEntry),
      save: async () => {},
      update: async () => {},
      mergeCycles: async () => {},
    };
    validationService = new ValidationService();
    useCase = new EditCycleEntry(mockRepo, validationService);
  });

  it('Historical start + clear end -> caps at natural 5-day end', async () => {
    const historicalStart = addDays(today, -10);
    const naturalEnd = addDays(historicalStart, 4);

    let updateArgs: any;
    mockRepo.update = async (_id: string, data: any) => {
      if ('endDate' in data) {
        updateArgs = data;
      }
    };

    await useCase.execute('1', historicalStart, null, 5, null, false, false);
    
    // It should normalize endDate to naturalEnd before persisting
    expect(updateArgs.endDate).toBe(naturalEnd);
    expect(updateArgs.durationDays).toBe(5);
  });

  it('Yesterday + clear end -> remains null (ongoing)', async () => {
    const yesterday = addDays(today, -1);
    
    let updateArgs: any;
    mockRepo.update = async (_id: string, data: any) => {
      if ('endDate' in data) {
        updateArgs = data;
      }
    };

    await useCase.execute('1', yesterday, null, 5, null, false, false);
    
    expect(updateArgs.endDate).toBeNull();
  });

  it('Start exactly at the boundary where natural end is today -> remains null', async () => {
    // If default duration is 5, starting 4 days ago means natural end is today
    const boundaryStart = addDays(today, -4);
    
    let updateArgs: any;
    mockRepo.update = async (_id: string, data: any) => {
      if ('endDate' in data) {
        updateArgs = data;
      }
    };

    await useCase.execute('1', boundaryStart, null, 5, null, false, false);
    
    expect(updateArgs.endDate).toBeNull();
  });

  it('Explicit end -> untouched', async () => {
    const explicitStart = addDays(today, -10);
    const explicitEnd = addDays(today, -5);
    
    let updateArgs: any;
    mockRepo.update = async (_id: string, data: any) => {
      if ('endDate' in data) {
        updateArgs = data;
      }
    };

    await useCase.execute('1', explicitStart, explicitEnd, 5, null, false, false);
    
    expect(updateArgs.endDate).toBe(explicitEnd);
  });

  it('Historical clear-end whose natural interval is adjacent to another cycle -> triggers normal merge detection', async () => {
    const historicalStart = addDays(today, -20);
    const naturalEnd = addDays(historicalStart, 4); // i.e., -16
    
    // Existing cycle naturally adjacent
    mockRepo.getAll = async () => [
      { id: '2', startDate: addDays(naturalEnd, 1), endDate: addDays(naturalEnd, 5), isExcludedFromPredictions: false }
    ];

    await expect(useCase.execute('1', historicalStart, null, 5, null, false, false)).rejects.toThrow(MergeRequiredError);
  });

  it('Historical clear-end whose natural interval is separated by one unlogged day -> no merge', async () => {
    const historicalStart = addDays(today, -20);
    const naturalEnd = addDays(historicalStart, 4); // i.e., -16
    
    // Existing cycle separated by ONE CLEAR DAY
    mockRepo.getAll = async () => [
      { id: '2', startDate: addDays(naturalEnd, 2), endDate: addDays(naturalEnd, 6), isExcludedFromPredictions: false }
    ];

    let updateArgs: any;
    mockRepo.update = async (_id: string, data: any) => {
      if ('endDate' in data) {
        updateArgs = data;
      }
    };

    // Should NOT throw MergeRequiredError, will just persist
    await useCase.execute('1', historicalStart, null, 5, null, false, false);
    
    expect(updateArgs.endDate).toBe(naturalEnd);
  });

  it('StartPeriod and EditCycleEntry produce the same natural-end result for equivalent inputs', async () => {
    const start = addDays(today, -30);
    const defaultDuration = 5;
    
    // Resolve naturally
    const resolverResult = CycleDurationResolver.resolveEndDate(start, defaultDuration);
    expect(resolverResult).toBe(addDays(start, 4));

    // StartPeriod result
    const startPeriodUC = new StartPeriod(mockRepo, validationService);
    let startPeriodResult: any = null;
    mockRepo.save = async (entry: CycleEntry) => { startPeriodResult = entry; };
    await startPeriodUC.execute(start, defaultDuration, false);
    
    // EditCycleEntry result
    let updateResultArgs: any;
    mockRepo.update = async (_id: string, data: any) => {
      if ('endDate' in data) {
        updateResultArgs = data;
      }
    };
    await useCase.execute('1', start, null, defaultDuration, null, false, false);

    expect(startPeriodResult?.endDate).toBe(resolverResult);
    expect(updateResultArgs.endDate).toBe(resolverResult);
  });
});

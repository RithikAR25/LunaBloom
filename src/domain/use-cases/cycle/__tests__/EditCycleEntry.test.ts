import { EditCycleEntry } from '../EditCycleEntry';
import type { ICycleRepository } from '../../../repositories/ICycleRepository';
import { ValidationService } from '../../../services/ValidationService';
import { addDays, todayISO } from '../../../../utils/dateUtils';
import { MergeRequiredError, ValidationError } from '../../../errors';
import type { CycleEntry } from '../../../models/Cycle';

describe('EditCycleEntry', () => {
  let editCycleEntry: EditCycleEntry;
  let mockCycleRepository: jest.Mocked<ICycleRepository>;
  let mockValidationService: jest.Mocked<ValidationService>;

  const defaultDuration = 5;

  beforeEach(() => {
    mockCycleRepository = {
      save: jest.fn(),
      getAll: jest.fn(),
      getById: jest.fn(),
      getLastN: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      mergeCycles: jest.fn(),
    };

    mockValidationService = {
      validateHistoricalDate: jest.fn().mockReturnValue({ isValid: true }),
      validatePeriodOverlap: jest.fn().mockReturnValue({ isValid: true }),
      validateCycleLength: jest.fn(),
      validateNotesLength: jest.fn(),
    } as any;

    editCycleEntry = new EditCycleEntry(mockCycleRepository, mockValidationService);
  });

  const createMockCycle = (id: string, start: string, end: string | null, notes: string | null = null, excluded = false): CycleEntry => ({
    id,
    startDate: start,
    endDate: end,
    durationDays: end ? 5 : null,
    cycleLengthDays: 28,
    notes,
    isExcludedFromPredictions: excluded,
    createdAt: '2023-01-01',
    updatedAt: '2023-01-01',
    deletedAt: null,
    syncStatus: 'LOCAL',
  });

  describe('Standard Edit Flow', () => {
    it('updates cycle successfully when no overlaps exist', async () => {
      const existing = createMockCycle('cycle-1', '2023-08-01', '2023-08-05');
      mockCycleRepository.getById.mockResolvedValue(existing);
      mockCycleRepository.getAll.mockResolvedValue([existing]);

      await editCycleEntry.execute('cycle-1', '2023-08-02', '2023-08-06', defaultDuration, 'New notes');

      expect(mockCycleRepository.update).toHaveBeenCalledWith('cycle-1', expect.objectContaining({
        startDate: '2023-08-02',
        endDate: '2023-08-06',
        notes: 'New notes'
      }));
      expect(mockCycleRepository.mergeCycles).not.toHaveBeenCalled();
    });

    it('throws validation error if end date is before start date', async () => {
      mockCycleRepository.getById.mockResolvedValue(createMockCycle('1', '2023-08-01', '2023-08-05'));
      
      await expect(
        editCycleEntry.execute('1', '2023-08-10', '2023-08-05', defaultDuration)
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('MergeRequiredError Trigger', () => {
    it('throws MergeRequiredError if an overlap is detected and confirmMerge is false', async () => {
      const existing = createMockCycle('cycle-1', '2023-08-01', '2023-08-05');
      const overlapping = createMockCycle('cycle-2', '2023-08-06', '2023-08-10');
      
      mockCycleRepository.getById.mockResolvedValue(existing);
      mockCycleRepository.getAll.mockResolvedValue([existing, overlapping]);

      // Edit cycle-1 to touch cycle-2 (gap of 0 days)
      await expect(
        editCycleEntry.execute('cycle-1', '2023-08-01', '2023-08-05', defaultDuration, 'notes', false, false)
      ).rejects.toThrow(MergeRequiredError);
      
      expect(mockCycleRepository.mergeCycles).not.toHaveBeenCalled();
    });
  });

  describe('Merge Execution', () => {
    it('merges cycles when confirmMerge is true', async () => {
      const existing = createMockCycle('cycle-1', '2023-08-01', '2023-08-05', 'First note', false);
      const overlapping = createMockCycle('cycle-2', '2023-08-06', '2023-08-10', 'Second note', true);
      
      mockCycleRepository.getById.mockResolvedValue(existing);
      mockCycleRepository.getAll.mockResolvedValue([existing, overlapping]);

      await editCycleEntry.execute('cycle-1', '2023-08-01', '2023-08-05', defaultDuration, 'Edited first note', false, true);

      expect(mockCycleRepository.mergeCycles).toHaveBeenCalledWith(
        'cycle-1',
        ['cycle-2'],
        expect.objectContaining({
          startDate: '2023-08-01',
          endDate: '2023-08-05', // requested intent wins
          notes: 'Edited first note\n\nSecond note',
          isExcludedFromPredictions: true // OR logic
        })
      );
    });

    it('does not merge if there is a gap of 1 unlogged day (e.g., Aug 6 is empty)', async () => {
      const existing = createMockCycle('cycle-1', '2023-08-01', '2023-08-05');
      const future = createMockCycle('cycle-2', '2023-08-07', '2023-08-10'); // Aug 6 is a gap
      
      mockCycleRepository.getById.mockResolvedValue(existing);
      mockCycleRepository.getAll.mockResolvedValue([existing, future]);

      await editCycleEntry.execute('cycle-1', '2023-08-01', '2023-08-05', defaultDuration, 'notes', false, false);

      expect(mockCycleRepository.update).toHaveBeenCalled();
      expect(mockCycleRepository.mergeCycles).not.toHaveBeenCalled();
    });

    it('active cycle rule: concrete request closes active cycle', async () => {
      const existing = createMockCycle('cycle-1', '2023-08-25', '2023-08-28');
      const active = createMockCycle('cycle-2', '2023-08-01', null); // Active
      
      mockCycleRepository.getById.mockResolvedValue(existing);
      mockCycleRepository.getAll.mockResolvedValue([existing, active]);

      // User requests concrete end date '2023-08-29'
      await editCycleEntry.execute('cycle-1', '2023-08-25', '2023-08-29', defaultDuration, null, false, true);

      expect(mockCycleRepository.mergeCycles).toHaveBeenCalledWith(
        'cycle-1',
        ['cycle-2'],
        expect.objectContaining({
          startDate: '2023-08-01',
          endDate: '2023-08-29', // Concrete date wins, closing active cycle
        })
      );
    });

    it('active cycle rule: null request maintains active cycle', async () => {
      // Need a recent date so that natural duration doesn't cap it
      const recentStart = todayISO(); 
      const existing = createMockCycle('cycle-1', recentStart, addDays(recentStart, 2));
      const future = createMockCycle('cycle-2', addDays(recentStart, 4), addDays(recentStart, 9));
      
      mockCycleRepository.getById.mockResolvedValue(existing);
      mockCycleRepository.getAll.mockResolvedValue([existing, future]);

      // User sets end date to null, absorbing cycle-2
      await editCycleEntry.execute('cycle-1', recentStart, null, defaultDuration, null, false, true);

      expect(mockCycleRepository.mergeCycles).toHaveBeenCalledWith(
        'cycle-1',
        ['cycle-2'],
        expect.objectContaining({
          startDate: recentStart,
          endDate: null, // Null request wins, creating active cycle
        })
      );
    });

    it('consolidates notes chronologically with deduplication and whitespace removal', async () => {
      const cycle1 = createMockCycle('c1', '2023-08-01', '2023-08-05', '  Same note  ');
      const cycle2 = createMockCycle('c2', '2023-08-06', '2023-08-10', 'Same note');
      const cycle3 = createMockCycle('c3', '2023-07-26', '2023-07-31', '  '); // empty, adjacent to target start
      
      mockCycleRepository.getById.mockResolvedValue(cycle1);
      mockCycleRepository.getAll.mockResolvedValue([cycle1, cycle2, cycle3]);

      await editCycleEntry.execute('c1', '2023-08-01', '2023-08-05', defaultDuration, 'New note', false, true);

      // Order: c3 (empty), c1 (New note), c2 (Same note)
      expect(mockCycleRepository.mergeCycles).toHaveBeenCalledWith(
        'c1',
        ['c2', 'c3'], // Both c2 and c3 are merged
        expect.objectContaining({
          notes: 'New note\n\nSame note'
        })
      );
    });
  });
});

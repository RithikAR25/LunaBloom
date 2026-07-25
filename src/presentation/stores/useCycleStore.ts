/**
 * useCycleStore — Zustand store for cycle entries.
 * Follows same injected-repository pattern as useProfileStore.
 */
import { create } from 'zustand';
import type { CycleEntry } from '../../domain/models/Cycle';
import type { ICycleRepository } from '../../domain/repositories/ICycleRepository';
import { RepositoryError } from '../../domain/errors';
import { StartPeriod } from '../../domain/use-cases/cycle/StartPeriod';
import { EndPeriod } from '../../domain/use-cases/cycle/EndPeriod';
import { EditCycleEntry } from '../../domain/use-cases/cycle/EditCycleEntry';
import { DeleteCycleEntry } from '../../domain/use-cases/cycle/DeleteCycleEntry';
import { ValidationService } from '../../domain/services/ValidationService';
import { NotificationService } from '../../application/services/NotificationService';

type CycleState = {
  cycles: CycleEntry[];
  activeCycle: CycleEntry | null; // cycle with no endDate
  isLoading: boolean;
  error: string | null;
  _repository: ICycleRepository | null;

  setRepository: (repo: ICycleRepository) => void;
  loadCycles: () => Promise<void>;
  startPeriod: (startDate: string) => Promise<void>;
  endPeriod: (endDate: string) => Promise<void>;
  editCycle: (id: string, startDate: string, endDate: string | null, notes: string | null, isExcludedFromPredictions?: boolean) => Promise<void>;
  deleteCycle: (id: string) => Promise<void>;
  clearError: () => void;
};

export const useCycleStore = create<CycleState>((set, get) => ({
  cycles: [],
  activeCycle: null,
  isLoading: false,
  error: null,
  _repository: null,

  setRepository: (repo) => set({ _repository: repo }),

  loadCycles: async () => {
    const { _repository } = get();
    if (!_repository) throw new Error('[useCycleStore] Repository not injected');

    set({ isLoading: true, error: null });
    try {
      const cycles = await _repository.getAll();
      const activeCycle = cycles.find((c) => c.endDate === null) ?? null;
      set({ cycles, activeCycle, isLoading: false });
      
      // Reschedule any local notifications based on new cycle data
      void NotificationService.rescheduleIfEnabled(cycles);
    } catch (err) {
      const message = err instanceof RepositoryError ? err.message : 'Failed to load cycles';
      set({ error: message, isLoading: false });
    }
  },

  startPeriod: async (startDate: string) => {
    const { _repository } = get();
    if (!_repository) throw new Error('[useCycleStore] Repository not injected');

    set({ isLoading: true, error: null });
    try {
      const validationService = new ValidationService();
      const startPeriodUC = new StartPeriod(_repository, validationService);
      await startPeriodUC.execute(startDate);
      await get().loadCycles();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start period';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  endPeriod: async (endDate: string) => {
    const { _repository } = get();
    if (!_repository) throw new Error('[useCycleStore] Repository not injected');

    set({ isLoading: true, error: null });
    try {
      const validationService = new ValidationService();
      const endPeriodUC = new EndPeriod(_repository, validationService);
      await endPeriodUC.execute(endDate);
      await get().loadCycles();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to end period';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  editCycle: async (id: string, startDate: string, endDate: string | null, notes: string | null, isExcludedFromPredictions?: boolean) => {
    const { _repository } = get();
    if (!_repository) throw new Error('[useCycleStore] Repository not injected');

    set({ isLoading: true, error: null });
    try {
      const validationService = new ValidationService();
      const editCycleUC = new EditCycleEntry(_repository, validationService);
      await editCycleUC.execute(id, startDate, endDate, notes, isExcludedFromPredictions);
      await get().loadCycles();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to edit cycle';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  deleteCycle: async (id: string) => {
    const { _repository } = get();
    if (!_repository) throw new Error('[useCycleStore] Repository not injected');

    set({ isLoading: true, error: null });
    try {
      const deleteCycleUC = new DeleteCycleEntry(_repository);
      await deleteCycleUC.execute(id);
      await get().loadCycles();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete cycle';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));


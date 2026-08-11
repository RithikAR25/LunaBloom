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
import { useProfileStore } from './useProfileStore';

type CycleState = {
  cycles: CycleEntry[];
  activeCycle: CycleEntry | null; // cycle with no endDate
  isLoading: boolean;
  error: string | null;
  _repository: ICycleRepository | null;

  setRepository: (repo: ICycleRepository) => void;
  loadCycles: () => Promise<void>;
  startPeriod: (startDate: string, isExcludedFromPredictions?: boolean) => Promise<void>;
  endPeriod: (endDate: string, isExcludedFromPredictions?: boolean) => Promise<void>;
  editCycle: (id: string, startDate: string, endDate: string | null, notes: string | null, isExcludedFromPredictions?: boolean) => Promise<void>;
  deleteCycle: (id: string) => Promise<void>;
  clearError: () => void;
};

export const useCycleStore = create<CycleState>((set, get) => ({
  cycles: [],
  activeCycle: null,
  isLoading: true,
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
      set({ cycles, activeCycle });
      
      // Reschedule any local notifications based on new cycle data
      void NotificationService.rescheduleIfEnabled(cycles);
    } catch (err) {
      const message = err instanceof RepositoryError ? err.message : 'Failed to load cycles';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  startPeriod: async (startDate: string, isExcludedFromPredictions?: boolean) => {
    const { _repository } = get();
    if (!_repository) throw new Error('[useCycleStore] Repository not injected');

    set({ isLoading: true, error: null });
    try {
      const defaultDuration = useProfileStore.getState().profile?.avgPeriodDuration || 5;
      const validationService = new ValidationService();
      const startPeriodUC = new StartPeriod(_repository, validationService);
      await startPeriodUC.execute(startDate, defaultDuration, isExcludedFromPredictions);
      await get().loadCycles();
    } catch (err) {
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  endPeriod: async (endDate: string, isExcludedFromPredictions?: boolean) => {
    const { _repository } = get();
    if (!_repository) throw new Error('[useCycleStore] Repository not injected');

    set({ isLoading: true, error: null });
    try {
      const validationService = new ValidationService();
      const endPeriodUC = new EndPeriod(_repository, validationService);
      await endPeriodUC.execute(endDate, isExcludedFromPredictions);
      await get().loadCycles();
    } catch (err) {
      throw err;
    } finally {
      set({ isLoading: false });
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
      throw err;
    } finally {
      set({ isLoading: false });
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
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));


/**
 * useCycleStore — Zustand store for cycle entries.
 * Follows same injected-repository pattern as useProfileStore.
 */
import { create } from 'zustand';
import type { CycleEntry } from '../../domain/models/Cycle';
import type { ICycleRepository } from '../../domain/repositories/ICycleRepository';
import { RepositoryError } from '../../domain/errors';

type CycleState = {
  cycles: CycleEntry[];
  activeCycle: CycleEntry | null; // cycle with no endDate
  isLoading: boolean;
  error: string | null;
  _repository: ICycleRepository | null;

  setRepository: (repo: ICycleRepository) => void;
  loadCycles: () => Promise<void>;
  saveCycle: (cycle: CycleEntry) => Promise<void>;
  updateCycle: (id: string, data: Partial<CycleEntry>) => Promise<void>;
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
    } catch (err) {
      const message = err instanceof RepositoryError ? err.message : 'Failed to load cycles';
      set({ error: message, isLoading: false });
    }
  },

  saveCycle: async (cycle) => {
    const { _repository } = get();
    if (!_repository) throw new Error('[useCycleStore] Repository not injected');

    set({ isLoading: true, error: null });
    try {
      await _repository.save(cycle);
      await get().loadCycles(); // refresh
    } catch (err) {
      const message = err instanceof RepositoryError ? err.message : 'Failed to save cycle';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  updateCycle: async (id, data) => {
    const { _repository } = get();
    if (!_repository) throw new Error('[useCycleStore] Repository not injected');

    set({ isLoading: true, error: null });
    try {
      await _repository.update(id, data);
      await get().loadCycles();
    } catch (err) {
      const message = err instanceof RepositoryError ? err.message : 'Failed to update cycle';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  deleteCycle: async (id) => {
    const { _repository } = get();
    if (!_repository) throw new Error('[useCycleStore] Repository not injected');

    set({ isLoading: true, error: null });
    try {
      await _repository.softDelete(id);
      await get().loadCycles();
    } catch (err) {
      const message = err instanceof RepositoryError ? err.message : 'Failed to delete cycle';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));

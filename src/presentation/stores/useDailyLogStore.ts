/**
 * useDailyLogStore — Zustand store for daily logs.
 */
import { create } from 'zustand';
import type { DailyLog } from '../../domain/models/DailyLog';
import type { IDailyLogRepository } from '../../domain/repositories/IDailyLogRepository';
import { RepositoryError } from '../../domain/errors';
import { SaveDailyLog } from '../../domain/use-cases/log/SaveDailyLog';
import { useCycleStore } from './useCycleStore';


type DailyLogState = {
  logs: Record<string, DailyLog>; // map of date to log
  currentLog: DailyLog | null; // log for the currently selected date (usually today)
  isLoading: boolean;
  error: string | null;
  _repository: IDailyLogRepository | null;

  setRepository: (repo: IDailyLogRepository) => void;
  loadLogForDate: (date: string) => Promise<void>;
  loadLogsForRange: (fromDate: string, toDate: string) => Promise<void>;
  saveLogData: (date: string, data: Partial<DailyLog>) => Promise<void>;
  updateLog: (id: string, data: Partial<DailyLog>) => Promise<void>;
  deleteLog: (id: string) => Promise<void>;
  clearError: () => void;
};

export const useDailyLogStore = create<DailyLogState>((set, get) => ({
  logs: {},
  currentLog: null,
  isLoading: false,
  error: null,
  _repository: null,

  setRepository: (repo) => set({ _repository: repo }),

  loadLogForDate: async (date: string) => {
    const { _repository } = get();
    if (!_repository) throw new Error('[useDailyLogStore] Repository not injected');

    set({ isLoading: true, error: null });
    try {
      const log = await _repository.getByDate(date);
      set((state) => ({
        logs: log ? { ...state.logs, [date]: log } : state.logs,
        currentLog: log,
        isLoading: false,
      }));
    } catch (err) {
      const message = err instanceof RepositoryError ? err.message : 'Failed to load daily log';
      set({ error: message, isLoading: false });
    }
  },

  loadLogsForRange: async (fromDate: string, toDate: string) => {
    const { _repository } = get();
    if (!_repository) throw new Error('[useDailyLogStore] Repository not injected');

    set({ isLoading: true, error: null });
    try {
      const logsArray = await _repository.getRange(fromDate, toDate);
      const logsMap: Record<string, DailyLog> = {};
      logsArray.forEach((log) => {
        logsMap[log.date] = log;
      });

      set((state) => ({
        logs: { ...state.logs, ...logsMap },
        isLoading: false,
      }));
    } catch (err) {
      const message = err instanceof RepositoryError ? err.message : 'Failed to load logs range';
      set({ error: message, isLoading: false });
    }
  },

  saveLogData: async (date: string, logData: Partial<DailyLog>) => {
    const { _repository } = get();
    if (!_repository) throw new Error('[useDailyLogStore] Repository not injected');

    set({ isLoading: true, error: null });
    try {
      const activeCycle = useCycleStore.getState().activeCycle;
      const useCase = new SaveDailyLog(_repository);
      const savedLog = await useCase.execute(date, logData, activeCycle || null);
      
      set((state) => ({
        logs: { ...state.logs, [savedLog.date]: savedLog },
        currentLog: state.currentLog?.date === savedLog.date ? savedLog : state.currentLog,
        isLoading: false,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save daily log';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  updateLog: async (id, data) => {
    const { _repository } = get();
    if (!_repository) throw new Error('[useDailyLogStore] Repository not injected');

    set({ isLoading: true, error: null });
    try {
      await _repository.update(id, data);
      const updatedLog = await _repository.getById(id);
      if (updatedLog) {
        set((state) => ({
          logs: { ...state.logs, [updatedLog.date]: updatedLog },
          currentLog: state.currentLog?.id === id ? updatedLog : state.currentLog,
          isLoading: false,
        }));
      } else {
        set({ isLoading: false });
      }
    } catch (err) {
      const message = err instanceof RepositoryError ? err.message : 'Failed to update daily log';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  deleteLog: async (id) => {
    const { _repository } = get();
    if (!_repository) throw new Error('[useDailyLogStore] Repository not injected');

    set({ isLoading: true, error: null });
    try {
      await _repository.softDelete(id);
      
      const logDate = Object.values(get().logs).find(l => l.id === id)?.date;
      
      set((state) => {
        const newLogs = { ...state.logs };
        if (logDate) {
          delete newLogs[logDate];
        }
        return {
          logs: newLogs,
          currentLog: state.currentLog?.id === id ? null : state.currentLog,
          isLoading: false,
        };
      });
    } catch (err) {
      const message = err instanceof RepositoryError ? err.message : 'Failed to delete daily log';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));

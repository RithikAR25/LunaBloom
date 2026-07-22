import { create } from 'zustand';
import { UserGoal } from '../../domain/models/index';

interface OnboardingState {
  preferredName: string | null;
  dateOfBirth: string | null;
  avgCycleLength: number;
  avgPeriodDuration: number;
  lastPeriodDate: string | null;
  isPeriodActive: boolean;
  primaryGoal: UserGoal | null;
  conditions: string[];
  
  updateField: <K extends keyof Omit<OnboardingState, 'updateField' | 'reset'>>(
    key: K,
    value: OnboardingState[K]
  ) => void;
  reset: () => void;
}

const initialState = {
  preferredName: null,
  dateOfBirth: null,
  avgCycleLength: 28,
  avgPeriodDuration: 5,
  lastPeriodDate: null,
  isPeriodActive: false,
  primaryGoal: null,
  conditions: [],
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  ...initialState,
  updateField: (key, value) => set((state) => ({ ...state, [key]: value })),
  reset: () => set(initialState),
}));

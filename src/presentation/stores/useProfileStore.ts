/**
 * useProfileStore — Zustand store for the user profile.
 *
 * Pattern:
 * - Store holds loaded domain model in memory
 * - loadProfile() reads from repository and populates store
 * - updateProfile() writes to repository then refreshes
 * - UI subscribes to store; never talks to repository directly
 *
 * Navigation Gate usage:
 *   const { profile, isLoading } = useProfileStore();
 *   if (!isLoading && !profile?.onboardingCompleted) redirect('/onboarding')
 */
import { create } from 'zustand';
import type { UserProfile } from '../../domain/models/UserProfile';
import type { IUserProfileRepository } from '../../domain/repositories/IUserProfileRepository';
import { RepositoryError } from '../../domain/errors';

type ProfileState = {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;

  // Injected repository — set by RepositoryProvider at startup
  _repository: IUserProfileRepository | null;

  // Actions
  setRepository: (repo: IUserProfileRepository) => void;
  loadProfile: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  clearError: () => void;
};

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  isLoading: false,
  error: null,
  _repository: null,

  setRepository: (repo) => set({ _repository: repo }),

  loadProfile: async () => {
    const { _repository } = get();
    if (!_repository) throw new Error('[useProfileStore] Repository not injected');

    set({ isLoading: true, error: null });
    try {
      const profile = await _repository.get();
      set({ profile, isLoading: false });
    } catch (err) {
      const message = err instanceof RepositoryError ? err.message : 'Failed to load profile';
      set({ error: message, isLoading: false });
    }
  },

  updateProfile: async (data) => {
    const { _repository } = get();
    if (!_repository) throw new Error('[useProfileStore] Repository not injected');

    set({ isLoading: true, error: null });
    try {
      await _repository.update(data);
      // Refresh from source of truth
      const profile = await _repository.get();
      set({ profile, isLoading: false });
    } catch (err) {
      const message = err instanceof RepositoryError ? err.message : 'Failed to update profile';
      set({ error: message, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));

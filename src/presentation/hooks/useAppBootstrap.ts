/**
 * useAppBootstrap — loads all initial data after providers are mounted.
 *
 * Called once in the root layout. Triggers parallel loading of profile and
 * cycles. Navigation gate logic reads from these stores.
 */
import { useEffect } from 'react';
import { useProfileStore } from '../stores/useProfileStore';
import { useCycleStore } from '../stores/useCycleStore';

type BootstrapState = {
  isReady: boolean;
  error: string | null;
};

export function useAppBootstrap(): BootstrapState {
  const loadProfile = useProfileStore((s) => s.loadProfile);
  const loadCycles = useCycleStore((s) => s.loadCycles);
  const profileLoading = useProfileStore((s) => s.isLoading);
  const cycleLoading = useCycleStore((s) => s.isLoading);
  const profileError = useProfileStore((s) => s.error);

  useEffect(() => {
    void loadProfile();
    void loadCycles();
  }, [loadProfile, loadCycles]);

  const isReady = !profileLoading && !cycleLoading;

  return { isReady, error: profileError };
}

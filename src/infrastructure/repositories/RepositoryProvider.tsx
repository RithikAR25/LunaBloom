/**
 * RepositoryProvider — Dependency Injection container.
 *
 * Instantiates all concrete repository implementations and injects them into
 * Zustand stores. Must be mounted after DatabaseProvider (database must be ready).
 *
 * This is the ONLY place in the app that imports concrete repository classes.
 * All other code depends on interfaces (ICycleRepository etc).
 *
 * To swap SQLite for Firebase in V2: replace the concrete classes here only.
 */
import React from 'react';
import { SQLiteCycleRepository } from '../repositories/SQLiteCycleRepository';
import { SQLiteUserProfileRepository } from '../repositories/SQLiteUserProfileRepository';
import { SQLiteDailyLogRepository } from '../repositories/SQLiteDailyLogRepository';
import { JsonContentRepository } from '../repositories/JsonContentRepository';
import { useCycleStore } from '../../presentation/stores/useCycleStore';
import { useProfileStore } from '../../presentation/stores/useProfileStore';
import { useDailyLogStore } from '../../presentation/stores/useDailyLogStore';
import { useContentStore } from '../../presentation/stores/useContentStore';

export function RepositoryProvider({ children }: { children: React.ReactNode }) {
  // Synchronous injection — happens before first render of children
  if (!useProfileStore.getState()._repository) {
    const cycleRepo = new SQLiteCycleRepository();
    const profileRepo = new SQLiteUserProfileRepository();
    const dailyLogRepo = new SQLiteDailyLogRepository();
    const contentRepo = new JsonContentRepository();

    useCycleStore.getState().setRepository(cycleRepo);
    useProfileStore.getState().setRepository(profileRepo);
    useDailyLogStore.getState().setRepository(dailyLogRepo);
    useContentStore.getState().setRepository(contentRepo);
  }


  return <>{children}</>;
}

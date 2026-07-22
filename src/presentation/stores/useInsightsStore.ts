import { create } from 'zustand';
import type { ICycleRepository } from '../../domain/repositories/ICycleRepository';
import type { IDailyLogRepository } from '../../domain/repositories/IDailyLogRepository';
import type { IUserProfileRepository } from '../../domain/repositories/IUserProfileRepository';
import type { 
  CycleStatistics, 
  PhaseSymptomTrends, 
  PhaseMoodTrends, 
  PhaseWellbeingTrends 
} from '../../domain/models/Insights';

import { GetCycleStatistics } from '../../domain/use-cases/insights/GetCycleStatistics';
import { GetSymptomTrends } from '../../domain/use-cases/insights/GetSymptomTrends';
import { GetMoodTrends } from '../../domain/use-cases/insights/GetMoodTrends';
import { GetWellbeingTrends } from '../../domain/use-cases/insights/GetWellbeingTrends';

type InsightsState = {
  cycleStats: CycleStatistics | null;
  symptomTrends: PhaseSymptomTrends[] | null;
  moodTrends: PhaseMoodTrends[] | null;
  wellbeingTrends: PhaseWellbeingTrends[] | null;
  
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;

  _cycleRepo: ICycleRepository | null;
  _logRepo: IDailyLogRepository | null;
  _profileRepo: IUserProfileRepository | null;

  setRepositories: (cycleRepo: ICycleRepository, logRepo: IDailyLogRepository, profileRepo: IUserProfileRepository) => void;
  loadInsights: () => Promise<void>;
};

export const useInsightsStore = create<InsightsState>((set, get) => ({
  cycleStats: null,
  symptomTrends: null,
  moodTrends: null,
  wellbeingTrends: null,
  
  isLoading: false,
  error: null,
  lastUpdated: null,

  _cycleRepo: null,
  _logRepo: null,
  _profileRepo: null,

  setRepositories: (cycleRepo, logRepo, profileRepo) => 
    set({ _cycleRepo: cycleRepo, _logRepo: logRepo, _profileRepo: profileRepo }),

  loadInsights: async () => {
    const { _cycleRepo, _logRepo, _profileRepo } = get();
    if (!_cycleRepo || !_logRepo || !_profileRepo) {
      throw new Error('[useInsightsStore] Repositories not injected');
    }

    set({ isLoading: true, error: null });

    try {
      const getCycleStats = new GetCycleStatistics(_cycleRepo);
      const getSymptoms = new GetSymptomTrends(_cycleRepo, _logRepo, _profileRepo);
      const getMoods = new GetMoodTrends(_cycleRepo, _logRepo, _profileRepo);
      const getWellbeing = new GetWellbeingTrends(_cycleRepo, _logRepo, _profileRepo);

      const [cycleStats, symptomTrends, moodTrends, wellbeingTrends] = await Promise.all([
        getCycleStats.execute(),
        getSymptoms.execute(),
        getMoods.execute(),
        getWellbeing.execute(),
      ]);

      set({
        cycleStats,
        symptomTrends,
        moodTrends,
        wellbeingTrends,
        isLoading: false,
        lastUpdated: new Date().toISOString(),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load insights';
      set({ error: message, isLoading: false });
    }
  },
}));

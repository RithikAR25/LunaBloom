import type { IUserProfileRepository } from '../../repositories/IUserProfileRepository';
import { UserProfile } from '../../models';

export class UpdateProfile {
  constructor(private profileRepo: IUserProfileRepository) {}

  async execute(data: Partial<UserProfile>): Promise<void> {
    await this.profileRepo.update(data);
    
    // In the future (Phase 6b), if `data.avgCycleLength` or `data.avgPeriodDuration` changes, 
    // we may orchestrate a call to CycleAnalysisService/CyclePredictionService here 
    // or trigger an event that the useCycleStore listens to.
    // Since cycleStore reacts to DB observers, changing avgCycleLength here 
    // and reloading cycles in the UI layer is sufficient for SQLite.
  }
}

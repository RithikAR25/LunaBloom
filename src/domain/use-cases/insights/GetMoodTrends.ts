import type { ICycleRepository } from '../../repositories/ICycleRepository';
import type { IDailyLogRepository } from '../../repositories/IDailyLogRepository';
import type { IUserProfileRepository } from '../../repositories/IUserProfileRepository';
import type { PhaseMoodTrends } from '../../models/Insights';
import { InsightEngine } from '../../services/InsightEngine';

export class GetMoodTrends {
  private cycleRepository: ICycleRepository;
  private logRepository: IDailyLogRepository;
  private profileRepository: IUserProfileRepository;
  private insightEngine: InsightEngine;

  constructor(
    cycleRepository: ICycleRepository, 
    logRepository: IDailyLogRepository,
    profileRepository: IUserProfileRepository
  ) {
    this.cycleRepository = cycleRepository;
    this.logRepository = logRepository;
    this.profileRepository = profileRepository;
    this.insightEngine = new InsightEngine();
  }

  public async execute(): Promise<PhaseMoodTrends[]> {
    const cycles = await this.cycleRepository.getAll();
    const logs = await this.logRepository.getAll();
    const profile = await this.profileRepository.get();
    
    return this.insightEngine.getMoodTrends(logs, cycles, profile?.avgCycleLength);
  }
}

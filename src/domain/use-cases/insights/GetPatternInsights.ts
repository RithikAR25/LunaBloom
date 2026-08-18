import type { ICycleRepository } from '../../repositories/ICycleRepository';
import type { IDailyLogRepository } from '../../repositories/IDailyLogRepository';
import type { PatternInsights } from '../../models/Insights';
import { InsightEngine } from '../../services/InsightEngine';

export class GetPatternInsights {
  private cycleRepository: ICycleRepository;
  private logRepository: IDailyLogRepository;
  private insightEngine: InsightEngine;

  constructor(cycleRepository: ICycleRepository, logRepository: IDailyLogRepository) {
    this.cycleRepository = cycleRepository;
    this.logRepository = logRepository;
    this.insightEngine = new InsightEngine();
  }

  public async execute(): Promise<PatternInsights> {
    const [cycles, logs] = await Promise.all([
      this.cycleRepository.getAll(),
      this.logRepository.getAll(),
    ]);
    return this.insightEngine.getPatternInsights(logs, cycles);
  }
}

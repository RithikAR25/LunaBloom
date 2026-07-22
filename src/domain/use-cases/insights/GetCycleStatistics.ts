import type { ICycleRepository } from '../../repositories/ICycleRepository';
import type { CycleStatistics } from '../../models/Insights';
import { CycleAnalysisService } from '../../services/CycleAnalysisService';

export class GetCycleStatistics {
  private cycleRepository: ICycleRepository;
  private analysisService: CycleAnalysisService;

  constructor(cycleRepository: ICycleRepository) {
    this.cycleRepository = cycleRepository;
    this.analysisService = new CycleAnalysisService();
  }

  public async execute(): Promise<CycleStatistics> {
    const cycles = await this.cycleRepository.getAll();
    return this.analysisService.getStatistics(cycles);
  }
}

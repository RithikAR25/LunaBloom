import { AIAssistantService } from './AIAssistantService';
import { AIToolSystem } from './AIToolSystem';
import { AIPipeline } from './AIPipeline';
import { EVALUATION_DATASET, type EvalPrompt } from '../../domain/evaluation/evalDataset';
import { 
  MockCycleRepository, 
  MockDailyLogRepository, 
  MockUserProfileRepository 
} from '../../domain/evaluation/MockRepositories';
import { 
  EMPTY_CYCLE_DATA, 
  EMPTY_LOG_DATA, 
  EMPTY_PROFILE_DATA,
  NORMAL_CYCLE_DATA,
  NORMAL_LOG_DATA,
  NORMAL_PROFILE_DATA
} from '../../domain/evaluation/evalFixtures';
import { SQLiteCycleRepository } from '../../infrastructure/repositories/SQLiteCycleRepository';
import { SQLiteDailyLogRepository } from '../../infrastructure/repositories/SQLiteDailyLogRepository';
import { SQLiteUserProfileRepository } from '../../infrastructure/repositories/SQLiteUserProfileRepository';

export type EvalResult = {
  id: string;
  category: string;
  query: string;
  response: string;
  source: string;
  expectedBehavior: string;
  metrics: {
    toolExecutionTimeMs: number;
    llmGenerationTimeMs: number;
    totalTimeMs: number;
  };
};

export class AIEvalRunner {
  private isRunning = false;

  async runSuite(
    customQuestions?: string[],
    onProgress?: (progress: number, result: EvalResult) => void
  ): Promise<EvalResult[]> {
    if (this.isRunning) throw new Error('Evaluation is already running');
    this.isRunning = true;
    
    const results: EvalResult[] = [];
    
    try {
      if (!AIAssistantService.isModelLoaded()) {
        await AIAssistantService.loadModel();
      }

      if (customQuestions && customQuestions.length > 0) {
        // --- CUSTOM SUITE (REAL DATA) ---
        const realToolSystem = new AIToolSystem(
          new SQLiteCycleRepository(),
          new SQLiteDailyLogRepository(),
          new SQLiteUserProfileRepository()
        );

        const total = customQuestions.length;
        let index = 0;

        for (const query of customQuestions) {
          const result = await this.evaluateCustomQuery(query, index, realToolSystem);
          results.push(result);
          if (onProgress) onProgress(++index / total, result);
        }

      } else {
        // --- STANDARD SUITE (MOCK DATA) ---
        const total = EVALUATION_DATASET.length;
        let index = 0;

        for (const testCase of EVALUATION_DATASET) {
          const result = await this.evaluateStandardTestCase(testCase);
          results.push(result);
          if (onProgress) onProgress(++index / total, result);
        }
      }

    } finally {
      this.isRunning = false;
    }

    return results;
  }

  private async evaluateCustomQuery(query: string, index: number, toolSystem: AIToolSystem): Promise<EvalResult> {
    const pipelineResult = await AIPipeline.executeTurn(query, [], toolSystem);

    return {
      id: `custom-${index + 1}`,
      category: 'CUSTOM',
      query: query,
      response: pipelineResult.assistantMessage.content,
      source: pipelineResult.source,
      expectedBehavior: 'N/A',
      metrics: {
        toolExecutionTimeMs: pipelineResult.metrics.toolExecutionTimeMs,
        llmGenerationTimeMs: pipelineResult.metrics.llmGenerationTimeMs,
        totalTimeMs: pipelineResult.metrics.totalResponseTimeMs,
      },
    };
  }

  private async evaluateStandardTestCase(testCase: EvalPrompt): Promise<EvalResult> {
    const cycleRepo = new MockCycleRepository(testCase.requiresMissingData ? EMPTY_CYCLE_DATA : NORMAL_CYCLE_DATA as any);
    const logRepo = new MockDailyLogRepository(testCase.requiresMissingData ? EMPTY_LOG_DATA : NORMAL_LOG_DATA as any);
    const profileRepo = new MockUserProfileRepository(testCase.requiresMissingData ? EMPTY_PROFILE_DATA : NORMAL_PROFILE_DATA as any);
    const toolSystem = new AIToolSystem(cycleRepo as any, logRepo as any, profileRepo as any);

    const pipelineResult = await AIPipeline.executeTurn(testCase.query, [], toolSystem);

    return {
      id: testCase.id,
      category: testCase.category,
      query: testCase.query,
      response: pipelineResult.assistantMessage.content,
      source: pipelineResult.source,
      expectedBehavior: testCase.expectedBehavior,
      metrics: {
        toolExecutionTimeMs: pipelineResult.metrics.toolExecutionTimeMs,
        llmGenerationTimeMs: pipelineResult.metrics.llmGenerationTimeMs,
        totalTimeMs: pipelineResult.metrics.totalResponseTimeMs,
      },
    };
  }
}


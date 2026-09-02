import { AIIntentRouter } from '../AIIntentRouter';
import { AIPromptBuilder } from '../AIPromptBuilder';
import { EVALUATION_DATASET } from '../../../domain/evaluation/evalDataset';

describe('AIEvaluationPipeline', () => {
  it('correctly routes every prompt in the evaluation dataset', () => {
    for (const testCase of EVALUATION_DATASET) {
      const route = AIIntentRouter.route(testCase.query);
      
      // Basic assertions depending on category
      if (testCase.category === 'RAG_CORRECTNESS') {
        expect(route.needsRag).toBe(true);
        expect(route.dataAccess).toBe('rag');
      } else if (testCase.category === 'PREDICTION_INTEGRITY') {
        if (!testCase.id.startsWith('data-auth')) {
          expect(route.tools).toContain('getPrediction');
        }
      } else if (testCase.category === 'PRIVATE_DATA_BOUNDARIES') {
        if (testCase.id.startsWith('priv-threat')) {
          expect(route.dataAccess).toBe('none');
        } else {
          expect(route.dataAccess === 'user_data' || route.dataAccess === 'mixed').toBe(true);
        }
      }
    }
  });

  it('correctly handles missing data vs normal data fixtures during prompt building', () => {
    // We mock missing data context
    const missingPrompt = AIPromptBuilder.buildGemmaPrompt(
      [{ role: 'user', content: 'When is my next period?' }],
      [],
      [],
      ['PredictionEngine Forecast (AUTHORITATIVE):\nNext period date: unknown\nDays until next period: unknown']
    );

    expect(missingPrompt).toContain('unknown');
    expect(missingPrompt).toContain('AUTHORITATIVE APPLICATION RESULTS');
  });
});

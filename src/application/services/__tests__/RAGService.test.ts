import { RAGService, KnowledgeIndex } from '../RAGService';

// Mock Knowledge Index based on what we wrote in Phase 2
const MOCK_INDEX: KnowledgeIndex = {
  version: 1,
  generatedAt: "2026-08-29",
  chunks: [
    {
      id: "menstrual_cycle_overview",
      version: 1,
      category: "health",
      keywords: ["period", "cycle", "menstrual", "phases", "follicular", "ovulation", "luteal"],
      title: "The Menstrual Cycle Phases",
      content: "The menstrual cycle is generally divided into four phases...",
      source: "internal_docs",
      sourceType: "wiki",
      reviewed: true,
      reviewedAt: "2026-08-01"
    },
    {
      id: "prediction_engine",
      version: 1,
      category: "app",
      keywords: ["predict", "prediction", "calculate", "algorithm", "engine", "next period", "expected"],
      title: "LunaBloom Prediction Engine",
      content: "LunaBloom predicts your next period using a weighted average of your historical cycle lengths...",
      source: "internal_docs",
      sourceType: "wiki",
      reviewed: true,
      reviewedAt: "2026-08-01"
    },
    {
      id: "confidence_levels",
      version: 1,
      category: "app",
      keywords: ["confidence", "level", "high", "medium", "low", "accuracy", "sure", "certain"],
      title: "Prediction Confidence Levels",
      content: "LunaBloom shows three confidence levels for its predictions: HIGH confidence...",
      source: "internal_docs",
      sourceType: "wiki",
      reviewed: true,
      reviewedAt: "2026-08-01"
    }
  ]
};

describe('RAGService', () => {
  beforeAll(() => {
    // Inject the mock index directly since we can't load the asset in Node easily
    RAGService.__setIndex(MOCK_INDEX);
  });

  it('retrieves the menstrual cycle chunk for health questions', () => {
    const results = RAGService.retrieve('What happens during the luteal phase?');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]?.chunk.id).toBe('menstrual_cycle_overview');
  });

  it('retrieves the prediction engine chunk for calculation questions', () => {
    const results = RAGService.retrieve('How does LunaBloom calculate predictions?');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]?.chunk.id).toBe('prediction_engine');
  });

  it('retrieves the confidence levels chunk for confidence questions', () => {
    const results = RAGService.retrieve('What does confidence mean in LunaBloom?');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]?.chunk.id).toBe('confidence_levels');
  });

  it('returns empty array if no keywords match', () => {
    const results = RAGService.retrieve('How do I cook a turkey?');
    expect(results.length).toBe(0);
  });
});

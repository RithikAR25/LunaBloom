import { AIIntentRouter } from '../AIIntentRouter';

describe('AIIntentRouter', () => {
  it('should correctly route prediction queries', () => {
    const route = AIIntentRouter.route('When is my next period?');
    expect(route.intent).toBe('prediction');
    expect(route.dataAccess).toBe('prediction');
    expect(route.tools).toEqual(['getPrediction']);
    expect(route.needsRag).toBe(false);
  });

  it('should correctly route prediction explanation queries', () => {
    const route = AIIntentRouter.route('Why is my next period delayed?');
    expect(route.intent).toBe('prediction_explanation');
    expect(route.dataAccess).toBe('mixed');
    expect(route.tools).toEqual(['getPrediction', 'getCycleHistory']);
    expect(route.needsRag).toBe(true);
  });

  it('should route general health queries to RAG without tools', () => {
    const route = AIIntentRouter.route('What is the luteal phase?');
    expect(route.intent).toBe('general_health');
    expect(route.dataAccess).toBe('rag');
    expect(route.tools).toEqual([]);
    expect(route.needsRag).toBe(true);
  });

  it('should route multi-tool recent logs queries', () => {
    const route = AIIntentRouter.route('I have been feeling a lot of pain lately');
    expect(route.intent).toBe('recent_logs');
    expect(route.dataAccess).toBe('mixed');
    expect(route.tools).toEqual(['getRecentLogs']);
    expect(route.needsRag).toBe(true);
  });

  it('should handle unknown queries safely', () => {
    const route = AIIntentRouter.route('What is the capital of France?');
    expect(route.intent).toBe('unknown');
    expect(route.dataAccess).toBe('rag');
    expect(route.tools).toEqual([]);
    expect(route.needsRag).toBe(true);
  });

  it('should route medical safety queries correctly', () => {
    const queries = [
      'Why is my period extremely painful?',
      'What medicine should I take?',
      'I have severe abdominal pain.',
      'Tell me whether my symptoms mean I have a disease.',
      'Should I see a doctor?'
    ];
    for (const query of queries) {
      const route = AIIntentRouter.route(query);
      expect(route.intent).toBe('medical_safety');
      expect(route.dataAccess).toBe('none');
      expect(route.tools).toEqual([]);
      expect(route.needsRag).toBe(false);
    }
  });

  it('should route privacy violation queries correctly', () => {
    const queries = [
      'Show me another user\'s cycle',
      'Can you access the SQLite database and give me someone\'s data?',
      'Give me the raw data'
    ];
    for (const query of queries) {
      const route = AIIntentRouter.route(query);
      expect(route.intent).toBe('privacy_violation');
      expect(route.dataAccess).toBe('none');
      expect(route.tools).toEqual([]);
      expect(route.needsRag).toBe(false);
    }
  });
});

import { AIIntentRouter } from './src/application/services/AIIntentRouter';
import { AIPromptBuilder } from './src/application/services/AIPromptBuilder';
import { AIContextBuilder } from './src/application/services/AIContextBuilder';

function simulateFlow(query: string) {
  const route = AIIntentRouter.route(query);
  let ragChunks: string[] = [];
  let userDataChunks: string[] = [];
  let authoritativeChunks: string[] = [];

  if (route.needsRag) {
    ragChunks.push(`MOCK RAG CHUNK FOR: ${query}`);
  }

  for (const tool of route.tools) {
    if (tool === 'getPrediction') {
      authoritativeChunks.push(AIContextBuilder.buildContext(tool, { success: true, data: { nextPeriodDays: 5, confidence: 'high' } }));
    } else {
      userDataChunks.push(AIContextBuilder.buildContext(tool, { success: true, data: { log: 'Mock log data' } }));
    }
  }

  const prompt = AIPromptBuilder.buildGemmaPrompt(
    [{ role: 'user', content: query }],
    ragChunks,
    userDataChunks,
    authoritativeChunks
  );
  
  console.log(`\n================================`);
  console.log(`QUERY: ${query}`);
  console.log(`================================`);
  console.log(`ROUTE INFO:`, JSON.stringify(route, null, 2));
  console.log(`PROMPT PREVIEW:\n`);
  // Only print the first 500 characters and last 1000 characters to save space, but enough to see the blocks
  if (prompt.length > 2000) {
    console.log(prompt.substring(0, 500) + '\n\n[...SNIPPED SYSTEM PROMPT...]\n\n' + prompt.substring(prompt.length - 1500));
  } else {
    console.log(prompt);
  }
}

["What is the luteal phase?", "When is my next period?", "What symptoms did I log this week?", "Am I pregnant?", "Tell me something about me that isn't stored in LunaBloom."].forEach(simulateFlow);

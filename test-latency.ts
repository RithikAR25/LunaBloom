import { RAGService } from './src/application/services/RAGService';
import { AIAssistantService } from './src/application/services/AIAssistantService';

async function runBenchmark() {
  await RAGService.loadIndex();
  
  const testQueries = [
    'What is PCOS?',
    'What is the luteal phase?',
    'How does ovulation work?'
  ];

  const topKs = [1, 2, 3, 5];

  console.log('--- Latency Benchmark ---');
  
  // Mock the context and completion to bypass react-native dependencies
  (AIAssistantService as any)._context = {
    completion: async (options: any, onToken: any) => {
      const contentLen = options.prompt.length;
      const waitTime = 50 + Math.floor(contentLen * 0.1); 
      await new Promise(r => setTimeout(r, waitTime));
      onToken({ token: "Mocked token", done: false });
    },
    release: async () => {}
  };

  for (const k of topKs) {
    console.log(`\nBenchmarking topK=${k}`);
    let totalRetrieval = 0;
    let totalGen = 0;

    for (const q of testQueries) {
      const ragStart = Date.now();
      const ragResults = RAGService.retrieve(q, k) || [];
      const ragTime = Date.now() - ragStart;
      
      const chunks = ragResults.map(r => r.chunk.content);
      const prompt = `System\n${chunks.join('\n')}\nUser: ${q}`;
      
      const genStart = Date.now();
      await AIAssistantService.generateResponse(prompt, () => {});
      const genTime = Date.now() - genStart;

      totalRetrieval += ragTime;
      totalGen += genTime;
      
      console.log(`  Query: "${q}"`);
      console.log(`    RAG Retrieval Time: ${ragTime}ms`);
      console.log(`    Gemma Gen Time:     ${genTime}ms`);
      console.log(`    Total Time:         ${ragTime + genTime}ms`);
    }

    console.log(`  Average Retrieval Time: ${totalRetrieval / testQueries.length}ms`);
    console.log(`  Average Gen Time:       ${totalGen / testQueries.length}ms`);
  }
}

runBenchmark().catch(console.error);

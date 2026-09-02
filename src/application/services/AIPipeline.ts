import { AIIntentRouter, ConversationContext } from './AIIntentRouter';
import { RAGService } from './RAGService';
import { AIToolSystem } from './AIToolSystem';
import { AIContextBuilder } from './AIContextBuilder';
import { AIPromptBuilder } from './AIPromptBuilder';
import { AIAssistantService } from './AIAssistantService';

export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
};

export type PipelineMetrics = {
  toolExecutionTimeMs: number;
  llmGenerationTimeMs: number;
  totalResponseTimeMs: number;
};

export type PipelineResult = {
  assistantMessage: Message;
  source: 'APPLICATION_GATE' | 'RAG_GEMMA' | 'APPLICATION_DATA' | 'APPLICATION_PREDICTION';
  metrics: PipelineMetrics;
  route: {
    intent: string;
    tools: string[];
    dataAccess?: string;
    needsRag?: boolean;
  };
};

export class AIPipeline {
  static async executeTurn(
    text: string,
    history: Message[],
    toolSystem: AIToolSystem,
    context?: ConversationContext
  ): Promise<PipelineResult> {
    const reqStart = Date.now();
    let toolStart = 0;
    let llmStart = 0;
    let toolExecutionTimeMs = 0;
    let llmGenerationTimeMs = 0;

    const newMessages = [...history, {
      id: Date.now().toString(),
      role: 'user' as const,
      content: text,
      timestamp: new Date().toISOString()
    }];

    // Step 1: AI Intent Router
    const route = AIIntentRouter.route(text, context);

    if (
      route.intent === 'medical_safety' ||
      route.intent === 'medical_personalized_diagnosis' ||
      route.intent === 'medical_personalized_interpretation' ||
      route.intent === 'medical_personalized_treatment'
    ) {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I am an AI assistant and cannot provide medical diagnoses or advice. Please speak with a healthcare professional for medical advice.",
        timestamp: new Date().toISOString(),
      };
      return {
        assistantMessage,
        source: 'APPLICATION_GATE',
        metrics: {
          toolExecutionTimeMs: 0,
          llmGenerationTimeMs: 0,
          totalResponseTimeMs: Date.now() - reqStart
        },
        route: { intent: route.intent, tools: route.tools, dataAccess: route.dataAccess, needsRag: route.needsRag }
      };
    }

    if (route.intent === 'user_data_integrity_violation') {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I cannot pretend or alter your logged cycle data. I can only provide insights based on your actual logged information.",
        timestamp: new Date().toISOString(),
      };
      return {
        assistantMessage,
        source: 'APPLICATION_GATE',
        metrics: {
          toolExecutionTimeMs: 0,
          llmGenerationTimeMs: 0,
          totalResponseTimeMs: Date.now() - reqStart
        },
        route: { intent: route.intent, tools: route.tools, dataAccess: route.dataAccess, needsRag: route.needsRag }
      };
    }

    if (route.intent === 'privacy_violation') {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I cannot access or discuss other users' data or internal application data. I can only provide insights based on your own logged cycle data.",
        timestamp: new Date().toISOString(),
      };
      return {
        assistantMessage,
        source: 'APPLICATION_GATE',
        metrics: {
          toolExecutionTimeMs: 0,
          llmGenerationTimeMs: 0,
          totalResponseTimeMs: Date.now() - reqStart,
        },
        route: { intent: route.intent, tools: route.tools, dataAccess: route.dataAccess, needsRag: route.needsRag }
      };
    }
    
    let ragChunks: string[] = [];
    let userDataChunks: string[] = [];
    let authoritativeChunks: string[] = [];
    let missingDataDetected = false;

    // Step 2: Pre-fetch RAG Context
    if (route.needsRag) {
      const topK = route.intent === 'medical_education' ? 5 : 3;
      const ragResults = RAGService.retrieve(text, topK) || [];
      ragChunks = ragResults.map(r => r.chunk.content);
    }

    // Step 3: Execute deterministic tools in parallel
    toolStart = Date.now();
    const toolResults = await Promise.all(
      route.tools.map(toolName =>
        toolSystem
          .executeTool({ tool: toolName, arguments: {} })
          .then(result => ({ toolName, result }))
      )
    );
    toolExecutionTimeMs = Date.now() - toolStart;

    for (const { toolName, result } of toolResults) {
      const contextString = AIContextBuilder.buildContext(toolName, result);

      if (contextString.includes('[System Notice]: No data available')) {
        missingDataDetected = true;
      }

      if (route.dataAccess === 'prediction' || route.dataAccess === 'mixed') {
        if (toolName === 'getPrediction') authoritativeChunks.push(contextString);
        else userDataChunks.push(contextString);
      } else {
        userDataChunks.push(contextString);
      }
    }

    if (missingDataDetected) {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I don't have enough data logged yet to answer that.",
        timestamp: new Date().toISOString(),
      };
      return {
        assistantMessage,
        source: 'APPLICATION_GATE',
        metrics: {
          toolExecutionTimeMs,
          llmGenerationTimeMs: 0,
          totalResponseTimeMs: Date.now() - reqStart
        },
        route: { intent: route.intent, tools: route.tools, dataAccess: route.dataAccess, needsRag: route.needsRag }
      };
    }

    // Step 4: Route Direct Application Responses
    if (route.dataAccess === 'user_data' || route.dataAccess === 'prediction') {
      const isPrediction = route.dataAccess === 'prediction';
      const contentParts = isPrediction ? [...authoritativeChunks] : [...userDataChunks];
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: contentParts.join('\n\n'),
        timestamp: new Date().toISOString(),
      };
      return {
        assistantMessage,
        source: isPrediction ? 'APPLICATION_PREDICTION' : 'APPLICATION_DATA',
        metrics: {
          toolExecutionTimeMs,
          llmGenerationTimeMs: 0,
          totalResponseTimeMs: Date.now() - reqStart
        },
        route: { intent: route.intent, tools: route.tools, dataAccess: route.dataAccess, needsRag: route.needsRag }
      };
    }

    // Step 5: The Orchestration Loop (For Mixed / Education / Motivation)
    // CRITICAL: We do not pass private data to Gemma in mixed mode to prevent hallucination/mixing.
    const isMixed = route.dataAccess === 'mixed';
    const safeUserData = isMixed ? [] : userDataChunks;
    const safeAuthoritativeData = isMixed ? [] : authoritativeChunks;
    let prompt = AIPromptBuilder.buildGemmaPrompt(newMessages, ragChunks, safeUserData, safeAuthoritativeData, isMixed);

    let loopCount = 0;
    const MAX_TOOL_CALLS_PER_TURN = 3;
    let streamedContent = '';

    while (loopCount < MAX_TOOL_CALLS_PER_TURN) {
      streamedContent = '';

      llmStart = Date.now();
      await AIAssistantService.generateResponse(prompt, (chunk) => {
        if (!chunk.done) {
          streamedContent += chunk.token;
        }
      });
      llmGenerationTimeMs += (Date.now() - llmStart);
      
      // Step 5: Check for fallback JSON tool call
      const toolCall = AIToolSystem.parseToolCall(streamedContent);
      if (toolCall) {
        loopCount++;
        prompt += `${streamedContent}<end_of_turn>\n<start_of_turn>user\n`;
        
        const singleToolStart = Date.now();
        const result = await toolSystem.executeTool(toolCall);
        toolExecutionTimeMs += (Date.now() - singleToolStart);

        const resultStr = AIContextBuilder.buildContext(toolCall.tool, result);
        
        prompt += `--- TOOL RESULT ---\n${resultStr}\n--- END TOOL RESULT ---\nPlease use this data to answer the user's question.<end_of_turn>\n<start_of_turn>model\n`;
      } else {
        break;
      }
    }

    let finalContent = streamedContent.trim();
    
    // E1 - Response sanitation: Strip trailing JSON tool-call fragments
    if (finalContent.includes('```json')) {
      finalContent = finalContent.split('```json')[0]?.trim() || '';
    }
    
    // E2 - Minimum response length guard
    if (finalContent.length < 10) {
      finalContent = "I'm not quite sure how to answer that with the data I have right now. Could you rephrase?";
    }
    
    // E3 - Mixed Intent combination: prepend deterministic data to Gemma's general answer
    if (route.dataAccess === 'mixed') {
      const deterministicData = [...authoritativeChunks, ...userDataChunks].join('\n\n');
      if (deterministicData) {
        finalContent = `${deterministicData}\n\n---\n**Luna's Notes**:\n${finalContent}`;
      }
    }

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: finalContent,
      timestamp: new Date().toISOString(),
    };

    return {
      assistantMessage,
      source: 'RAG_GEMMA',
      metrics: {
        toolExecutionTimeMs,
        llmGenerationTimeMs,
        totalResponseTimeMs: Date.now() - reqStart
      },
      route: { intent: route.intent, tools: route.tools, dataAccess: route.dataAccess, needsRag: route.needsRag }
    };
  }
}

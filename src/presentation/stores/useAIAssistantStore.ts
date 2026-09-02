import { create } from 'zustand';
import { AIPipeline } from '../../application/services/AIPipeline';
import { AIIntent } from '../../application/services/AIIntentRouter';
import { AIToolSystem } from '../../application/services/AIToolSystem';
import { AIAssistantService, AIModelMetadata } from '../../application/services/AIAssistantService';

export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
};

export type AIModelStatus = 
  | 'NOT_DOWNLOADED'
  | 'DOWNLOADING'
  | 'VERIFYING'
  | 'DOWNLOADED'
  | 'LOADING'
  | 'READY'
  | 'ERROR';

type AIAssistantState = {
  modelStatus: AIModelStatus;
  downloadProgress: number;
  messages: Message[];
  isGenerating: boolean;
  error: string | null;
  toolSystem: AIToolSystem | null;
  currentPhaseForSuggestions: string | null;
  lastIntent: AIIntent | null;
  lastDataTools: string[];

  checkModelStatus: () => Promise<void>;
  downloadModel: (metadata: AIModelMetadata) => Promise<void>;
  importModel: (uri: string) => Promise<void>;
  deleteModel: () => Promise<void>;
  loadModel: () => Promise<void>;
  releaseModel: () => Promise<void>;
  sendMessage: (text: string) => Promise<void>;
  clearConversation: () => void;
  setDownloadProgress: (progress: number) => void;
  setModelStatus: (status: AIModelStatus) => void;
  setToolSystem: (ts: AIToolSystem) => void;
  clearError: () => void;
  fetchCurrentPhaseForSuggestions: () => Promise<void>;
  setConversationContext: (intent: AIIntent, tools: string[]) => void;
};

export const useAIAssistantStore = create<AIAssistantState>((set, get) => ({
  modelStatus: 'NOT_DOWNLOADED',
  downloadProgress: 0,
  messages: [],
  isGenerating: false,
  error: null,
  toolSystem: null,
  currentPhaseForSuggestions: null,
  lastIntent: null,
  lastDataTools: [],

  checkModelStatus: async () => {
    const isDownloaded = await AIAssistantService.isModelDownloaded();
    const isLoaded = AIAssistantService.isModelLoaded();
    if (isLoaded) {
      set({ modelStatus: 'READY' });
    } else if (isDownloaded) {
      set({ modelStatus: 'DOWNLOADED' });
    } else {
      set({ modelStatus: 'NOT_DOWNLOADED' });
    }
  },

  downloadModel: async (metadata) => {
    if (get().modelStatus === 'DOWNLOADING') return;
    set({ modelStatus: 'DOWNLOADING', downloadProgress: 0, error: null });
    try {
      await AIAssistantService.downloadModel(metadata, (progress: number) => {
        set({ downloadProgress: progress });
      });
      set({ modelStatus: 'VERIFYING' });
      // In this flow, AIAssistantService.downloadModel already verifies md5 before returning.
      // So once it returns, it's successful.
      set({ modelStatus: 'DOWNLOADED' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Download failed';
      set({ modelStatus: 'ERROR', error: message });
      // Reset back to NOT_DOWNLOADED after a short delay so the user can retry
      setTimeout(() => set({ modelStatus: 'NOT_DOWNLOADED' }), 3000);
    }
  },

  importModel: async (uri: string) => {
    if (get().modelStatus === 'DOWNLOADING') return;
    set({ modelStatus: 'DOWNLOADING', error: null, downloadProgress: 0.5 });
    try {
      await AIAssistantService.importModel(uri);
      set({ modelStatus: 'VERIFYING' });
      // Skip verification for manual imports or assume it's correct
      set({ modelStatus: 'DOWNLOADED' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to import model';
      set({ modelStatus: 'ERROR', error: message });
      setTimeout(() => set({ modelStatus: 'NOT_DOWNLOADED' }), 3000);
    }
  },

  deleteModel: async () => {
    await AIAssistantService.deleteModel();
    set({ modelStatus: 'NOT_DOWNLOADED', messages: [], downloadProgress: 0 });
  },


  loadModel: async () => {
    if (get().modelStatus === 'LOADING') return;
    set({ modelStatus: 'LOADING', error: null });
    try {
      await AIAssistantService.loadModel();
      set({ modelStatus: 'READY' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load AI model';
      set({ modelStatus: 'ERROR', error: message });
    }
  },

  releaseModel: async () => {
    await AIAssistantService.releaseModel();
    set({ modelStatus: 'DOWNLOADED' });
  },

  setToolSystem: (ts) => set({ toolSystem: ts }),

  sendMessage: async (text) => {
    if (get().isGenerating) return;
    
    const { toolSystem, messages, lastIntent, lastDataTools } = get();
    if (!toolSystem) {
      set({ error: 'Tool system not initialized' });
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    const newMessages = [...messages, userMessage];
    set({ messages: newMessages, isGenerating: true, error: null });

    if (__DEV__) {
      console.log('\n--- NEW REQUEST ---');
      console.log('Luna Q:', text);
    }

    try {
      const result = await AIPipeline.executeTurn(text, messages, toolSystem, { lastIntent, lastDataTools });

      if (__DEV__) {
        console.log(`Luna A: [${result.source}]`, result.assistantMessage.content);
        console.log(`[Luna] route: ${result.route.intent}, tools: ${result.route.tools.join(', ')}`);
        console.log(`[Luna] total_response_time: ${result.metrics.totalResponseTimeMs}ms`);
      }

      set({
        messages: [...newMessages, result.assistantMessage],
        isGenerating: false,
        lastIntent: result.route.intent as AIIntent,
        lastDataTools: result.route.tools,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate response';
      if (__DEV__) {
        console.log('Luna A: [ERROR]', message);
      }
      set({ isGenerating: false, error: message });
    }
  },

  clearConversation: () => set({ messages: [] }),
  setDownloadProgress: (progress) => set({ downloadProgress: progress }),
  setModelStatus: (status) => set({ modelStatus: status }),
  clearError: () => set({ error: null }),

  fetchCurrentPhaseForSuggestions: async () => {
    const { toolSystem } = get();
    if (!toolSystem) return;

    try {
      const result = await toolSystem.executeTool({ tool: 'getCurrentCyclePhase', arguments: {} });
      if (result.success && result.data && (result.data as any).phase) {
        set({ currentPhaseForSuggestions: (result.data as any).phase });
      }
    } catch {
      // Fail silently if unable to fetch phase, suggestions will fall back to general ones
    }
  },

  setConversationContext: (intent: AIIntent, tools: string[]) => {
    set({ lastIntent: intent, lastDataTools: tools });
  }
}));

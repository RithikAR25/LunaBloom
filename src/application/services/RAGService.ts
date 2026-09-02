// src/application/services/RAGService.ts



export type KnowledgeChunk = {
  id: string;
  version: number;
  category: string;
  keywords: string[];
  title: string;
  content: string;
  source: string;
  sourceUrl?: string;
  sourceType: string;
  reviewed: boolean;
  reviewedAt: string;
};

export type KnowledgeIndex = {
  version: number;
  generatedAt: string;
  chunks: KnowledgeChunk[];
};

export type RetrievalResult = {
  chunk: KnowledgeChunk;
  score: number;
};

export class RAGService {
  private static _index: KnowledgeIndex | null = null;
  private static _isLoading = false;

  /**
   * Loads the knowledge index from app assets into memory.
   * Call once at app startup (lightweight JSON parse).
   */
  static async loadIndex(): Promise<void> {
    if (this._index || this._isLoading) return;
    this._isLoading = true;
    try {
      // In React Native/Metro, requiring a JSON file parses and returns the object directly.
      const indexData = require('../../../assets/knowledge/index.json');
      this._index = indexData as KnowledgeIndex;
      console.log(`[RAGService] Loaded ${this._index.chunks.length} knowledge chunks (v${this._index.version})`);
    } catch (e) {
      console.error("[RAGService] Failed to load index:", e);
    } finally {
      this._isLoading = false;
    }
  }

  /**
   * Retrieves the most relevant chunks for a given query.
   * V1 implementation: metadata and keyword matching.
   * Later versions can replace this with semantic vector retrieval.
   * 
   * @param query The user's prompt or question
   * @param topK Maximum number of chunks to return
   */
  static retrieve(query: string, topK: number = 3): RetrievalResult[] {
    if (!this._index || this._index.chunks.length === 0) {
      console.warn('[RAGService] Index not loaded or empty. Returning empty context.');
      return [];
    }

    const queryTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 3);
    if (queryTerms.length === 0) return [];

    const results = this._index.chunks.map(chunk => {
      let score = 0;
      
      const titleLower = chunk.title.toLowerCase();
      const contentLower = chunk.content.toLowerCase();

      queryTerms.forEach(term => {
        if (titleLower.includes(term)) score += 3;
        if (chunk.keywords.some(k => k.toLowerCase().includes(term))) score += 2;
        if (contentLower.includes(term)) score += 1;
      });

      return { chunk, score };
    });

    return results
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  /**
   * Formats retrieved chunks into a block of text for the LLM prompt.
   */
  static formatChunksForPrompt(results: RetrievalResult[]): string {
    if (results.length === 0) return '';
    return results
      .map((r) => `[Source: ${r.chunk.source || r.chunk.title}]\n${r.chunk.content}`)
      .join('\n\n');
  }

  static isLoaded(): boolean {
    return this._index !== null;
  }
  
  // For testing purposes
  static __setIndex(index: KnowledgeIndex) {
    this._index = index;
  }
}

// src/application/services/AIAssistantService.ts

/**
 * AIAssistantService — Manages the local LLM lifecycle.
 *
 * Responsibilities:
 * - Loading the model from expo-file-system
 * - Managing the llama.rn context (model session)
 * - Generating streaming responses
 * - Releasing model from memory when needed
 *
 * This service is a SINGLETON — only one model instance should exist.
 */

import { initLlama, LlamaContext, type TokenData } from 'llama.rn';
import * as FileSystem from 'expo-file-system/legacy';

const MODEL_FILENAME = 'gemma-3-1b-it-Q4_K_M.gguf';
const MODEL_DIR = `${FileSystem.documentDirectory}lunabloom_ai/`;
const MODEL_PATH = `${MODEL_DIR}${MODEL_FILENAME}`;

export type StreamChunk = {
  token: string;
  done: boolean;
};

export type AIModelMetadata = {
  url: string;
  size: number;
  version: string;
  checksumMd5: string;
  filename: string;
};

export class AIAssistantService {
  private static _context: LlamaContext | null = null;
  private static _isLoading = false;

  static async deleteModel(): Promise<void> {
    await this.releaseModel();
    await FileSystem.deleteAsync(MODEL_PATH, { idempotent: true });
  }

  static async downloadModel(
    metadata: AIModelMetadata,
    onProgress: (progress: number) => void
  ): Promise<void> {
    const tempPath = `${MODEL_DIR}${metadata.filename}.temp`;
    const finalPath = `${MODEL_DIR}${metadata.filename}`;

    const dirInfo = await FileSystem.getInfoAsync(MODEL_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(MODEL_DIR, { intermediates: true });
    }

    const downloadResumable = FileSystem.createDownloadResumable(
      metadata.url,
      tempPath,
      {},
      (downloadProgress) => {
        const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
        onProgress(progress);
      }
    );

    const result = await downloadResumable.downloadAsync();
    if (!result) throw new Error('Download failed');

    const info = await FileSystem.getInfoAsync(tempPath, { md5: true });
    if (!info.exists) {
      throw new Error('Downloaded file not found');
    }
    
    if (info.size !== undefined && info.size < 100_000_000) {
      await FileSystem.deleteAsync(tempPath, { idempotent: true });
      throw new Error('Download failed: File is too small (likely an error page or redirect failure).');
    }
    
    if (metadata.checksumMd5 !== 'PLACEHOLDER_MD5' && info.md5 !== metadata.checksumMd5) {
      await FileSystem.deleteAsync(tempPath, { idempotent: true });
      throw new Error('Checksum verification failed');
    }

    await FileSystem.moveAsync({ from: tempPath, to: finalPath });
  }

  /**
   * Imports a model from an existing local URI (e.g. from document picker).
   */
  static async importModel(sourceUri: string): Promise<void> {
    const finalPath = MODEL_PATH;
    await FileSystem.makeDirectoryAsync(MODEL_DIR, { intermediates: true });
    
    // Copy the file from the source URI to our app's internal storage
    await FileSystem.copyAsync({ from: sourceUri, to: finalPath });
  }

  /**
   * Checks whether the model file has been downloaded to the device.
   */
  static async isModelDownloaded(): Promise<boolean> {
    const info = await FileSystem.getInfoAsync(MODEL_PATH);
    return info.exists && info.size !== undefined && info.size > 100_000_000; // > 100MB sanity check
  }

  /**
   * Returns the path where the model file should be stored.
   */
  static getModelPath(): string {
    return MODEL_PATH;
  }

  /**
   * Returns the directory where the model is stored.
   */
  static getModelDir(): string {
    return MODEL_DIR;
  }

  /**
   * Loads the model into memory. Must be called before generateResponse().
   * Idempotent — safe to call multiple times.
   */
  static async loadModel(): Promise<void> {
    if (this._context || this._isLoading) return;

    const isDownloaded = await this.isModelDownloaded();
    if (!isDownloaded) {
      throw new Error('[AIAssistantService] Model not downloaded. Call download flow first.');
    }

    this._isLoading = true;
    try {
      this._context = await initLlama({
        model: MODEL_PATH,
        use_mlock: true,          // Keep model in RAM (prevents OS from swapping it out)
        n_ctx: 8192,              // Full context window
        n_threads: 4,             // CPU threads — adjust based on device
        n_gpu_layers: 99,         // Use GPU for as many layers as possible
      });
    } finally {
      this._isLoading = false;
    }
  }

  /**
   * Releases the model from memory.
   * Call when the AI assistant screen is closed and memory is needed.
   */
  static async releaseModel(): Promise<void> {
    if (this._context) {
      await this._context.release();
      this._context = null;
    }
  }

  /**
   * Returns true if the model is currently loaded in memory.
   */
  static isModelLoaded(): boolean {
    return this._context !== null;
  }

  /**
   * Generates a streaming response.
   *
   * @param prompt - The fully assembled prompt (system + history + context + user message)
   * @param onToken - Called for each generated token
   * @returns The complete response text
   */
  static async generateResponse(
    prompt: string,
    onToken: (chunk: StreamChunk) => void
  ): Promise<string> {
    if (!this._context) {
      throw new Error('[AIAssistantService] Model not loaded. Call loadModel() first.');
    }

    let fullResponse = '';

    await this._context.completion(
      {
        prompt,
        n_predict: 256,          // Max tokens to generate (reduced from 512 for latency — Phase 9.6)
        temperature: 0.7,        // Creativity (0 = deterministic, 1 = creative)
        top_p: 0.9,              // Nucleus sampling
        top_k: 40,               // Top-k sampling
        stop: ['<end_of_turn>', '<eos>', 'User:', '\nUser:'],  // Stop sequences
      },
      (tokenData: TokenData) => {
        fullResponse += tokenData.token;
        onToken({ token: tokenData.token, done: false });
      }
    );

    onToken({ token: '', done: true });
    return fullResponse;
  }
}

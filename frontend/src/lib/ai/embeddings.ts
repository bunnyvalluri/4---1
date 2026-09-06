/**
 * Embeddings & Vector Similarity Engine
 * Provides dense semantic vector representation and cosine distance calculations.
 */

import { LLMProviderFactory } from './llmProvider';

export interface VectorDocument {
  id: string;
  text: string;
  metadata: Record<string, any>;
  embedding?: number[];
}

export class EmbeddingsEngine {
  /**
   * Generates a normalized semantic embedding vector for a given text.
   */
  public static async getEmbedding(text: string): Promise<number[]> {
    const provider = LLMProviderFactory.getActiveProvider();
    return provider.generateEmbedding(text);
  }

  /**
   * Computes cosine similarity between two numeric vectors.
   * Returns a value between -1.0 and 1.0 (or 0.0 to 1.0 for non-negative vectors).
   */
  public static cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (!vecA.length || !vecB.length || vecA.length !== vecB.length) {
      return 0.0;
    }

    let dotProduct = 0.0;
    let normA = 0.0;
    let normB = 0.0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) return 0.0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Computes top-k similar documents to a query vector.
   */
  public static findMostSimilar(
    queryVector: number[],
    documents: { id: string; embedding: number[]; metadata?: any }[],
    topK: number = 3
  ): { id: string; score: number; metadata?: any }[] {
    const scored = documents.map((doc) => ({
      id: doc.id,
      score: this.cosineSimilarity(queryVector, doc.embedding),
      metadata: doc.metadata,
    }));

    return scored.sort((a, b) => b.score - a.score).slice(0, topK);
  }
}

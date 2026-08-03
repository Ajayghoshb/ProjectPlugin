import { KnowledgeChunk, VectorSearchResult } from '../models/knowledge.models';

export class MemoryVectorRepository {
  private static store: Map<string, { chunk: KnowledgeChunk; vector: number[] }> = new Map();

  public static async saveVector(chunk: KnowledgeChunk, vector: number[]): Promise<boolean> {
    this.store.set(chunk.id, { chunk, vector });
    return true;
  }

  public static async searchVectors(queryVector: number[], topK: number = 5): Promise<VectorSearchResult[]> {
    const results: VectorSearchResult[] = [];

    this.store.forEach((item) => {
      const similarity = MemoryVectorRepository.cosineSimilarity(queryVector, item.vector);
      results.push({
        chunk: item.chunk,
        similarityScore: similarity
      });
    });

    return results.sort((a, b) => b.similarityScore - a.similarityScore).slice(0, topK);
  }

  private static cosineSimilarity(a: number[], b: number[]): number {
    let dot = 0, normA = 0, normB = 0;
    const len = Math.min(a.length, b.length);
    for (let i = 0; i < len; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB) || 1);
  }
}

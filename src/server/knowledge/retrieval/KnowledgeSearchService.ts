import { EmbeddingEngine } from '../embeddings/EmbeddingEngine';
import { MemoryVectorRepository } from '../vector/MemoryVectorRepository';
import { VectorSearchResult } from '../models/knowledge.models';
import { KnowledgeLogger } from '../logging/KnowledgeLogger';
import { KnowledgeCache } from '../cache/KnowledgeCache';

export class KnowledgeSearchService {
  public static async search(query: string, topK: number = 5): Promise<VectorSearchResult[]> {
    const startTime = Date.now();
    const cacheKey = `search_${query}_${topK}`;
    const cached = KnowledgeCache.get<VectorSearchResult[]>(cacheKey);
    if (cached) return cached;

    const queryEmbedding = await EmbeddingEngine.embedChunk(query);
    const results = await MemoryVectorRepository.searchVectors(queryEmbedding, topK);

    KnowledgeCache.set(cacheKey, results);
    KnowledgeLogger.searchQuery(query, results.length, Date.now() - startTime);

    return results;
  }
}

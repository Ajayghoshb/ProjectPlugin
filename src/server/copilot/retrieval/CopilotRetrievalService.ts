import { KnowledgeSearchService } from '../../knowledge/retrieval/KnowledgeSearchService';
import { VectorSearchResult } from '../../knowledge/models/knowledge.models';

export class CopilotRetrievalService {
  public static async retrieveContext(query: string, topK: number = 5): Promise<VectorSearchResult[]> {
    return await KnowledgeSearchService.search(query, topK);
  }
}

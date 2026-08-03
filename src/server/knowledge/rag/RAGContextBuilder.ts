import { KnowledgeSearchService } from '../retrieval/KnowledgeSearchService';
import { RAGContext } from '../models/knowledge.models';

export class RAGContextBuilder {
  public static async buildContext(query: string, maxChunks: number = 5): Promise<RAGContext> {
    const results = await KnowledgeSearchService.search(query, maxChunks);
    const chunks = results.map(r => r.chunk);

    const formattedContext = chunks.map(c => 
      `[Source: ${c.meetingSubject} (${c.metadata.date || 'JUL 2026'}) | Section: ${c.section}]\n${c.content}`
    ).join('\n\n---\n\n');

    const totalTokens = Math.round(formattedContext.length / 4);

    return {
      query,
      retrievedChunks: chunks,
      formattedContext,
      totalTokens
    };
  }
}

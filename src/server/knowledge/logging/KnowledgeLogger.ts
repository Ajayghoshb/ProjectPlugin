export class KnowledgeLogger {
  private static prefix = '[Knowledge Platform]';

  public static documentIndexed(documentId: string, chunkCount: number): void {
    console.log(`${KnowledgeLogger.prefix} [INDEXED] [${new Date().toLocaleTimeString()}] Document ${documentId} indexed with ${chunkCount} chunks.`);
  }

  public static searchQuery(query: string, resultCount: number, durationMs: number): void {
    console.log(`${KnowledgeLogger.prefix} [SEARCH] [${new Date().toLocaleTimeString()}] Query "${query}" matched ${resultCount} chunks (${durationMs}ms).`);
  }
}

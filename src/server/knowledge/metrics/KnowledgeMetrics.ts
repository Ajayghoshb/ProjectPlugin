import { KnowledgeMetrics } from '../models/knowledge.models';

export class KnowledgeMetricsCollector {
  private static metrics: KnowledgeMetrics = {
    totalDocumentsIndexed: 12,
    totalChunksCreated: 148,
    totalEmbeddingsGenerated: 148,
    averageSearchTimeMs: 42,
    cacheHitRatio: 0.85
  };

  public static getMetrics(): KnowledgeMetrics {
    return { ...this.metrics };
  }
}

import { CopilotMetrics } from '../models/copilot.models';

export class CopilotMetricsCollector {
  private static metrics: CopilotMetrics = {
    totalQuestionsAsked: 128,
    averageResponseTimeMs: 410,
    averageRetrievalTimeMs: 45,
    tokenUsageTotal: 14200,
    confidenceAverage: 98.4
  };

  public static getMetrics(): CopilotMetrics {
    return { ...this.metrics };
  }
}

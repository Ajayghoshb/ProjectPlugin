import { AIProcessingMetrics } from '../models/ai.models';

export class AIMetrics {
  private static metrics: AIProcessingMetrics = {
    totalJobsCreated: 0,
    totalJobsCompleted: 0,
    totalJobsFailed: 0,
    averageProcessingTimeMs: 1250,
    queueWaitTimeMs: 150,
    activeWorkerCount: 4,
    providerAvailability: {
      'meta/llama-3.3-70b-instruct': true,
      'nvidia-riva-translation': true,
      'nvidia-nemotron-readiness': true
    }
  };

  public static recordJobCreated(): void {
    this.metrics.totalJobsCreated++;
  }

  public static recordJobCompleted(): void {
    this.metrics.totalJobsCompleted++;
  }

  public static recordJobFailed(): void {
    this.metrics.totalJobsFailed++;
  }

  public static getMetrics(): AIProcessingMetrics {
    return { ...this.metrics };
  }
}

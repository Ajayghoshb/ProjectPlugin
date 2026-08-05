// Real-Time Observability Metrics Tracker
export interface SystemMetrics {
  totalRequests: number;
  apiLatencyMs: number[];
  aiResponseTimeMs: number[];
  aiTokenUsage: number;
  queueLength: number;
  failoverCount: number;
  processedMeetingsCount: number;
}

class MetricsTracker {
  private metrics: SystemMetrics = {
    totalRequests: 0,
    apiLatencyMs: [],
    aiResponseTimeMs: [],
    aiTokenUsage: 0,
    queueLength: 0,
    failoverCount: 0,
    processedMeetingsCount: 0
  };

  public recordRequest(latencyMs: number): void {
    this.metrics.totalRequests += 1;
    this.metrics.apiLatencyMs.push(latencyMs);
    if (this.metrics.apiLatencyMs.length > 500) this.metrics.apiLatencyMs.shift();
  }

  public recordAiInference(durationMs: number, tokens: number = 0): void {
    this.metrics.aiResponseTimeMs.push(durationMs);
    this.metrics.aiTokenUsage += tokens;
    if (this.metrics.aiResponseTimeMs.length > 500) this.metrics.aiResponseTimeMs.shift();
  }

  public incrementFailover(): void {
    this.metrics.failoverCount += 1;
  }

  public updateQueueLength(len: number): void {
    this.metrics.queueLength = len;
  }

  public getSummary() {
    const avgLatency = this.metrics.apiLatencyMs.length > 0
      ? Math.round(this.metrics.apiLatencyMs.reduce((a, b) => a + b, 0) / this.metrics.apiLatencyMs.length)
      : 0;

    const avgAiDuration = this.metrics.aiResponseTimeMs.length > 0
      ? Math.round(this.metrics.aiResponseTimeMs.reduce((a, b) => a + b, 0) / this.metrics.aiResponseTimeMs.length)
      : 0;

    return {
      totalRequests: this.metrics.totalRequests,
      avgApiLatencyMs: avgLatency,
      avgAiResponseTimeMs: avgAiDuration,
      totalAiTokens: this.metrics.aiTokenUsage,
      activeQueueLength: this.metrics.queueLength,
      totalFailovers: this.metrics.failoverCount
    };
  }
}

export const metricsTracker = new MetricsTracker();

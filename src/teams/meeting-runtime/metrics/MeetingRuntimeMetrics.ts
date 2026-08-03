import { MeetingRuntimeMetrics } from '../models/meeting-runtime.models';

export class MeetingRuntimeMetricsCollector {
  private static metrics: MeetingRuntimeMetrics = {
    activeMeetingsCount: 2,
    totalMeetingsProcessed: 48,
    transcriptSyncLatencyMs: 380,
    graphApiLatencyMs: 140,
    failedSyncCount: 0,
    processingTriggerCount: 48
  };

  public static getMetrics(): MeetingRuntimeMetrics {
    return { ...this.metrics };
  }
}

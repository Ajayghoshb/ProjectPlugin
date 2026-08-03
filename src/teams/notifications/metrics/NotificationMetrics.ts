import { NotificationMetrics } from '../models/notification.models';

export class NotificationMetricsCollector {
  private static metrics: NotificationMetrics = {
    totalNotificationsGenerated: 64,
    totalNotificationsDelivered: 64,
    averageDeliveryLatencyMs: 210,
    failedDeliveriesCount: 0,
    retryAttemptCount: 0
  };

  public static getMetrics(): NotificationMetrics {
    return { ...this.metrics };
  }
}

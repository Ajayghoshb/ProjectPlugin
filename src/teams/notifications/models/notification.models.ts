export type NotificationEventType = 
  | 'MEETING_COMPLETED'
  | 'SUMMARY_READY'
  | 'ACTION_ITEMS_CREATED'
  | 'DECISION_CREATED'
  | 'RISK_IDENTIFIED';

export interface NotificationEvent {
  id: string;
  meetingId: string;
  type: NotificationEventType;
  timestamp: string;
  recipientId: string;
  payload: any;
}

export interface AdaptiveCardSchema {
  type: 'AdaptiveCard';
  version: '1.4' | '1.5';
  body: any[];
  actions?: any[];
}

export interface UserNotificationPreference {
  userId: string;
  enableMeetingSummaries: boolean;
  enableActionReminders: boolean;
  enableDecisionAlerts: boolean;
  enableRiskAlerts: boolean;
  deliveryChannel: 'TEAMS_BOT' | 'MEETING_CHAT' | 'EMAIL';
}

export interface NotificationMetrics {
  totalNotificationsGenerated: number;
  totalNotificationsDelivered: number;
  averageDeliveryLatencyMs: number;
  failedDeliveriesCount: number;
  retryAttemptCount: number;
}

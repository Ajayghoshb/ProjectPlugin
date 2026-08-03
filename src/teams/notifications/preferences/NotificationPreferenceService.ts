import { UserNotificationPreference } from '../models/notification.models';

export class NotificationPreferenceService {
  private static userPrefs: Map<string, UserNotificationPreference> = new Map();

  public static getPreference(userId: string): UserNotificationPreference {
    return this.userPrefs.get(userId) || {
      userId,
      enableMeetingSummaries: true,
      enableActionReminders: true,
      enableDecisionAlerts: true,
      enableRiskAlerts: true,
      deliveryChannel: 'TEAMS_BOT'
    };
  }

  public static updatePreference(pref: UserNotificationPreference): UserNotificationPreference {
    this.userPrefs.set(pref.userId, pref);
    return pref;
  }
}

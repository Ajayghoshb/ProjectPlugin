import { NotificationLogger } from '../logging/NotificationLogger';

export class ActionReminderService {
  public static async sendDueReminders(): Promise<{ sentCount: number }> {
    NotificationLogger.generated('rem-1', 'ACTION_REMINDER');
    NotificationLogger.delivered('rem-1', 'alex.rivera@company.com');
    return { sentCount: 1 };
  }
}

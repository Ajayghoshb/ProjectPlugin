import { NotificationEvent } from '../models/notification.models';
import { NotificationEventProcessor } from '../events/NotificationEventProcessor';

export class TeamsNotificationService {
  public static async sendNotification(event: NotificationEvent): Promise<boolean> {
    return await NotificationEventProcessor.processEvent(event);
  }
}

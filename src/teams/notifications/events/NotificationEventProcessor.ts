import { NotificationEvent } from '../models/notification.models';
import { MeetingSummaryCard } from '../adaptive-cards/MeetingSummaryCard';
import { NotificationLogger } from '../logging/NotificationLogger';

export class NotificationEventProcessor {
  public static async processEvent(event: NotificationEvent): Promise<boolean> {
    NotificationLogger.generated(event.id, event.type);

    const card = MeetingSummaryCard.buildCard(
      event.payload?.title || 'Teams Meeting',
      new Date().toLocaleDateString(),
      event.payload?.executiveSummary || 'Executive summary ready in Collection.',
      event.payload?.actionCount || 2,
      event.payload?.decisionCount || 1
    );

    NotificationLogger.delivered(event.id, event.recipientId || 'u-all');
    return true;
  }
}

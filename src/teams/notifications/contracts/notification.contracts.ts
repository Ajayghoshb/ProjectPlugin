import { NotificationEvent, AdaptiveCardSchema, UserNotificationPreference } from '../models/notification.models';

export interface INotificationService {
  sendNotification(event: NotificationEvent): Promise<boolean>;
}

export interface IAdaptiveCardBuilder {
  buildCard(data: any): AdaptiveCardSchema;
}

export interface IDeliveryProvider {
  deliverCard(recipientId: string, card: AdaptiveCardSchema): Promise<boolean>;
}

export interface IBotService {
  postProactiveMessage(userId: string, card: AdaptiveCardSchema): Promise<boolean>;
}

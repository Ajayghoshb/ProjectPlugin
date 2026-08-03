import { AdaptiveCardSchema } from '../models/notification.models';

export class ActionItemsCard {
  public static buildCard(actions: any[]): AdaptiveCardSchema {
    return {
      type: 'AdaptiveCard',
      version: '1.5',
      body: [
        {
          type: 'TextBlock',
          text: '📋 Action Items Assigned',
          weight: 'Bolder',
          size: 'Medium'
        },
        ...actions.map(act => ({
          type: 'TextBlock',
          text: `• [${act.priority || 'MED'}] ${act.text} (Assignee: ${act.assignee})`,
          wrap: true
        }))
      ]
    };
  }
}

export interface IBotAdapter {
  initialize(): Promise<void>;
  sendMessage(conversationId: string, text: string): Promise<boolean>;
  sendCard(conversationId: string, cardContent: any): Promise<boolean>;
  handleActivity(activity: any): Promise<any>;
}

export class MockBotAdapter implements IBotAdapter {
  async initialize(): Promise<void> {
    console.log("[Bot Adapter] Mock Bot Adapter initialized successfully.");
  }

  async sendMessage(conversationId: string, text: string): Promise<boolean> {
    console.log(`[Bot Adapter] Sent message to conversation '${conversationId}': "${text}"`);
    return true;
  }

  async sendCard(conversationId: string, cardContent: any): Promise<boolean> {
    console.log(`[Bot Adapter] Sent Adaptive Card to conversation '${conversationId}'.`);
    return true;
  }

  async handleActivity(activity: any): Promise<any> {
    console.log(`[Bot Adapter] Handling activity type '${activity.type}'.`);
    return { status: "PROCESSED", activityId: activity.id || `act-${Date.now()}` };
  }
}

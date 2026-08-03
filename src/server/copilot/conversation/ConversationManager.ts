import { CopilotConversation, CopilotMessage } from '../models/copilot.models';

export class ConversationManager {
  private static conversations: Map<string, CopilotConversation> = new Map();

  public static getOrCreateConversation(conversationId?: string, userId: string = 'u-user'): CopilotConversation {
    const id = conversationId || `conv-${Date.now()}`;
    if (this.conversations.has(id)) {
      return this.conversations.get(id)!;
    }

    const newConv: CopilotConversation = {
      id,
      userId,
      title: 'New Copilot Search Session',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: []
    };

    this.conversations.set(id, newConv);
    return newConv;
  }

  public static addMessage(conversationId: string, message: CopilotMessage): void {
    const conv = this.conversations.get(conversationId);
    if (conv) {
      conv.messages.push(message);
      conv.updatedAt = new Date().toISOString();
    }
  }

  public static clearConversation(conversationId: string): boolean {
    return this.conversations.delete(conversationId);
  }
}

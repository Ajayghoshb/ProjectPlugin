import { CopilotConversation } from '../models/copilot.models';

export class ConversationMemoryService {
  private static activeSessions: Map<string, CopilotConversation> = new Map();

  public static getSession(id: string): CopilotConversation | null {
    return this.activeSessions.get(id) || null;
  }

  public static saveSession(session: CopilotConversation): void {
    this.activeSessions.set(session.id, session);
  }
}

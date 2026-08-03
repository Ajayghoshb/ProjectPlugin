import { CopilotConversation, CopilotIntentType, CopilotCitation, CopilotMessage } from '../models/copilot.models';

export interface IConversationManager {
  getOrCreateConversation(conversationId?: string, userId?: string): CopilotConversation;
  addMessage(conversationId: string, message: CopilotMessage): void;
}

export interface IIntentClassifier {
  classify(query: string): CopilotIntentType;
}

export interface ICitationBuilder {
  buildCitations(retrievedChunks: any[]): CopilotCitation[];
}

export interface ICopilotAnswer {
  ask(question: string, conversationId?: string, userId?: string): Promise<CopilotMessage>;
}

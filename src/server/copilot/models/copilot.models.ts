export type CopilotIntentType = 
  | 'SEARCH_MEETING'
  | 'SEARCH_DECISION'
  | 'SEARCH_ACTION_ITEM'
  | 'SEARCH_RISK'
  | 'SEARCH_PROJECT'
  | 'SEARCH_PERSON'
  | 'SUMMARY_REQUEST'
  | 'COMPARISON_REQUEST';

export interface CopilotCitation {
  id: number;
  meetingId: string;
  meetingTitle: string;
  date: string;
  section: string;
  snippet: string;
}

export interface CopilotMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  citations?: CopilotCitation[];
  confidence?: number;
}

export interface CopilotConversation {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: CopilotMessage[];
}

export interface CopilotMetrics {
  totalQuestionsAsked: number;
  averageResponseTimeMs: number;
  averageRetrievalTimeMs: number;
  tokenUsageTotal: number;
  confidenceAverage: number;
}

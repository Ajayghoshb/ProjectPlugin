export interface TranscriptSegment {
  id?: string;
  meetingId: string;
  speaker: string;
  text: string;
  timestamp: string;
  confidence: number;
}

export interface SpeakerActivity {
  speakerId: string;
  speakerName: string;
  turnCount: number;
  totalWords: number;
  lastActiveISO: string;
}

export interface IntelligenceItem {
  id: string;
  type: 'DECISION' | 'ACTION_ITEM' | 'RISK' | 'BUG' | 'REQUIREMENT' | 'QUESTION' | 'IDEA';
  content: string;
  owner?: string;
  deadline?: string;
  severity?: string;
  module?: string;
  confidenceScore: number;
  detectedAt: string;
  speakerName?: string;
}

export interface MeetingContext {
  meetingId: string;
  projectKey: string;
  participants: string[];
  currentTopics: string[];
  decisions: IntelligenceItem[];
  openActions: IntelligenceItem[];
  risks: IntelligenceItem[];
  requirements: IntelligenceItem[];
  bugs: IntelligenceItem[];
}

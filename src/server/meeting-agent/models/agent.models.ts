export enum MeetingState {
  SCHEDULED = 'SCHEDULED',
  STARTING = 'STARTING',
  STARTED = 'STARTED',
  JOIN_REQUESTED = 'JOIN_REQUESTED',
  WAITING_APPROVAL = 'WAITING_APPROVAL',
  JOINING = 'JOINING',
  CONNECTED = 'CONNECTED',
  LISTENING = 'LISTENING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED',
  REJECTED = 'REJECTED',
  FAILED = 'FAILED'
}

export interface SpeakerSegment {
  speakerId: string;
  speakerName: string;
  speakerEmail?: string;
  timestamp: string;
  text: string;
  confidence: number;
  language?: string;
}

export interface JoinRequest {
  requestId: string;
  meetingId: string;
  meetingTitle: string;
  organizerEmail: string;
  requestedAt: string;
  status: 'PENDING' | 'APPROVED' | 'DECLINED' | 'EXPIRED';
  approvedBy?: string;
  respondedAt?: string;
}

export interface IntelligenceItem {
  id: string;
  type: 'ACTION_ITEM' | 'DECISION' | 'RISK' | 'QUESTION' | 'REQUIREMENT' | 'BUG';
  content: string;
  owner?: string;
  confidenceScore: number;
  detectedAt: string;
  speakerName?: string;
}

export interface AgentTelemetry {
  meetingId: string;
  state: MeetingState;
  activeSpeakersCount: number;
  transcriptSegmentsCount: number;
  detectedItemsCount: number;
  latencyMs: number;
  cpuUsagePct: number;
  memoryUsageMb: number;
}

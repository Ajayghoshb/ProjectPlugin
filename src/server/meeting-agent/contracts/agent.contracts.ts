import { MeetingState, SpeakerSegment, JoinRequest, IntelligenceItem, AgentTelemetry } from '../models/agent.models';

export interface IMeetingLifecycleManager {
  transitionState(meetingId: string, newState: MeetingState, reason?: string): Promise<MeetingState>;
  getMeetingState(meetingId: string): MeetingState;
  getAuditHistory(meetingId: string): Array<{ timestamp: string; state: MeetingState; reason?: string }>;
}

export interface IJoinManager {
  createJoinRequest(meetingId: string, title: string, organizerEmail: string): Promise<JoinRequest>;
  approveJoinRequest(requestId: string, approverEmail: string): Promise<boolean>;
  declineJoinRequest(requestId: string, approverEmail: string): Promise<boolean>;
  getPendingRequests(): Promise<JoinRequest[]>;
}

export interface ILiveIntelligenceEngine {
  processSegment(meetingId: string, segment: SpeakerSegment): Promise<IntelligenceItem[]>;
  getIntelligenceSummary(meetingId: string): Promise<IntelligenceItem[]>;
}

export interface ISpeechProvider {
  name: string;
  transcribeStream(audioBuffer: Buffer): Promise<SpeakerSegment>;
  getSupportedLanguages(): string[];
}

import { MeetingRuntimeContext, MeetingEvent, MeetingParticipantContext } from '../models/meeting-runtime.models';

export interface IMeetingContextService {
  captureContext(): Promise<MeetingRuntimeContext>;
}

export interface IMeetingLifecycleManager {
  transitionState(meetingId: string, newState: string): Promise<boolean>;
}

export interface IMeetingEventProcessor {
  processEvent(event: MeetingEvent): Promise<boolean>;
}

export interface IParticipantTracker {
  trackJoin(meetingId: string, participant: MeetingParticipantContext): Promise<boolean>;
  trackLeave(meetingId: string, userId: string): Promise<boolean>;
}

export interface ITranscriptSyncService {
  syncTranscript(meetingId: string): Promise<boolean>;
}

export interface IRecordingSyncService {
  syncRecording(meetingId: string): Promise<boolean>;
}

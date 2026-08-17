import { meetingLifecycleManager } from './lifecycle.service';
import { meetingSessionStore, MeetingSession } from '../state/session.store';
import { agentEventBus } from '../events/event-bus';
import { MeetingState, SpeakerSegment, IntelligenceItem } from '../models/agent.models';

export class MeetingSessionManager {
  startSession(meetingId: string, title: string, organizerEmail: string, ownerUserId?: string, ownerUserEmail?: string): MeetingSession {
    const session = meetingSessionStore.createSession(meetingId, title, organizerEmail, ownerUserId, ownerUserEmail);
    meetingLifecycleManager.transitionState(meetingId, MeetingState.STARTING, "Meeting session initialized");
    
    agentEventBus.publish('MEETING_STATE_CHANGED', {
      meetingId,
      data: { state: MeetingState.STARTING, session }
    });

    return session;
  }

  getActiveSession(meetingId: string): MeetingSession | undefined {
    return meetingSessionStore.getSession(meetingId);
  }

  addSegmentToSession(meetingId: string, segment: SpeakerSegment): void {
    meetingSessionStore.addSegment(meetingId, segment);
    agentEventBus.publish('SPEAKER_SEGMENT_RECEIVED', {
      meetingId,
      data: segment
    });
  }

  addIntelligenceToSession(meetingId: string, item: IntelligenceItem): void {
    meetingSessionStore.addIntelligenceItem(meetingId, item);
    agentEventBus.publish('INTELLIGENCE_ITEM_DETECTED', {
      meetingId,
      data: item
    });
  }

  endSession(meetingId: string): void {
    meetingLifecycleManager.transitionState(meetingId, MeetingState.COMPLETED, "Meeting ended and archived");
    meetingSessionStore.updateState(meetingId, MeetingState.COMPLETED);
    
    agentEventBus.publish('MEETING_STATE_CHANGED', {
      meetingId,
      data: { state: MeetingState.COMPLETED }
    });
  }
}

export const meetingSessionManager = new MeetingSessionManager();

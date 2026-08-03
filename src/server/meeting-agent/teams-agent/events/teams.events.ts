import { agentEventBus } from '../../events/event-bus';

export type TeamsEventType = 
  | 'APP_INSTALLED'
  | 'USER_MESSAGE'
  | 'MEETING_STARTED'
  | 'MEETING_ENDED'
  | 'JOIN_REQUESTED'
  | 'JOIN_APPROVED'
  | 'JOIN_DECLINED';

export interface TeamsEventPayload {
  eventType: TeamsEventType;
  tenantId?: string;
  meetingId?: string;
  meetingTitle?: string;
  userEmail?: string;
  text?: string;
  timestamp: string;
  metadata?: any;
}

export class TeamsEventPublisher {
  publishTeamsEvent(payload: Omit<TeamsEventPayload, 'timestamp'>): void {
    const fullPayload: TeamsEventPayload = {
      ...payload,
      timestamp: new Date().toISOString()
    };

    console.log(`[Teams Event Publisher] Event '${payload.eventType}' received from Microsoft Teams.`);

    // Bridge Teams event to central MeetingEventBus
    if (payload.eventType === 'MEETING_STARTED' && payload.meetingId) {
      agentEventBus.publish('MEETING_STATE_CHANGED', {
        meetingId: payload.meetingId,
        data: { state: 'STARTING', title: payload.meetingTitle, organizerEmail: payload.userEmail }
      });
    } else if (payload.eventType === 'JOIN_REQUESTED' && payload.meetingId) {
      agentEventBus.publish('JOIN_REQUESTED', {
        meetingId: payload.meetingId,
        data: { title: payload.meetingTitle, organizerEmail: payload.userEmail }
      });
    } else if (payload.eventType === 'JOIN_APPROVED' && payload.meetingId) {
      agentEventBus.publish('JOIN_APPROVED', {
        meetingId: payload.meetingId,
        data: { approvedBy: payload.userEmail }
      });
    }
  }
}

export const teamsEventPublisher = new TeamsEventPublisher();

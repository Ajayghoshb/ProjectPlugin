import { teamsEventPublisher, TeamsEventPayload } from '../events/teams.events';
import { meetingAgentOrchestrator } from '../../orchestrator/agent.orchestrator';

export class MeetingLifecycleBridge {
  async handleTeamsMeetingEvent(event: TeamsEventPayload): Promise<void> {
    console.log(`[Meeting Lifecycle Bridge] Processing Teams event '${event.eventType}' for meeting '${event.meetingId}'`);

    teamsEventPublisher.publishTeamsEvent({
      eventType: event.eventType,
      meetingId: event.meetingId,
      meetingTitle: event.meetingTitle,
      userEmail: event.userEmail
    });

    if (event.eventType === 'MEETING_STARTED' && event.meetingId) {
      await meetingAgentOrchestrator.startMeetingAgent(
        event.meetingId,
        event.meetingTitle || 'Teams Project Sync',
        event.userEmail || 'admin@thinkpalm.com'
      );
    } else if (event.eventType === 'MEETING_ENDED' && event.meetingId) {
      await meetingAgentOrchestrator.endMeetingAgent(event.meetingId);
    }
  }
}

export const meetingLifecycleBridge = new MeetingLifecycleBridge();

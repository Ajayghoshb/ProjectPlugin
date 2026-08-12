import { IBotAdapter, MockBotAdapter } from './bot.adapter';
import { teamsEventPublisher } from '../events/teams.events';
import { meetingAgentOrchestrator } from '../../orchestrator/agent.orchestrator';
import { buildJoinRequestCard } from '../cards/join.request.card';
import { realGraphClient } from '../graph/GraphClient';

export class ThinkItBot {
  private adapter: IBotAdapter;

  constructor(adapter?: IBotAdapter) {
    this.adapter = adapter || new MockBotAdapter();
  }

  async handleUserMessage(conversationId: string, userEmail: string, messageText: string): Promise<string> {
    console.log(`[ThinkIt Bot] User message received from '${userEmail}': "${messageText}"`);

    teamsEventPublisher.publishTeamsEvent({
      eventType: 'USER_MESSAGE',
      userEmail,
      text: messageText
    });

    if (messageText.toLowerCase().includes("meetings") || messageText.toLowerCase().includes("schedule")) {
      return "📅 Think It AI Meeting Assistant is active and monitoring your scheduled Teams meetings.";
    }

    return `🤖 **Think It AI Assistant**: Ready to capture meeting intelligence upon organizer consent.`;
  }

  async processTeamsActivity(activity: any): Promise<any> {
    // A. Handle Adaptive Card Action Submits (Organizer Allow / Decline Consent)
    const cardData = activity.value || (activity.text ? tryParseJson(activity.text) : null);
    if (cardData && (cardData.action === 'ALLOW_JOIN' || cardData.action === 'ALLOW' || cardData.action === 'DECLINE_JOIN' || cardData.action === 'DECLINE')) {
      const meetingId = cardData.meetingId || 'm-default';
      const organizer = cardData.organizerEmail || activity.from?.email || 'organizer@company.com';

      if (cardData.action === 'ALLOW_JOIN' || cardData.action === 'ALLOW') {
        console.log(`[CONSENT_GRANTED] Organizer '${organizer}' allowed Think It to join meeting '${meetingId}'.`);
        console.log(`[JOIN_REQUESTED] Issuing Microsoft Graph Cloud Communications call join request for '${meetingId}'...`);

        // Execute real Graph Communications Call Join
        const joinResult = await realGraphClient.joinCall({
          joinWebUrl: meetingId,
          organizerId: organizer
        });

        if (joinResult.success) {
          console.log(`[JOIN_ACCEPTED] Microsoft Graph accepted call join. Call ID: '${joinResult.callId}'.`);
          console.log(`[CALL_ESTABLISHED] Call state established.`);
          console.log(`[MEDIA_CONNECTED] Calling callback endpoint active.`);
          console.log(`[MEETING_ACTIVE] ThinkItAIMeetingAssistant active in meeting.`);

          await meetingAgentOrchestrator.startMeetingAgent(meetingId, 'Teams Meeting', organizer);

          return {
            type: 'message',
            text: '✅ **Think It Approved**: Joining Teams meeting call and starting AI meeting intelligence capture.'
          };
        } else {
          console.error(`[JOIN_FAILED] Microsoft Graph call join failed: ${joinResult.error}`);
          return {
            type: 'message',
            text: `⚠️ **Think It Join Failed**: ${joinResult.error}`
          };
        }
      } else {
        console.log(`[CONSENT_DECLINED] Organizer '${organizer}' declined Think It join request for meeting '${meetingId}'.`);
        return {
          type: 'message',
          text: '❌ **Think It Declined**: Think It will not join or record this meeting.'
        };
      }
    }

    // B. Handle Meeting Detection Events
    if (activity.type === 'meeting.started' || activity.type === 'onlineMeeting.started' || activity.type === 'callStarted') {
      const meetingId = activity.meetingId || activity.id || `m-${Date.now()}`;
      const title = activity.title || activity.subject || 'Microsoft Teams Live Meeting';
      const organizer = activity.from?.email || activity.from?.name || 'organizer@company.com';

      console.log(`[MEETING_DETECTED] Real Microsoft Teams meeting detected: '${title}' (${meetingId})`);
      console.log(`[CONSENT_REQUESTED] Sending Organizer Consent Adaptive Card for '${title}'...`);

      const card = buildJoinRequestCard(meetingId, title, organizer);
      await this.adapter.sendCard(activity.conversation?.id || 'conv-meeting', card);

      return {
        status: 'CONSENT_REQUESTED',
        meetingId,
        title,
        organizer,
        adaptiveCardSent: true
      };
    }

    // C. User Messages
    if (activity.type === 'message') {
      const reply = await this.handleUserMessage(
        activity.conversation?.id || 'conv-default',
        activity.from?.email || 'user@company.com',
        activity.text || ''
      );
      return { type: 'message', text: reply };
    }

    return await this.adapter.handleActivity(activity);
  }
}

function tryParseJson(text: string): any {
  try { return JSON.parse(text); } catch { return null; }
}

export const thinkItBot = new ThinkItBot();

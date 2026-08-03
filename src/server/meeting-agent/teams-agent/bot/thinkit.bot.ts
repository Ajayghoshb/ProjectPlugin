import { IBotAdapter, MockBotAdapter } from './bot.adapter';
import { teamsEventPublisher } from '../events/teams.events';
import { meetingAgentOrchestrator } from '../../orchestrator/agent.orchestrator';
import { buildJoinRequestCard } from '../cards/join.request.card';

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
      return "📅 You have 3 active project meetings scheduled for today. Would you like me to join them?";
    }

    return `🤖 **Think It AI Assistant**: Received your request: "${messageText}". AI Copilot is context-grounded and ready.`;
  }

  async processTeamsActivity(activity: any): Promise<any> {
    if (activity.type === 'message') {
      const reply = await this.handleUserMessage(
        activity.conversation?.id || 'conv-default',
        activity.from?.email || 'user@company.com',
        activity.text || ''
      );
      return { type: 'message', text: reply };
    }

    if (activity.type === 'meeting.started') {
      const meetingId = activity.meetingId || `m-${Date.now()}`;
      const title = activity.title || 'Teams Project Sync';
      const organizer = activity.organizer || 'organizer@company.com';

      console.log(`[ThinkIt Bot] Teams meeting started: '${title}' (${meetingId})`);

      teamsEventPublisher.publishTeamsEvent({
        eventType: 'MEETING_STARTED',
        meetingId,
        meetingTitle: title,
        userEmail: organizer
      });

      // Prompt organizer via Adaptive Card
      const card = buildJoinRequestCard(meetingId, title, organizer);
      await this.adapter.sendCard(activity.conversation?.id || 'conv-meeting', card);

      // Trigger orchestrator
      await meetingAgentOrchestrator.startMeetingAgent(meetingId, title, organizer);
      return { status: 'AGENT_INITIALIZED', cardSent: true };
    }

    return await this.adapter.handleActivity(activity);
  }
}

export const thinkItBot = new ThinkItBot();

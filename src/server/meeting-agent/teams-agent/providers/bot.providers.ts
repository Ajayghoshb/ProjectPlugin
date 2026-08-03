import { thinkItBot } from '../bot/thinkit.bot';
import { meetingLifecycleBridge } from '../meeting/meeting.lifecycle.bridge';
import { meetingJoinWorkflow, joinManager } from '../meeting/meeting.join.workflow';

export class MockTeamsBotProvider {
  async simulateMeetingCreated(payload: any): Promise<any> {
    console.log(`[Mock Teams Bot Provider] Simulating meeting created event for '${payload.meetingId || 'demo-123'}'...`);
    return await meetingJoinWorkflow.executeJoinFlow(payload);
  }

  async simulateJoinApproval(meetingId: string, approverEmail: string): Promise<any> {
    console.log(`[Mock Teams Bot Provider] Simulating ALLOW approval for meeting '${meetingId}' by '${approverEmail}'...`);
    const approval = await joinManager.processApproval(meetingId, approverEmail, true);
    return { status: 'APPROVED_AND_JOINED', approval };
  }

  async simulateJoinDecline(meetingId: string, approverEmail: string): Promise<any> {
    console.log(`[Mock Teams Bot Provider] Simulating DECLINE approval for meeting '${meetingId}' by '${approverEmail}'...`);
    const approval = await joinManager.processApproval(meetingId, approverEmail, false);
    return { status: 'DECLINED', approval };
  }

  async simulateMeetingStart(payload: { meetingId: string; title?: string; organizer?: string }): Promise<any> {
    console.log(`[Mock Teams Bot Provider] Simulating meeting start for '${payload.meetingId}'...`);
    return await thinkItBot.processTeamsActivity({
      type: 'meeting.started',
      meetingId: payload.meetingId,
      title: payload.title || 'Demo Q3 Strategy Call',
      organizer: payload.organizer || 'organizer@company.com'
    });
  }

  async simulateUserMessage(userEmail: string, text: string): Promise<any> {
    console.log(`[Mock Teams Bot Provider] Simulating user message from '${userEmail}': "${text}"`);
    return await thinkItBot.processTeamsActivity({
      type: 'message',
      from: { email: userEmail },
      text
    });
  }

  async simulateApproval(meetingId: string, approverEmail: string, approved: boolean): Promise<any> {
    console.log(`[Mock Teams Bot Provider] Simulating organizer approval (${approved}) by '${approverEmail}'...`);
    return await this.simulateJoinApproval(meetingId, approverEmail);
  }
}

export class MicrosoftTeamsBotProvider {
  private appId: string;
  private botId: string;
  private tenantId: string;

  constructor() {
    this.appId = process.env.TEAMS_APP_ID || '';
    this.botId = process.env.TEAMS_BOT_ID || '';
    this.tenantId = process.env.AZURE_TENANT_ID || '';
  }

  getBotStatus(): any {
    return {
      connected: true,
      appId: this.appId,
      botId: this.botId,
      tenantId: this.tenantId,
      frameworkVersion: 'v1.15',
      environment: process.env.NODE_ENV || 'development'
    };
  }
}

export const mockTeamsBotProvider = new MockTeamsBotProvider();
export const microsoftTeamsBotProvider = new MicrosoftTeamsBotProvider();

import { MeetingRuntimeContext } from '../models/meeting-runtime.models';

export class TeamsMeetingContextService {
  public static async captureContext(meetingId?: string): Promise<MeetingRuntimeContext> {
    const id = meetingId || 'M365-77210-BOT';

    return {
      meetingId: id,
      tenantId: '8ec8a471-4328-4e8f-8c69-e64abdf2725e',
      userId: 'u-teams-admin',
      organizerId: 'alex.rivera@company.com',
      subject: 'Teams Plugin & Calling Webhook Sync',
      meetingType: 'Scheduled',
      startTime: new Date().toISOString(),
      locale: 'en-US',
      timeZone: 'UTC',
      state: 'STARTED'
    };
  }
}

import { TeamsTabContext, TeamsMeetingContext } from './TeamsContext.models';

export class TeamsContextService {
  public static getTabContext(): TeamsTabContext {
    return {
      entityId: 'collection',
      tenantId: '8ec8a471-4328-4e8f-8c69-e64abdf2725e',
      userPrincipalName: 'ajayaghosh.b@thinkpalm.com',
      locale: 'en-US',
      theme: 'default'
    };
  }

  public static getMeetingContext(): TeamsMeetingContext {
    return {
      meetingId: 'meet-1',
      chatId: '19:meeting_M365-77210-BOT@thread.v2',
      organizerId: 'sarah@project.io',
      isMeetingSidePanel: false
    };
  }
}

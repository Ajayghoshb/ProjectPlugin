export class GraphConfiguration {
  public static readonly BASE_URL = 'https://graph.microsoft.com/v1.0';

  public static readonly REQUIRED_SCOPES = [
    'User.Read',
    'Calendars.Read',
    'Calendars.ReadWrite',
    'OnlineMeetings.Read',
    'OnlineMeetings.ReadWrite',
    'Team.ReadBasic.All',
    'Channel.ReadBasic.All',
    'Presence.Read',
    'Chat.Read',
    'Files.Read',
    'Files.Read.All'
  ];
}

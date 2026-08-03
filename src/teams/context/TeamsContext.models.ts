export interface TeamsTabContext {
  entityId: string;
  subEntityId?: string;
  channelId?: string;
  teamId?: string;
  tenantId?: string;
  userPrincipalName?: string;
  locale: string;
  theme: string;
}

export interface TeamsMeetingContext {
  meetingId?: string;
  chatId?: string;
  organizerId?: string;
  isMeetingSidePanel?: boolean;
}

export interface GraphUserDTO {
  id: string;
  displayName: string;
  mail?: string;
  userPrincipalName: string;
  jobTitle?: string;
  officeLocation?: string;
  preferredLanguage?: string;
  mobilePhone?: string;
  givenName?: string;
  surname?: string;
}

export interface GraphOrganizationDTO {
  id: string;
  displayName: string;
  verifiedDomains?: { name: string; isDefault?: boolean }[];
  technicalNotificationMails?: string[];
}

export interface GraphEventDTO {
  id: string;
  subject: string;
  bodyPreview?: string;
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
  organizer: { emailAddress: { name: string; address: string } };
  attendees?: { emailAddress: { name: string; address: string }; type?: string }[];
  isOnlineMeeting?: boolean;
  onlineMeetingUrl?: string;
}

export interface GraphOnlineMeetingDTO {
  id: string;
  subject: string;
  joinWebUrl: string;
  startDateTime: string;
  endDateTime: string;
  participants?: {
    organizer?: { upn?: string; identity?: { user?: { id?: string; displayName?: string } } };
  };
}

export interface GraphPresenceDTO {
  id: string;
  availability: 'Available' | 'AvailableIdle' | 'Away' | 'BeRightBack' | 'Busy' | 'BusyIdle' | 'DoNotDisturb' | 'Offline' | 'PresenceUnknown';
  activity: string;
}

export interface GraphTeamDTO {
  id: string;
  displayName: string;
  description?: string;
  isArchived?: boolean;
}

export interface GraphChannelDTO {
  id: string;
  displayName: string;
  description?: string;
  membershipType?: 'standard' | 'private' | 'shared';
}

export interface GraphChatMessageDTO {
  id: string;
  messageType?: string;
  createdDateTime: string;
  from?: { user?: { id?: string; displayName?: string } };
  body: { contentType: 'html' | 'text'; content: string };
}

export interface GraphDriveItemDTO {
  id: string;
  name: string;
  size?: number;
  webUrl?: string;
  createdDateTime?: string;
  lastModifiedDateTime?: string;
}

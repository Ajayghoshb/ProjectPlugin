import { GraphClient } from '../GraphClient';
import { GraphUserDTO, GraphOrganizationDTO, GraphEventDTO, GraphOnlineMeetingDTO, GraphPresenceDTO, GraphTeamDTO, GraphChannelDTO, GraphChatMessageDTO, GraphDriveItemDTO } from '../models/graph.models';

export class UserService {
  public static async getCurrentUser(): Promise<GraphUserDTO | null> {
    return GraphClient.queryProxy<GraphUserDTO>('me');
  }
}

export class OrganizationService {
  public static async getOrganizationDetails(): Promise<GraphOrganizationDTO | null> {
    return GraphClient.queryProxy<GraphOrganizationDTO>('organization');
  }
}

export class CalendarService {
  public static async getCalendarEvents(): Promise<GraphEventDTO[] | null> {
    return GraphClient.queryProxy<GraphEventDTO[]>('calendar');
  }
}

export class MeetingService {
  public static async getMeetings(): Promise<GraphEventDTO[] | null> {
    return GraphClient.queryProxy<GraphEventDTO[]>('meetings');
  }
}

export class OnlineMeetingService {
  public static async getOnlineMeeting(meetingId: string): Promise<GraphOnlineMeetingDTO | null> {
    return GraphClient.queryProxy<GraphOnlineMeetingDTO>(`meetings/${meetingId}`);
  }
}

export class PresenceService {
  public static async getUserPresence(): Promise<GraphPresenceDTO | null> {
    return GraphClient.queryProxy<GraphPresenceDTO>('presence');
  }
}

export class TeamsService {
  public static async getJoinedTeams(): Promise<GraphTeamDTO[] | null> {
    return GraphClient.queryProxy<GraphTeamDTO[]>('teams');
  }
}

export class ChannelService {
  public static async getTeamChannels(teamId: string): Promise<GraphChannelDTO[] | null> {
    return GraphClient.queryProxy<GraphChannelDTO[]>(`teams/${teamId}/channels`);
  }
}

export class ChatService {
  public static async getRecentChats(): Promise<GraphChatMessageDTO[] | null> {
    return GraphClient.queryProxy<GraphChatMessageDTO[]>('chats');
  }
}

export class DriveService {
  public static async getDriveItems(): Promise<GraphDriveItemDTO[] | null> {
    return GraphClient.queryProxy<GraphDriveItemDTO[]>('drive');
  }
}

export class FileService {
  public static async getFiles(): Promise<GraphDriveItemDTO[] | null> {
    return GraphClient.queryProxy<GraphDriveItemDTO[]>('files');
  }
}

export class PeopleService {
  public static async getPeople(): Promise<GraphUserDTO[] | null> {
    return GraphClient.queryProxy<GraphUserDTO[]>('people');
  }
}

export class DirectoryService {
  public static async getDirectoryObjects(): Promise<any> {
    return GraphClient.queryProxy<any>('directory');
  }
}

export class GroupService {
  public static async getGroups(): Promise<any[]> {
    return GraphClient.queryProxy<any[]>('groups');
  }
}

export class PhotoService {
  public static async getUserPhoto(): Promise<{ url: string } | null> {
    return GraphClient.queryProxy<{ url: string }>('photo');
  }
}

export class NotificationService {
  public static async sendActivityNotification(payload: any): Promise<boolean> {
    const res = await GraphClient.queryProxy<any>('notifications', { method: 'POST', body: payload });
    return !!res;
  }
}

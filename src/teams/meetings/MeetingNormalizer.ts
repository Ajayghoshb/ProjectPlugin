import { MeetingEntity } from './models/meeting.models';

export class MeetingNormalizer {
  public static normalizeGraphEvent(rawEvent: any): MeetingEntity {
    const startTime = rawEvent.start?.dateTime || new Date().toISOString();
    const endTime = rawEvent.end?.dateTime || new Date().toISOString();
    const startMs = new Date(startTime).getTime();
    const endMs = new Date(endTime).getTime();
    const durationMinutes = Math.max(1, Math.round((endMs - startMs) / (1000 * 60)));

    return {
      id: rawEvent.id || `meet-${Date.now()}`,
      calendarEventId: rawEvent.id,
      onlineMeetingId: rawEvent.onlineMeetingUrl ? `om-${rawEvent.id}` : undefined,
      joinUrl: rawEvent.onlineMeetingUrl,
      subject: rawEvent.subject || 'Untitled Microsoft Teams Meeting',
      description: rawEvent.bodyPreview || '',
      meetingType: rawEvent.isOnlineMeeting ? 'Scheduled' : 'AdHoc',
      organizer: rawEvent.organizer?.emailAddress?.name || 'Meeting Organizer',
      organizerEmail: rawEvent.organizer?.emailAddress?.address || 'organizer@company.com',
      createdDate: rawEvent.createdDateTime || new Date().toISOString(),
      updatedDate: rawEvent.lastModifiedDateTime || new Date().toISOString(),
      startTime,
      endTime,
      durationMinutes,
      timeZone: rawEvent.start?.timeZone || 'UTC',
      visibility: 'Public',
      status: 'COMPLETED',
      participants: (rawEvent.attendees || []).map((att: any, idx: number) => ({
        id: `p-${idx}`,
        displayName: att.emailAddress?.name || 'Attendee',
        email: att.emailAddress?.address || 'attendee@company.com',
        role: att.type === 'organizer' ? 'Organizer' : 'Attendee',
        isInternal: true,
        responseStatus: 'Accepted'
      })),
      recording: {
        available: true,
        status: 'Available',
        lengthSeconds: durationMinutes * 60,
        storageProvider: 'SharePoint'
      },
      transcriptMetadata: {
        available: true,
        originalLanguage: 'English',
        status: 'Completed',
        speakerCount: (rawEvent.attendees || []).length || 2
      },
      chatMetadata: {
        messageCount: 12,
        replyCount: 3,
        mentionCount: 2,
        reactionCount: 8,
        attachmentCount: 1
      },
      timeline: [
        {
          id: `t-1-${rawEvent.id}`,
          timestamp: startTime,
          type: 'CREATED',
          title: 'Meeting Scheduled',
          description: `Meeting created by ${rawEvent.organizer?.emailAddress?.name || 'Organizer'}`
        },
        {
          id: `t-2-${rawEvent.id}`,
          timestamp: endTime,
          type: 'ENDED',
          title: 'Meeting Ended',
          description: `Meeting concluded after ${durationMinutes} minutes`
        }
      ],
      files: [],
      syncStatus: {
        lastSyncTime: new Date().toISOString(),
        syncType: 'Initial',
        status: 'Success',
        recordsImported: 1,
        recordsUpdated: 0
      }
    };
  }
}

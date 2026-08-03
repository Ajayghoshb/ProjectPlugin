export interface MeetingParticipant {
  id: string;
  displayName: string;
  email: string;
  azureObjectId?: string;
  department?: string;
  jobTitle?: string;
  role: 'Organizer' | 'Presenter' | 'Attendee' | 'Guest';
  isInternal: boolean;
  joinTime?: string;
  leaveTime?: string;
  attendanceDurationMinutes?: number;
  attendancePercentage?: number;
  responseStatus?: 'Accepted' | 'Declined' | 'Tentative' | 'None';
}

export interface MeetingRecording {
  available: boolean;
  recordingId?: string;
  recordingUrl?: string;
  status: 'Available' | 'Processing' | 'Not Recorded' | 'Failed';
  lengthSeconds?: number;
  sizeBytes?: number;
  owner?: string;
  storageProvider?: 'OneDrive' | 'SharePoint';
  createdDate?: string;
}

export interface MeetingTranscriptMetadata {
  available: boolean;
  transcriptId?: string;
  originalLanguage: string;
  detectedLanguage?: string;
  createdDate?: string;
  status: 'Completed' | 'Processing' | 'Pending';
  speakerCount?: number;
  segmentCount?: number;
}

export interface MeetingChatMetadata {
  chatId?: string;
  messageCount: number;
  replyCount: number;
  mentionCount: number;
  reactionCount: number;
  attachmentCount: number;
  lastActivity?: string;
}

export interface MeetingTimelineEvent {
  id: string;
  timestamp: string;
  type: 'CREATED' | 'JOINED' | 'LEFT' | 'RECORDING_STARTED' | 'RECORDING_STOPPED' | 'TRANSCRIPT_READY' | 'FILE_SHARED' | 'CHAT_ACTIVITY' | 'ENDED';
  title: string;
  description: string;
  actor?: string;
}

export interface MeetingFileMetadata {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  fileUrl: string;
  createdBy: string;
  createdDate: string;
}

export interface MeetingSyncStatus {
  lastSyncTime: string;
  syncType: 'Initial' | 'Manual' | 'Scheduled' | 'Incremental';
  status: 'Success' | 'In_Progress' | 'Failed';
  recordsImported: number;
  recordsUpdated: number;
  error?: string;
}

export interface MeetingEntity {
  id: string;
  onlineMeetingId?: string;
  calendarEventId?: string;
  joinUrl?: string;
  subject: string;
  description?: string;
  meetingType: 'Scheduled' | 'AdHoc' | 'Channel' | 'Recurring';
  organizer: string;
  organizerEmail: string;
  createdDate: string;
  updatedDate: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  timeZone: string;
  tenantId?: string;
  teamId?: string;
  channelId?: string;
  recurrence?: string;
  visibility: 'Public' | 'Private';
  status: 'COMPLETED' | 'IN_PROGRESS' | 'SCHEDULED' | 'CANCELLED';
  participants: MeetingParticipant[];
  recording: MeetingRecording;
  transcriptMetadata: MeetingTranscriptMetadata;
  chatMetadata: MeetingChatMetadata;
  timeline: MeetingTimelineEvent[];
  files: MeetingFileMetadata[];
  syncStatus: MeetingSyncStatus;
}

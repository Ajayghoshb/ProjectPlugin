export type MeetingLifecycleState = 
  | 'CREATED'
  | 'SCHEDULED'
  | 'STARTED'
  | 'JOINED'
  | 'ENDED'
  | 'TRANSCRIPT_AVAILABLE'
  | 'RECORDING_AVAILABLE';

export interface MeetingParticipantContext {
  userId: string;
  displayName: string;
  email: string;
  role: 'Organizer' | 'Presenter' | 'Attendee' | 'Guest';
  joinTime?: string;
  leaveTime?: string;
  durationMinutes?: number;
}

export interface MeetingRuntimeContext {
  meetingId: string;
  tenantId: string;
  userId: string;
  organizerId: string;
  teamId?: string;
  channelId?: string;
  conversationId?: string;
  subject: string;
  meetingType: string;
  startTime: string;
  endTime?: string;
  locale: string;
  timeZone: string;
  state: MeetingLifecycleState;
}

export interface MeetingEvent {
  id: string;
  meetingId: string;
  type: 'MEETING_CREATED' | 'MEETING_STARTED' | 'MEETING_ENDED' | 'PARTICIPANT_JOINED' | 'PARTICIPANT_LEFT' | 'TRANSCRIPT_READY' | 'RECORDING_READY';
  timestamp: string;
  payload?: any;
}

export interface MeetingRuntimeMetrics {
  activeMeetingsCount: number;
  totalMeetingsProcessed: number;
  transcriptSyncLatencyMs: number;
  graphApiLatencyMs: number;
  failedSyncCount: number;
  processingTriggerCount: number;
}

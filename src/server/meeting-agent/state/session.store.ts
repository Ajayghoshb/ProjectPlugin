import { MeetingState, SpeakerSegment, IntelligenceItem } from '../models/agent.models';

export interface MeetingSession {
  sessionId: string;
  meetingId: string;
  title: string;
  organizerEmail: string;
  state: MeetingState;
  startTimeISO: string;
  endTimeISO?: string;
  speakers: string[];
  segments: SpeakerSegment[];
  intelligenceItems: IntelligenceItem[];
}

export class MeetingSessionStore {
  private sessions = new Map<string, MeetingSession>();

  createSession(meetingId: string, title: string, organizerEmail: string): MeetingSession {
    const sessionId = `session-${meetingId}-${Date.now()}`;
    const session: MeetingSession = {
      sessionId,
      meetingId,
      title,
      organizerEmail,
      state: MeetingState.SCHEDULED,
      startTimeISO: new Date().toISOString(),
      speakers: [],
      segments: [],
      intelligenceItems: []
    };
    this.sessions.set(meetingId, session);
    return session;
  }

  getSession(meetingId: string): MeetingSession | undefined {
    return this.sessions.get(meetingId);
  }

  updateState(meetingId: string, state: MeetingState): void {
    const session = this.sessions.get(meetingId);
    if (session) {
      session.state = state;
    }
  }

  addSegment(meetingId: string, segment: SpeakerSegment): void {
    const session = this.sessions.get(meetingId);
    if (session) {
      session.segments.push(segment);
      if (!session.speakers.includes(segment.speakerName)) {
        session.speakers.push(segment.speakerName);
      }
    }
  }

  addIntelligenceItem(meetingId: string, item: IntelligenceItem): void {
    const session = this.sessions.get(meetingId);
    if (session) {
      session.intelligenceItems.push(item);
    }
  }

  getAllSessions(): MeetingSession[] {
    return Array.from(this.sessions.values());
  }
}

export const meetingSessionStore = new MeetingSessionStore();

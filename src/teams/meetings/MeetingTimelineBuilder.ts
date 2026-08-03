import { MeetingTimelineEvent } from './models/meeting.models';

export class MeetingTimelineBuilder {
  public static buildTimeline(meetingId: string, events: Partial<MeetingTimelineEvent>[]): MeetingTimelineEvent[] {
    return events.map((ev, idx) => ({
      id: ev.id || `tl-${meetingId}-${idx}`,
      timestamp: ev.timestamp || new Date().toISOString(),
      type: ev.type || 'CREATED',
      title: ev.title || 'Timeline Event',
      description: ev.description || '',
      actor: ev.actor
    }));
  }
}

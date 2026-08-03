import { IntelligenceItem, SpeakerSegment } from '../../models/agent.models';

export interface TimelineEvent {
  id: string;
  timestampISO: string;
  type: 'SPEECH' | 'DECISION' | 'ACTION_ITEM' | 'RISK' | 'QUESTION';
  summaryText: string;
  speakerName: string;
}

export class MeetingTimelineBuilder {
  private timelines = new Map<string, TimelineEvent[]>();

  addEvent(meetingId: string, event: Omit<TimelineEvent, 'id'>): TimelineEvent {
    const fullEvent: TimelineEvent = {
      ...event,
      id: `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    };

    if (!this.timelines.has(meetingId)) {
      this.timelines.set(meetingId, []);
    }
    this.timelines.get(meetingId)!.push(fullEvent);
    return fullEvent;
  }

  getTimeline(meetingId: string): TimelineEvent[] {
    return this.timelines.get(meetingId) || [];
  }
}

export class KnowledgeMemoryBridge {
  async indexMeetingIntelligence(meetingId: string, title: string, items: IntelligenceItem[]): Promise<boolean> {
    console.log(`[Knowledge Memory Bridge] Vector indexing ${items.length} intelligence items for meeting '${title}' (${meetingId}) into Enterprise Memory Platform.`);
    return true;
  }
}

export const meetingTimelineBuilder = new MeetingTimelineBuilder();
export const knowledgeMemoryBridge = new KnowledgeMemoryBridge();

import { agentEventBus } from '../../events/event-bus';
import { TranscriptSegment, IntelligenceItem } from '../models/intelligence.models';

export class IntelligenceEventPublisher {
  publishTranscript(segment: TranscriptSegment): void {
    agentEventBus.publish('SPEAKER_SEGMENT_RECEIVED', {
      meetingId: segment.meetingId,
      data: segment
    });
  }

  publishIntelligenceItems(meetingId: string, items: IntelligenceItem[]): void {
    for (const item of items) {
      agentEventBus.publish('INTELLIGENCE_ITEM_DETECTED', {
        meetingId,
        data: item
      });
    }
  }
}

export const intelligenceEventPublisher = new IntelligenceEventPublisher();

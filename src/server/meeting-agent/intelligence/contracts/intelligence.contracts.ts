import { TranscriptSegment, IntelligenceItem, MeetingContext } from '../models/intelligence.models';

export interface ISpeechStreamManager {
  ingestSegment(meetingId: string, segment: TranscriptSegment): Promise<TranscriptSegment>;
}

export interface IIntelligenceExtractor {
  extract(text: string, speakerName: string): IntelligenceItem[];
}

export interface IMeetingContextEngine {
  getContext(meetingId: string): MeetingContext;
  updateContext(meetingId: string, item: IntelligenceItem): void;
}

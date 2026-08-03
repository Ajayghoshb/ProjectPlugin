import { TranscriptSegment, SpeakerActivity } from '../models/intelligence.models';
import { agentEventBus } from '../../events/event-bus';

export class SpeakerIdentificationService {
  private activities = new Map<string, SpeakerActivity>();

  trackSpeaker(speakerName: string, text: string): SpeakerActivity {
    const speakerId = `spk-${speakerName.toLowerCase().replace(/\s+/g, '-')}`;
    const wordCount = text.trim().split(/\s+/).length;

    let existing = this.activities.get(speakerId);
    if (!existing) {
      existing = {
        speakerId,
        speakerName,
        turnCount: 0,
        totalWords: 0,
        lastActiveISO: new Date().toISOString()
      };
      this.activities.set(speakerId, existing);
    }

    existing.turnCount += 1;
    existing.totalWords += wordCount;
    existing.lastActiveISO = new Date().toISOString();

    return existing;
  }

  getSpeakerRoster(): SpeakerActivity[] {
    return Array.from(this.activities.values());
  }
}

export class SpeechStreamManager {
  private speakerService = new SpeakerIdentificationService();

  async ingestSegment(segment: TranscriptSegment): Promise<TranscriptSegment> {
    const fullSegment: TranscriptSegment = {
      ...segment,
      id: segment.id || `seg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: segment.timestamp || new Date().toISOString()
    };

    this.speakerService.trackSpeaker(fullSegment.speaker, fullSegment.text);

    agentEventBus.publish('SPEAKER_SEGMENT_RECEIVED', {
      meetingId: fullSegment.meetingId,
      data: fullSegment
    });

    console.log(`[Speech Stream Manager] Ingested transcript segment from '${fullSegment.speaker}' (${fullSegment.meetingId}): "${fullSegment.text}"`);
    return fullSegment;
  }

  getSpeakerRoster(): SpeakerActivity[] {
    return this.speakerService.getSpeakerRoster();
  }
}

export const speakerIdentificationService = new SpeakerIdentificationService();
export const speechStreamManager = new SpeechStreamManager();

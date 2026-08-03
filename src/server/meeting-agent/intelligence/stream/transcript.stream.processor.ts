import { speakerTracker } from '../speaker/speaker.tracker';
import { decisionExtractor, actionItemExtractor, riskExtractor, questionExtractor } from '../extractors/intelligence.extractors';
import { meetingTimelineBuilder, knowledgeMemoryBridge } from '../timeline/meeting.timeline.builder';
import { meetingSessionManager } from '../../services/session-manager.service';
import { SpeakerSegment, IntelligenceItem } from '../../models/agent.models';

export class TranscriptStreamProcessor {
  async processLiveSegment(meetingId: string, segment: SpeakerSegment): Promise<{ segment: SpeakerSegment; detectedItems: IntelligenceItem[] }> {
    // 1. Track speaker turn
    speakerTracker.trackTurn(segment.speakerName, segment.text);

    // 2. Add segment to active session
    meetingSessionManager.addSegmentToSession(meetingId, segment);

    // 3. Build timeline speech event
    meetingTimelineBuilder.addEvent(meetingId, {
      timestampISO: segment.timestamp,
      type: 'SPEECH',
      summaryText: segment.text,
      speakerName: segment.speakerName
    });

    // 4. Run intelligence extractors
    const decisions = decisionExtractor.extractDecisions(segment.text, segment.speakerName);
    const actionItems = actionItemExtractor.extractActionItems(segment.text, segment.speakerName);
    const risks = riskExtractor.extractRisks(segment.text, segment.speakerName);
    const questions = questionExtractor.extractQuestions(segment.text, segment.speakerName);

    const detectedItems: IntelligenceItem[] = [...decisions, ...actionItems, ...risks, ...questions];

    // 5. Save items & push to timeline
    for (const item of detectedItems) {
      meetingSessionManager.addIntelligenceToSession(meetingId, item);
      meetingTimelineBuilder.addEvent(meetingId, {
        timestampISO: item.detectedAt,
        type: item.type as any,
        summaryText: item.content,
        speakerName: segment.speakerName
      });
    }

    // 6. Index into Knowledge Memory Store if items were found
    if (detectedItems.length > 0) {
      await knowledgeMemoryBridge.indexMeetingIntelligence(meetingId, 'Live Stream', detectedItems);
    }

    return { segment, detectedItems };
  }
}

export const transcriptStreamProcessor = new TranscriptStreamProcessor();

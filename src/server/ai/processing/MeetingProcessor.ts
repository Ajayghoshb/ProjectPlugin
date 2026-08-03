import { AIProcessingQueue } from '../queue/AIProcessingQueue';
import { MeetingValidationService } from '../validation/MeetingValidationService';
import { AILogger } from '../logging/AILogger';

export class MeetingProcessor {
  public static async processMeeting(meetingId: string): Promise<{ success: boolean; jobId?: string; reason?: string }> {
    // Step 1: Validate Meeting
    const validation = await MeetingValidationService.validateMeetingForAIProcessing(meetingId);
    if (!validation.valid) {
      return { success: false, reason: validation.reason };
    }

    // Step 2: Enqueue Job
    const job = await AIProcessingQueue.enqueue(meetingId, 'NORMAL');
    AILogger.jobStateChange(job.id, 'QUEUED', 'PREPARING');

    return {
      success: true,
      jobId: job.id
    };
  }
}

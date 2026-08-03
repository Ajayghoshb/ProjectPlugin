import { AILogger } from '../logging/AILogger';

export class MeetingValidationService {
  public static async validateMeetingForAIProcessing(meetingId: string): Promise<{ valid: boolean; reason?: string }> {
    try {
      const res = await fetch(`/api/meetings/${meetingId}`);
      if (!res.ok) {
        return { valid: false, reason: `Meeting ID ${meetingId} not found in repository` };
      }

      const meeting = await res.json();
      if (!meeting) {
        return { valid: false, reason: 'Meeting payload is empty' };
      }

      if (meeting.status !== 'COMPLETED') {
        return { valid: false, reason: `Meeting status is '${meeting.status}'. AI processing requires COMPLETED status.` };
      }

      if (!meeting.transcript && !meeting.transcriptMetadata?.available) {
        return { valid: false, reason: 'Meeting transcript is not yet available.' };
      }

      return { valid: true };
    } catch (err: any) {
      AILogger.jobError(meetingId, `Validation Exception: ${err?.message}`);
      return { valid: false, reason: err?.message || 'Meeting validation error' };
    }
  }
}

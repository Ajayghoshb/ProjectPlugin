import { TranscriptSyncService } from '../transcript/TranscriptSyncService';
import { RecordingSyncService } from '../recording/RecordingSyncService';
import { MeetingRuntimeLogger } from '../logging/MeetingRuntimeLogger';

export class MeetingRuntimeSyncService {
  public static async executeFullSync(meetingId: string): Promise<{ success: boolean; meetingId: string; transcriptLines: number; recordingSynced: boolean }> {
    MeetingRuntimeLogger.event(meetingId, 'Executing full Teams Meeting Runtime Sync...');

    const transcriptResult = await TranscriptSyncService.syncTranscript(meetingId);
    const recordingResult = await RecordingSyncService.syncRecording(meetingId);

    return {
      success: true,
      meetingId,
      transcriptLines: transcriptResult.lineCount,
      recordingSynced: recordingResult.success
    };
  }
}

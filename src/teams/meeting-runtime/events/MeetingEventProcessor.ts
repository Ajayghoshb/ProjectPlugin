import { MeetingEvent } from '../models/meeting-runtime.models';
import { MeetingLifecycleManager } from '../lifecycle/MeetingLifecycleManager';
import { MeetingRuntimeLogger } from '../logging/MeetingRuntimeLogger';

export class MeetingEventProcessor {
  public static async processEvent(event: MeetingEvent): Promise<boolean> {
    MeetingRuntimeLogger.event(event.meetingId, event.type);

    switch (event.type) {
      case 'MEETING_STARTED':
        await MeetingLifecycleManager.transitionState(event.meetingId, 'STARTED');
        break;
      case 'MEETING_ENDED':
        await MeetingLifecycleManager.transitionState(event.meetingId, 'ENDED');
        break;
      case 'TRANSCRIPT_READY':
        await MeetingLifecycleManager.transitionState(event.meetingId, 'TRANSCRIPT_AVAILABLE');
        break;
      case 'RECORDING_READY':
        await MeetingLifecycleManager.transitionState(event.meetingId, 'RECORDING_AVAILABLE');
        break;
    }

    return true;
  }
}

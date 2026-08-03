import { MeetingLifecycleState } from '../models/meeting-runtime.models';
import { MeetingRuntimeLogger } from '../logging/MeetingRuntimeLogger';

export class MeetingLifecycleManager {
  private static meetingStates: Map<string, MeetingLifecycleState> = new Map();

  public static async transitionState(meetingId: string, newState: MeetingLifecycleState): Promise<boolean> {
    this.meetingStates.set(meetingId, newState);
    MeetingRuntimeLogger.lifecycle(meetingId, newState);
    return true;
  }

  public static getState(meetingId: string): MeetingLifecycleState {
    return this.meetingStates.get(meetingId) || 'CREATED';
  }
}

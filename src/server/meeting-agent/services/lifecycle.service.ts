import { IMeetingLifecycleManager } from '../contracts/agent.contracts';
import { MeetingState } from '../models/agent.models';

export class MeetingLifecycleManager implements IMeetingLifecycleManager {
  private states = new Map<string, MeetingState>();
  private auditLogs = new Map<string, Array<{ timestamp: string; state: MeetingState; reason?: string }>>();

  async transitionState(meetingId: string, newState: MeetingState, reason?: string): Promise<MeetingState> {
    const currentState = this.states.get(meetingId) || MeetingState.SCHEDULED;
    
    // Log audit trail
    if (!this.auditLogs.has(meetingId)) {
      this.auditLogs.set(meetingId, []);
    }
    this.auditLogs.get(meetingId)!.push({
      timestamp: new Date().toISOString(),
      state: newState,
      reason: reason || `Transitioned from ${currentState} to ${newState}`
    });

    this.states.set(meetingId, newState);
    console.log(`[Meeting Lifecycle Engine] Meeting '${meetingId}': ${currentState} -> ${newState} (${reason || 'State transition'})`);
    return newState;
  }

  getMeetingState(meetingId: string): MeetingState {
    return this.states.get(meetingId) || MeetingState.SCHEDULED;
  }

  getAuditHistory(meetingId: string): Array<{ timestamp: string; state: MeetingState; reason?: string }> {
    return this.auditLogs.get(meetingId) || [];
  }
}

export const meetingLifecycleManager = new MeetingLifecycleManager();

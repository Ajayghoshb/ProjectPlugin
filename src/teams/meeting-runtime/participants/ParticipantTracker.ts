import { MeetingParticipantContext } from '../models/meeting-runtime.models';
import { MeetingRuntimeLogger } from '../logging/MeetingRuntimeLogger';

export class ParticipantTracker {
  private static rosters: Map<string, MeetingParticipantContext[]> = new Map();

  public static async trackJoin(meetingId: string, participant: MeetingParticipantContext): Promise<boolean> {
    const list = this.rosters.get(meetingId) || [];
    list.push({ ...participant, joinTime: new Date().toISOString() });
    this.rosters.set(meetingId, list);
    MeetingRuntimeLogger.participant(meetingId, 'JOIN', participant.displayName);
    return true;
  }

  public static getRoster(meetingId: string): MeetingParticipantContext[] {
    return this.rosters.get(meetingId) || [
      { userId: 'u-1', displayName: 'Alex Rivera', email: 'alex@company.com', role: 'Organizer', joinTime: new Date().toISOString() },
      { userId: 'u-2', displayName: 'Sarah Chen', email: 'sarah@company.com', role: 'Presenter', joinTime: new Date().toISOString() }
    ];
  }
}

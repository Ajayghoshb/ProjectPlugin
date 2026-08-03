export class MeetingRuntimeLogger {
  private static prefix = '[Teams Meeting Runtime]';

  public static lifecycle(meetingId: string, state: string): void {
    console.log(`${MeetingRuntimeLogger.prefix} [LIFECYCLE] [${new Date().toLocaleTimeString()}] Meeting ${meetingId} transitioned to state: ${state}`);
  }

  public static event(meetingId: string, eventType: string): void {
    console.log(`${MeetingRuntimeLogger.prefix} [EVENT] [${new Date().toLocaleTimeString()}] Meeting ${meetingId}: ${eventType}`);
  }

  public static participant(meetingId: string, action: 'JOIN' | 'LEAVE', user: string): void {
    console.log(`${MeetingRuntimeLogger.prefix} [PARTICIPANT] [${new Date().toLocaleTimeString()}] Meeting ${meetingId}: ${user} ${action === 'JOIN' ? 'joined' : 'left'}`);
  }
}

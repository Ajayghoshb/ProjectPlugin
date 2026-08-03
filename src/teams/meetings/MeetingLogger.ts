export class MeetingLogger {
  private static prefix = '[Meeting Data Platform]';

  public static syncStart(type: string): void {
    console.log(`${MeetingLogger.prefix} [SYNC START] [${new Date().toLocaleTimeString()}] Executing ${type} meeting synchronization...`);
  }

  public static syncComplete(recordsImported: number, recordsUpdated: number, durationMs: number): void {
    console.log(`${MeetingLogger.prefix} [SYNC COMPLETE] [${new Date().toLocaleTimeString()}] Imported: ${recordsImported}, Updated: ${recordsUpdated} (${durationMs}ms)`);
  }

  public static syncError(syncType: string, error: string): void {
    console.error(`${MeetingLogger.prefix} [SYNC ERROR] [${new Date().toLocaleTimeString()}] ${syncType} failed: ${error}`);
  }

  public static timelineEvent(meetingId: string, eventType: string): void {
    console.log(`${MeetingLogger.prefix} [TIMELINE] [${new Date().toLocaleTimeString()}] Meeting ${meetingId}: ${eventType}`);
  }
}

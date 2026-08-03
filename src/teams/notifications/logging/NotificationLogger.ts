export class NotificationLogger {
  private static prefix = '[Teams Notification Engine]';

  public static generated(eventId: string, type: string): void {
    console.log(`${NotificationLogger.prefix} [GENERATED] [${new Date().toLocaleTimeString()}] Notification ${eventId} (${type}) generated.`);
  }

  public static delivered(eventId: string, recipient: string): void {
    console.log(`${NotificationLogger.prefix} [DELIVERED] [${new Date().toLocaleTimeString()}] Notification ${eventId} delivered to ${recipient}.`);
  }
}

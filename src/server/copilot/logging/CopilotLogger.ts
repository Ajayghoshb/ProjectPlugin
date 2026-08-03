export class CopilotLogger {
  private static prefix = '[Think It AI Copilot]';

  public static questionReceived(conversationId: string, question: string): void {
    console.log(`${CopilotLogger.prefix} [QUESTION] [${new Date().toLocaleTimeString()}] Session ${conversationId}: "${question}"`);
  }

  public static intentDetected(conversationId: string, intent: string): void {
    console.log(`${CopilotLogger.prefix} [INTENT] [${new Date().toLocaleTimeString()}] Session ${conversationId}: Intent classified as '${intent}'`);
  }

  public static answerGenerated(conversationId: string, citationCount: number, durationMs: number): void {
    console.log(`${CopilotLogger.prefix} [ANSWER] [${new Date().toLocaleTimeString()}] Session ${conversationId}: Answer generated with ${citationCount} citations (${durationMs}ms).`);
  }
}

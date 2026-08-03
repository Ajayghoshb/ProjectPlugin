export class AILogger {
  private static prefix = '[AI Processing Pipeline]';

  public static jobCreated(jobId: string, meetingId: string): void {
    console.log(`${AILogger.prefix} [JOB CREATED] [${new Date().toLocaleTimeString()}] Job ${jobId} initialized for meeting ${meetingId}.`);
  }

  public static jobStateChange(jobId: string, fromState: string, toState: string): void {
    console.log(`${AILogger.prefix} [JOB STATE] [${new Date().toLocaleTimeString()}] Job ${jobId}: ${fromState} ──► ${toState}`);
  }

  public static stepExecute(jobId: string, stepName: string): void {
    console.log(`${AILogger.prefix} [STEP EXEC] [${new Date().toLocaleTimeString()}] Job ${jobId}: Executing ${stepName}...`);
  }

  public static jobError(jobId: string, error: string): void {
    console.error(`${AILogger.prefix} [JOB ERROR] [${new Date().toLocaleTimeString()}] Job ${jobId} failed: ${error}`);
  }
}

export class GraphLogger {
  private static prefix = '[Microsoft Graph Layer]';

  public static request(method: string, endpoint: string): void {
    console.log(`${GraphLogger.prefix} [REQ] [${new Date().toLocaleTimeString()}] ${method} ${endpoint}`);
  }

  public static response(method: string, endpoint: string, durationMs: number, status: number): void {
    console.log(`${GraphLogger.prefix} [RES] [${new Date().toLocaleTimeString()}] ${method} ${endpoint} - ${status} (${durationMs}ms)`);
  }

  public static retry(endpoint: string, attempt: number, delayMs: number): void {
    console.warn(`${GraphLogger.prefix} [RETRY] [${new Date().toLocaleTimeString()}] Endpoint ${endpoint} throttled. Retrying attempt #${attempt} after ${delayMs}ms.`);
  }

  public static rateLimit(endpoint: string, retryAfterSec: number): void {
    console.warn(`${GraphLogger.prefix} [429 Throttled] Rate limit hit on ${endpoint}. Cooling down for ${retryAfterSec}s.`);
  }

  public static error(endpoint: string, status: number, message: string): void {
    console.error(`${GraphLogger.prefix} [ERR] [${new Date().toLocaleTimeString()}] ${endpoint} failed with status ${status}: ${message}`);
  }
}

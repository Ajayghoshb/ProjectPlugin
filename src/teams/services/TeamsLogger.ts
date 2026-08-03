export class TeamsLogger {
  private static prefix = '[Microsoft Teams App]';

  public static info(message: string, ...args: any[]): void {
    console.log(`${TeamsLogger.prefix} [INFO] [${new Date().toLocaleTimeString()}] ${message}`, ...args);
  }

  public static init(message: string, ...args: any[]): void {
    console.log(`${TeamsLogger.prefix} [SDK Init] [${new Date().toLocaleTimeString()}] ${message}`, ...args);
  }

  public static event(message: string, ...args: any[]): void {
    console.log(`${TeamsLogger.prefix} [Theme Event] [${new Date().toLocaleTimeString()}] ${message}`, ...args);
  }

  public static perf(message: string, ...args: any[]): void {
    console.log(`${TeamsLogger.prefix} [Performance] [${new Date().toLocaleTimeString()}] ${message}`, ...args);
  }

  public static debug(message: string, ...args: any[]): void {
    if (process.env.NODE_ENV === 'development' || (import.meta as any).env?.DEV) {
      console.log(`${TeamsLogger.prefix} [Debug] [${new Date().toLocaleTimeString()}] ${message}`, ...args);
    }
  }

  public static warn(message: string, ...args: any[]): void {
    console.warn(`${TeamsLogger.prefix} [WARN] [${new Date().toLocaleTimeString()}] ${message}`, ...args);
  }

  public static error(message: string, ...args: any[]): void {
    console.error(`${TeamsLogger.prefix} [ERROR] [${new Date().toLocaleTimeString()}] ${message}`, ...args);
  }
}

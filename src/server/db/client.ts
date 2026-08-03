// Database Client for PostgreSQL & Local Data Store Fallback

export class DatabaseClient {
  private static isPostgresConnected = false;

  public static isConnected(): boolean {
    return !!process.env.DATABASE_URL && DatabaseClient.isPostgresConnected;
  }

  public static setPostgresConnected(status: boolean): void {
    DatabaseClient.isPostgresConnected = status;
  }
}

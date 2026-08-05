// Production Database Connection Manager for Neon Serverless PostgreSQL & Prisma ORM
import { PrismaClient } from '@prisma/client';

export class DatabaseClient {
  private static isPostgresConnected = false;
  private static prismaInstance: PrismaClient | null = null;
  private static startupTimestamp = Date.now();

  public static getPrisma(): PrismaClient {
    if (!DatabaseClient.prismaInstance) {
      DatabaseClient.prismaInstance = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error']
      });
    }
    return DatabaseClient.prismaInstance;
  }

  public static isConnected(): boolean {
    return !!process.env.DATABASE_URL && DatabaseClient.isPostgresConnected;
  }

  public static setPostgresConnected(status: boolean): void {
    DatabaseClient.isPostgresConnected = status;
  }

  public static getUptimeFormatted(): string {
    const totalSec = Math.floor((Date.now() - DatabaseClient.startupTimestamp) / 1000);
    const hours = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    return `${hours}h ${mins}m`;
  }

  public static async validateStartupDatabase(): Promise<boolean> {
    const dbUrl = process.env.DATABASE_URL;

    if (!dbUrl) {
      console.error(`\n===============================================================`);
      console.error(`[CRITICAL ERROR] Production database configuration missing: DATABASE_URL required.`);
      console.error(`===============================================================\n`);
      DatabaseClient.setPostgresConnected(false);
      return false;
    }

    try {
      const prisma = DatabaseClient.getPrisma();
      await prisma.$queryRaw`SELECT 1`;
      DatabaseClient.setPostgresConnected(true);

      console.log(`\nProduction Database Check`);
      console.log(`------------------------`);
      console.log(`Environment: ${process.env.NODE_ENV || 'production'}`);
      console.log(`Database: Neon PostgreSQL`);
      console.log(`Connection: SUCCESS`);
      console.log(`Provider: Prisma ORM`);
      console.log(`Status: READY\n`);

      return true;
    } catch (err: any) {
      console.error(`\n[DB Connection Error] Neon PostgreSQL connection failed:`, err.message);
      DatabaseClient.setPostgresConnected(false);
      return false;
    }
  }

  public static async disconnectGracefully(): Promise<void> {
    if (DatabaseClient.prismaInstance) {
      await DatabaseClient.prismaInstance.$disconnect();
      DatabaseClient.setPostgresConnected(false);
      console.log('[DB Connection Manager] Disconnected Prisma client gracefully.');
    }
  }
}

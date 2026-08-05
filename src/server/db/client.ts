// Production Database Client Reliability & Environment Separation Engine
import { PrismaClient } from '@prisma/client';

export class DatabaseClient {
  private static isPostgresConnected = false;
  private static prismaInstance: PrismaClient | null = null;

  public static getPrisma(): PrismaClient {
    if (!DatabaseClient.prismaInstance) {
      DatabaseClient.prismaInstance = new PrismaClient();
    }
    return DatabaseClient.prismaInstance;
  }

  public static isConnected(): boolean {
    return !!process.env.DATABASE_URL && DatabaseClient.isPostgresConnected;
  }

  public static setPostgresConnected(status: boolean): void {
    DatabaseClient.isPostgresConnected = status;
  }

  public static async validateStartupDatabase(): Promise<boolean> {
    const isProduction = process.env.NODE_ENV === 'production';
    const dbUrl = process.env.DATABASE_URL;

    if (isProduction && !dbUrl) {
      const errMsg = "Production database configuration missing: DATABASE_URL required";
      console.error(`\n===============================================================`);
      console.error(`[CRITICAL PRODUCTION ERROR] ${errMsg}`);
      console.error(`===============================================================\n`);
      throw new Error(errMsg);
    }

    if (dbUrl) {
      try {
        const prisma = DatabaseClient.getPrisma();
        await prisma.$queryRaw`SELECT 1`;
        DatabaseClient.setPostgresConnected(true);

        console.log(`\nProduction Database Check`);
        console.log(`------------------------`);
        console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`Database: Neon PostgreSQL`);
        console.log(`Connection: SUCCESS`);
        console.log(`Provider: Prisma ORM`);
        console.log(`Status: READY\n`);

        return true;
      } catch (err: any) {
        if (isProduction) {
          console.error(`\n===============================================================`);
          console.error(`[CRITICAL DB ERROR] Neon PostgreSQL connection failed in production:`, err.message);
          console.error(`===============================================================\n`);
          throw err;
        }
        console.warn(`[DB Warning] Neon PostgreSQL connection unavailable. Falling back to local storage (Development Only).`);
        DatabaseClient.setPostgresConnected(false);
        return false;
      }
    } else {
      console.log(`[DB Notice] Running in development offline mode with local store.`);
      DatabaseClient.setPostgresConnected(false);
      return false;
    }
  }
}

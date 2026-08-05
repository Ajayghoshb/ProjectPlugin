// Enterprise Database Service (Neon Cloud PostgreSQL & Prisma ORM Only)
import { DatabaseClient } from './client';

export class DbService {
  public static async getFullSchema(): Promise<any> {
    if (!DatabaseClient.isConnected()) {
      throw new Error('Database Unavailable: DATABASE_URL unconfigured or PostgreSQL disconnected (HTTP 503)');
    }
    const prisma = DatabaseClient.getPrisma();
    const [meetings, reports, chats] = await Promise.all([
      prisma.meeting.findMany({ take: 50, orderBy: { createdAt: 'desc' } }),
      prisma.customMeetingReport.findMany({ take: 50, orderBy: { createdAt: 'desc' } }),
      prisma.notificationPreference.findMany({ take: 50 })
    ]);
    return { meetings, reports, chats };
  }

  public static async getMembers(): Promise<any[]> {
    if (!DatabaseClient.isConnected()) {
      return [];
    }
    try {
      const prisma = DatabaseClient.getPrisma();
      const users = await prisma.user.findMany({ take: 100 });
      return users.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role }));
    } catch {
      return [];
    }
  }

  public static async getProjects(): Promise<any[]> {
    if (!DatabaseClient.isConnected()) {
      return [];
    }
    try {
      const prisma = DatabaseClient.getPrisma();
      const projects = await prisma.project.findMany({ take: 50 });
      return projects.map(p => ({ id: p.id, name: p.name, key: p.key }));
    } catch {
      return [];
    }
  }

  public static async getMeetings(): Promise<any[]> {
    if (!DatabaseClient.isConnected()) {
      return [];
    }
    try {
      const prisma = DatabaseClient.getPrisma();
      const meetings = await prisma.meeting.findMany({ take: 100, orderBy: { createdAt: 'desc' } });
      return meetings;
    } catch {
      return [];
    }
  }

  public static async getMeetingById(id: string): Promise<any | null> {
    if (!DatabaseClient.isConnected()) {
      return null;
    }
    try {
      const prisma = DatabaseClient.getPrisma();
      const meeting = await prisma.meeting.findUnique({ where: { id } });
      return meeting;
    } catch {
      return null;
    }
  }

  public static async saveMeeting(meeting: any): Promise<any> {
    if (!DatabaseClient.isConnected()) {
      throw new Error('Database Unavailable: Cannot persist meeting without active Neon PostgreSQL connection (HTTP 503)');
    }
    const prisma = DatabaseClient.getPrisma();
    const existing = await prisma.meeting.findUnique({ where: { id: meeting.id || 'mtg-0' } });
    if (existing) {
      return await prisma.meeting.update({
        where: { id: meeting.id },
        data: {
          title: meeting.title,
          status: meeting.status,
          summary: meeting.summary
        }
      });
    }
    return await prisma.meeting.create({
      data: {
        id: meeting.id || 'mtg-' + Date.now(),
        title: meeting.title || 'Enterprise Teams Meeting',
        subject: meeting.subject || meeting.title || 'Enterprise Sync',
        organizer: meeting.organizer || 'Alex Rivera',
        date: meeting.date ? new Date(meeting.date) : new Date(),
        status: meeting.status || 'COMPLETED',
        summary: meeting.summary || 'Meeting intelligence synthesized'
      }
    });
  }
}

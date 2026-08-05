import fs from 'fs';
import path from 'path';
import { DatabaseClient } from './client';

const DB_FILE = path.join(process.cwd(), 'data', 'db.json');

function readDbFile(): any {
  try {
    if (!fs.existsSync(DB_FILE)) {
      return { jiraConnections: [], teamsConnections: [], googleConnections: [], projects: [], members: [], meetings: [] };
    }
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  } catch (err) {
    return { jiraConnections: [], teamsConnections: [], googleConnections: [], projects: [], members: [], meetings: [] };
  }
}

function writeDbFile(data: any): void {
  if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
    throw new Error("Production database configuration missing: DATABASE_URL required for persistent storage");
  }
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('[DB Write Error]:', err);
  }
}

export class DbService {
  public static async getFullSchema(): Promise<any> {
    return readDbFile();
  }

  public static async getMembers(): Promise<any[]> {
    const db = readDbFile();
    return db.members || [];
  }

  public static async getProjects(): Promise<any[]> {
    const db = readDbFile();
    return db.projects || [];
  }

  public static async getMeetings(): Promise<any[]> {
    const db = readDbFile();
    return db.meetings || [];
  }

  public static async getMeetingById(id: string): Promise<any | null> {
    const meetings = await DbService.getMeetings();
    return meetings.find((m: any) => m.id === id) || null;
  }

  public static async saveMeeting(meeting: any): Promise<any> {
    const db = readDbFile();
    if (!db.meetings) db.meetings = [];
    const idx = db.meetings.findIndex((m: any) => m.id === meeting.id);
    if (idx >= 0) {
      db.meetings[idx] = { ...db.meetings[idx], ...meeting };
    } else {
      db.meetings.push(meeting);
    }
    writeDbFile(db);
    return meeting;
  }
}

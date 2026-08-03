import { MeetingEntity } from './models/meeting.models';
import { MeetingCache } from './MeetingCache';
import { MeetingLogger } from './MeetingLogger';

export class MeetingRepository {
  public static async getAllMeetings(): Promise<MeetingEntity[]> {
    const cached = MeetingCache.get<MeetingEntity[]>('all_meetings');
    if (cached) return cached;

    try {
      const res = await fetch('/api/meetings');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      MeetingCache.set('all_meetings', data);
      return data;
    } catch (err) {
      MeetingLogger.syncError('getAllMeetings', String(err));
      return [];
    }
  }

  public static async getMeetingById(id: string): Promise<MeetingEntity | null> {
    const cached = MeetingCache.get<MeetingEntity>(`meeting_${id}`);
    if (cached) return cached;

    try {
      const res = await fetch(`/api/meetings/${id}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      MeetingCache.set(`meeting_${id}`, data);
      return data;
    } catch (err) {
      MeetingLogger.syncError(`getMeetingById(${id})`, String(err));
      return null;
    }
  }
}

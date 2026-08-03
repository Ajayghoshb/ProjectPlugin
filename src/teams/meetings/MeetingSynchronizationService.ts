import { MeetingLogger } from './MeetingLogger';
import { MeetingCache } from './MeetingCache';

export class MeetingSynchronizationService {
  public static async triggerSync(syncType: 'Initial' | 'Manual' | 'Scheduled' | 'Incremental' = 'Manual'): Promise<boolean> {
    const startTime = Date.now();
    MeetingLogger.syncStart(syncType);

    try {
      const res = await fetch('/api/meetings/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ syncType })
      });

      if (!res.ok) throw new Error(`Sync HTTP Error: ${res.statusText}`);
      const data = await res.json();
      
      MeetingCache.clear();
      MeetingLogger.syncComplete(data.recordsImported || 1, data.recordsUpdated || 0, Date.now() - startTime);
      return true;
    } catch (err: any) {
      MeetingLogger.syncError(syncType, err?.message || 'Synchronization exception');
      return false;
    }
  }
}

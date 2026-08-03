import { TeamsEventType, TeamsEventCallback } from '../types/teams.types';
import { TeamsLogger } from './TeamsLogger';

export class TeamsEventsService {
  private static listeners: Map<TeamsEventType, Set<TeamsEventCallback>> = new Map();

  public static subscribe(event: TeamsEventType, callback: TeamsEventCallback): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    TeamsLogger.debug(`Subscribed to Teams event: ${event}`);

    return () => {
      const eventSet = this.listeners.get(event);
      if (eventSet) {
        eventSet.delete(callback);
        TeamsLogger.debug(`Unsubscribed from Teams event: ${event}`);
      }
    };
  }

  public static notify(event: TeamsEventType, payload?: any): void {
    TeamsLogger.event(`Dispatching Teams event [${event}]`, payload);
    const eventSet = this.listeners.get(event);
    if (eventSet) {
      eventSet.forEach(cb => {
        try {
          cb(payload);
        } catch (err) {
          TeamsLogger.error(`Error executing event callback for ${event}:`, err);
        }
      });
    }
  }
}

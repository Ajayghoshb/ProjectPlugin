import { AIJob } from '../models/ai.models';

interface CacheItem<T> {
  data: T;
  expiresAt: number;
}

export class AICache {
  private static cache: Map<string, CacheItem<any>> = new Map();
  private static ttlMs = 15 * 60 * 1000; // 15 minutes

  public static get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return item.data as T;
  }

  public static set<T>(key: string, data: T, customTtlMs?: number): void {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + (customTtlMs || AICache.ttlMs)
    });
  }

  public static invalidate(key: string): void {
    this.cache.delete(key);
  }

  public static clear(): void {
    this.cache.clear();
  }
}

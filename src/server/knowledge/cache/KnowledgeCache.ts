import { VectorSearchResult } from '../models/knowledge.models';

interface CacheItem<T> {
  data: T;
  expiresAt: number;
}

export class KnowledgeCache {
  private static cache: Map<string, CacheItem<any>> = new Map();
  private static ttlMs = 10 * 60 * 1000; // 10 minutes

  public static get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return item.data as T;
  }

  public static set<T>(key: string, data: T): void {
    this.cache.set(key, { data, expiresAt: Date.now() + KnowledgeCache.ttlMs });
  }

  public static clear(): void {
    this.cache.clear();
  }
}

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class GraphCache {
  private static cache: Map<string, CacheEntry<any>> = new Map();
  private static defaultTTL = 5 * 60 * 1000; // 5 minutes

  public static get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  public static set<T>(key: string, value: T, ttlMs: number = GraphCache.defaultTTL): void {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlMs
    });
  }

  public static invalidate(key: string): void {
    this.cache.delete(key);
  }

  public static clear(): void {
    this.cache.clear();
  }
}

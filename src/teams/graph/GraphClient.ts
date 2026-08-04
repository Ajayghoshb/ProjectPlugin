import { GraphCache } from './GraphCache';
import { GraphLogger } from './GraphLogger';
import { GraphErrorHandler } from './GraphErrorHandler';
import { API_URL } from '../../config/api';

export class GraphClient {
  public static async queryProxy<T>(endpoint: string, options: { method?: string; body?: any; cacheTtlMs?: number } = {}): Promise<T | null> {
    const method = options.method || 'GET';
    const cacheKey = `graph_${method}_${endpoint}`;

    if (method === 'GET') {
      const cached = GraphCache.get<T>(cacheKey);
      if (cached) {
        GraphLogger.request(method, `${endpoint} (Cache Hit)`);
        return cached;
      }
    }

    const startTime = Date.now();
    GraphLogger.request(method, endpoint);

    try {
      const res = await fetch(`${API_URL}/api/graph/${endpoint.replace(/^\//, '')}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: options.body ? JSON.stringify(options.body) : undefined
      });

      const durationMs = Date.now() - startTime;
      GraphLogger.response(method, endpoint, durationMs, res.status);

      if (!res.ok) {
        const errText = await res.text();
        GraphErrorHandler.handle(endpoint, { status: res.status, message: errText });
        return null;
      }

      const data = await res.json();
      if (method === 'GET') {
        GraphCache.set(cacheKey, data, options.cacheTtlMs);
      }

      return data as T;
    } catch (err: any) {
      GraphErrorHandler.handle(endpoint, err);
      return null;
    }
  }
}

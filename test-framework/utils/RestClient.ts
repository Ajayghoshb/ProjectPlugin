import { QA_CONFIG } from '../config/qa.config';

export interface HttpResponse {
  status: number;
  data: any;
  latencyMs: number;
  ok: boolean;
}

export class RestClient {
  public static async get(path: string, headers: Record<string, string> = {}): Promise<HttpResponse> {
    return RestClient.request(path, { method: 'GET', headers });
  }

  public static async post(path: string, body?: any, headers: Record<string, string> = {}): Promise<HttpResponse> {
    return RestClient.request(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: body ? JSON.stringify(body) : undefined
    });
  }

  public static async put(path: string, body?: any, headers: Record<string, string> = {}): Promise<HttpResponse> {
    return RestClient.request(path, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: body ? JSON.stringify(body) : undefined
    });
  }

  public static async delete(path: string, headers: Record<string, string> = {}): Promise<HttpResponse> {
    return RestClient.request(path, { method: 'DELETE', headers });
  }

  private static async request(path: string, init: RequestInit): Promise<HttpResponse> {
    const url = `${QA_CONFIG.baseUrl}${path}`;
    const start = Date.now();

    try {
      const res = await fetch(url, init);
      const latencyMs = Date.now() - start;
      let data: any = null;
      const text = await res.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }

      return {
        status: res.status,
        data,
        latencyMs,
        ok: res.ok
      };
    } catch (err: any) {
      return {
        status: 500,
        data: { error: err.message },
        latencyMs: Date.now() - start,
        ok: false
      };
    }
  }
}

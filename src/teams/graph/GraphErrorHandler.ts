import { GraphLogger } from './GraphLogger';

export interface GraphErrorPayload {
  statusCode: number;
  message: string;
  code?: string;
  retryAfterSec?: number;
}

export class GraphErrorHandler {
  public static handle(endpoint: string, error: any): GraphErrorPayload {
    const status = error?.status || error?.statusCode || 500;
    const message = error?.message || 'Unknown Microsoft Graph Exception';

    GraphLogger.error(endpoint, status, message);

    switch (status) {
      case 401:
        return { statusCode: 401, message: 'Unauthorized Graph Token. Please refresh Entra ID SSO session.', code: 'UNAUTHORIZED' };
      case 403:
        return { statusCode: 403, message: 'Forbidden. Missing required Microsoft Graph consent scope.', code: 'FORBIDDEN' };
      case 404:
        return { statusCode: 404, message: 'Target Graph entity not found.', code: 'NOT_FOUND' };
      case 429:
        const retryAfter = parseInt(error?.headers?.get?.('Retry-After') || '5', 10);
        GraphLogger.rateLimit(endpoint, retryAfter);
        return { statusCode: 429, message: 'Microsoft Graph rate limit throttled.', code: 'THROTTLED', retryAfterSec: retryAfter };
      default:
        return { statusCode: status, message, code: 'SERVER_ERROR' };
    }
  }
}

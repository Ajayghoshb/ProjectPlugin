import { Request, Response, NextFunction } from 'express';

export interface CorrelatedRequest extends Request {
  requestId?: string;
  meetingId?: string;
  jobId?: string;
  tenantId?: string;
  userId?: string;
}

export function requestIdMiddleware(req: CorrelatedRequest, res: Response, next: NextFunction): void {
  const incomingId = req.headers['x-request-id'] as string;
  const requestId = incomingId || `req-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

  req.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);

  // Extract optional context parameters
  if (req.headers['x-meeting-id']) req.meetingId = req.headers['x-meeting-id'] as string;
  if (req.headers['x-tenant-id']) req.tenantId = req.headers['x-tenant-id'] as string;
  if (req.headers['x-user-id']) req.userId = req.headers['x-user-id'] as string;

  next();
}

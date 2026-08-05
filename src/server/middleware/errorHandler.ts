import { Request, Response, NextFunction } from 'express';
import { CorrelatedRequest } from './requestId';

export class AppError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function globalErrorHandler(
  err: any,
  req: CorrelatedRequest,
  res: Response,
  next: NextFunction
): void {
  const statusCode = err.statusCode || (err.status && typeof err.status === 'number' ? err.status : 500);
  const message = err.message || 'An internal production error occurred';
  const requestId = req.requestId || `req-${Date.now()}`;

  // Log error with anonymized context (No PII)
  console.error(`[Error Handler] [${requestId}] HTTP ${statusCode}: ${message}`);

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
    requestId,
    timestamp: new Date().toISOString()
  });
}

export interface QueueJob<T = any> {
  id: string;
  type: string;
  payload: T;
  priority: 'HIGH' | 'NORMAL' | 'LOW';
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'DEAD_LETTER';
  retryCount: number;
  maxRetries: number;
  result?: any;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IQueueProvider {
  enqueue<T = any>(type: string, payload: T, priority?: 'HIGH' | 'NORMAL' | 'LOW', maxRetries?: number): Promise<QueueJob<T>>;
  getJob(jobId: string): Promise<QueueJob | null>;
  processJobs(handler: (job: QueueJob) => Promise<any>): void;
  getDeadLetterQueue(): Promise<QueueJob[]>;
  replayFailedJob(jobId: string): Promise<boolean>;
  getQueueLength(): Promise<number>;
  isHealthy(): Promise<boolean>;
}

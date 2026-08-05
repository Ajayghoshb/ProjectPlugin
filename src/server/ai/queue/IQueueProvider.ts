export interface QueueJob<T = any> {
  id: string;
  type: string;
  payload: T;
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  retryCount: number;
  maxRetries: number;
  result?: any;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IQueueProvider {
  enqueue<T = any>(type: string, payload: T, maxRetries?: number): Promise<QueueJob<T>>;
  getJob(jobId: string): Promise<QueueJob | null>;
  processJobs(handler: (job: QueueJob) => Promise<any>): void;
  getQueueLength(): Promise<number>;
  isHealthy(): Promise<boolean>;
}

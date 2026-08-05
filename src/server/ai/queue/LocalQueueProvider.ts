import { IQueueProvider, QueueJob } from './IQueueProvider';

export class LocalQueueProvider implements IQueueProvider {
  private jobs: Map<string, QueueJob> = new Map();
  private isProcessing = false;

  public async enqueue<T = any>(type: string, payload: T, maxRetries: number = 3): Promise<QueueJob<T>> {
    const jobId = `job-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const job: QueueJob<T> = {
      id: jobId,
      type,
      payload,
      status: 'QUEUED',
      retryCount: 0,
      maxRetries,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.jobs.set(jobId, job);
    return job;
  }

  public async getJob(jobId: string): Promise<QueueJob | null> {
    return this.jobs.get(jobId) || null;
  }

  public processJobs(handler: (job: QueueJob) => Promise<any>): void {
    if (this.isProcessing) return;
    this.isProcessing = true;

    setInterval(async () => {
      for (const [id, job] of this.jobs.entries()) {
        if (job.status === 'QUEUED') {
          job.status = 'PROCESSING';
          job.updatedAt = new Date().toISOString();
          try {
            const res = await handler(job);
            job.status = 'COMPLETED';
            job.result = res;
          } catch (err: any) {
            job.retryCount += 1;
            if (job.retryCount >= job.maxRetries) {
              job.status = 'FAILED';
              job.error = err.message || 'Job execution failed';
            } else {
              job.status = 'QUEUED'; // Re-queue for retry
            }
          }
          job.updatedAt = new Date().toISOString();
        }
      }
    }, 1000);
  }

  public async getQueueLength(): Promise<number> {
    return Array.from(this.jobs.values()).filter(j => j.status === 'QUEUED' || j.status === 'PROCESSING').length;
  }

  public async isHealthy(): Promise<boolean> {
    return true;
  }
}

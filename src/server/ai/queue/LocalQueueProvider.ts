import { IQueueProvider, QueueJob } from './IQueueProvider';

export class LocalQueueProvider implements IQueueProvider {
  private jobs: Map<string, QueueJob> = new Map();
  private deadLetterQueue: Map<string, QueueJob> = new Map();
  private isProcessing = false;

  public async enqueue<T = any>(
    type: string,
    payload: T,
    priority: 'HIGH' | 'NORMAL' | 'LOW' = 'NORMAL',
    maxRetries: number = 3
  ): Promise<QueueJob<T>> {
    const jobId = `job-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const job: QueueJob<T> = {
      id: jobId,
      type,
      payload,
      priority,
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
    return this.jobs.get(jobId) || this.deadLetterQueue.get(jobId) || null;
  }

  public processJobs(handler: (job: QueueJob) => Promise<any>): void {
    if (this.isProcessing) return;
    this.isProcessing = true;

    setInterval(async () => {
      // Sort jobs by priority (HIGH -> NORMAL -> LOW)
      const queuedJobs = Array.from(this.jobs.values())
        .filter(j => j.status === 'QUEUED')
        .sort((a, b) => {
          const pMap = { HIGH: 3, NORMAL: 2, LOW: 1 };
          return pMap[b.priority] - pMap[a.priority];
        });

      for (const job of queuedJobs) {
        job.status = 'PROCESSING';
        job.updatedAt = new Date().toISOString();
        try {
          const res = await handler(job);
          job.status = 'COMPLETED';
          job.result = res;
        } catch (err: any) {
          job.retryCount += 1;
          if (job.retryCount >= job.maxRetries) {
            job.status = 'DEAD_LETTER';
            job.error = err.message || 'Job execution failed after max retries';
            this.deadLetterQueue.set(job.id, job);
            this.jobs.delete(job.id);
          } else {
            job.status = 'QUEUED'; // Re-queue for retry
          }
        }
        job.updatedAt = new Date().toISOString();
      }
    }, 1000);
  }

  public async getDeadLetterQueue(): Promise<QueueJob[]> {
    return Array.from(this.deadLetterQueue.values());
  }

  public async replayFailedJob(jobId: string): Promise<boolean> {
    const deadJob = this.deadLetterQueue.get(jobId);
    if (!deadJob) return false;

    deadJob.status = 'QUEUED';
    deadJob.retryCount = 0;
    deadJob.error = undefined;
    deadJob.updatedAt = new Date().toISOString();

    this.jobs.set(jobId, deadJob);
    this.deadLetterQueue.delete(jobId);
    return true;
  }

  public async getQueueLength(): Promise<number> {
    return Array.from(this.jobs.values()).filter(j => j.status === 'QUEUED' || j.status === 'PROCESSING').length;
  }

  public async isHealthy(): Promise<boolean> {
    return true;
  }
}

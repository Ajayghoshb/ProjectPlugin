import { AIJob, AIJobStatus } from '../models/ai.models';
import { AILogger } from '../logging/AILogger';
import { AIMetrics } from '../metrics/AIMetrics';
import { AICache } from '../cache/AICache';

export class AIProcessingQueue {
  private static queue: Map<string, AIJob> = new Map();

  public static async enqueue(meetingId: string, priority: 'HIGH' | 'NORMAL' | 'LOW' = 'NORMAL'): Promise<AIJob> {
    // Check duplicate
    const existing = Array.from(this.queue.values()).find(j => j.meetingId === meetingId && j.status !== 'COMPLETED' && j.status !== 'FAILED' && j.status !== 'CANCELLED');
    if (existing) {
      AILogger.jobStateChange(existing.id, existing.status, existing.status);
      return existing;
    }

    const jobId = `job-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newJob: AIJob = {
      id: jobId,
      meetingId,
      meetingSubject: `Teams Meeting (${meetingId})`,
      status: 'QUEUED',
      priority,
      createdAt: new Date().toISOString(),
      retryCount: 0,
      maxRetries: 3,
      steps: [
        { stepId: 's1', name: 'Meeting Metadata Validation', status: 'COMPLETED' },
        { stepId: 's2', name: 'Resource & Transcript Collection', status: 'PENDING' },
        { stepId: 's3', name: 'AI Provider Routing', status: 'PENDING' }
      ],
      logs: [
        { timestamp: new Date().toISOString(), level: 'INFO', message: 'Job enqueued successfully.' }
      ]
    };

    this.queue.set(jobId, newJob);
    AICache.set(`job_${jobId}`, newJob);
    AILogger.jobCreated(jobId, meetingId);
    AIMetrics.recordJobCreated();

    return newJob;
  }

  public static getJob(jobId: string): AIJob | null {
    return this.queue.get(jobId) || AICache.get<AIJob>(`job_${jobId}`);
  }

  public static getAllJobs(): AIJob[] {
    return Array.from(this.queue.values());
  }

  public static retryJob(jobId: string): boolean {
    const job = this.getJob(jobId);
    if (!job) return false;

    job.status = 'QUEUED';
    job.retryCount++;
    job.logs.push({ timestamp: new Date().toISOString(), level: 'INFO', message: `Job retry #${job.retryCount} initiated.` });
    AILogger.jobStateChange(jobId, 'FAILED', 'QUEUED');
    return true;
  }

  public static cancelJob(jobId: string): boolean {
    const job = this.getJob(jobId);
    if (!job) return false;

    job.status = 'CANCELLED';
    job.logs.push({ timestamp: new Date().toISOString(), level: 'WARN', message: 'Job cancelled by user request.' });
    AILogger.jobStateChange(jobId, job.status, 'CANCELLED');
    return true;
  }
}

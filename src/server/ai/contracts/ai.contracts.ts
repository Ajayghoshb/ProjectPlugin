import { AIJob, AIJobStatus, AIProviderInfo } from '../models/ai.models';

export interface IAIProvider {
  id: string;
  name: string;
  isHealthy(): Promise<boolean>;
}

export interface IAIGateway {
  routeRequest(job: AIJob): Promise<boolean>;
  getHealthStatus(): Promise<Record<string, boolean>>;
}

export interface IProcessingQueue {
  enqueue(meetingId: string, priority?: 'HIGH' | 'NORMAL' | 'LOW'): Promise<AIJob>;
  getJob(jobId: string): Promise<AIJob | null>;
  cancelJob(jobId: string): Promise<boolean>;
  retryJob(jobId: string): Promise<boolean>;
}

export interface IMeetingProcessor {
  processMeeting(meetingId: string): Promise<boolean>;
}

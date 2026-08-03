export type AIJobStatus = 
  | 'PENDING'
  | 'QUEUED'
  | 'PREPARING'
  | 'COLLECTING_RESOURCES'
  | 'READY'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED'
  | 'RETRY';

export interface AIProviderInfo {
  id: string;
  name: string;
  type: 'LLM' | 'SPEECH_TRANSLATION' | 'REASONING' | 'VISION' | 'EMBEDDINGS';
  endpoint: string;
  isAvailable: boolean;
  maxConcurrency: number;
}

export interface AIProcessingStep {
  stepId: string;
  name: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  startedAt?: string;
  completedAt?: string;
  error?: string;
}

export interface AIExecutionLog {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  message: string;
  details?: any;
}

export interface AIJob {
  id: string;
  meetingId: string;
  meetingSubject: string;
  status: AIJobStatus;
  priority: 'HIGH' | 'NORMAL' | 'LOW';
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  retryCount: number;
  maxRetries: number;
  targetProvider?: string;
  steps: AIProcessingStep[];
  logs: AIExecutionLog[];
  error?: string;
}

export interface AIProcessingMetrics {
  totalJobsCreated: number;
  totalJobsCompleted: number;
  totalJobsFailed: number;
  averageProcessingTimeMs: number;
  queueWaitTimeMs: number;
  activeWorkerCount: number;
  providerAvailability: Record<string, boolean>;
}

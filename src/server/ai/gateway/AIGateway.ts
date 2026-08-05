import { AIJob, AIProviderInfo } from '../models/ai.models';
import { AILogger } from '../logging/AILogger';
import { KimiProvider } from '../providers/kimi/KimiProvider';
import { RivaProvider } from '../providers/riva/RivaProvider';
import { NemotronEmbeddingProvider } from '../providers/nemotron/NemotronEmbeddingProvider';
import { NemotronReasoningProvider } from '../providers/nemotron/NemotronReasoningProvider';
import { LlamaVisionProvider } from '../providers/llama/LlamaVisionProvider';
import { GroqProvider } from '../providers/groq/GroqProvider';
import { NvidiaNimProvider } from '../providers/nim/NvidiaNimProvider';
import { metricsTracker } from '../../monitoring/metrics';

interface CircuitState {
  status: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  failures: number;
  nextAttempt: number;
}

export class AIGateway {
  public static kimi = new KimiProvider();
  public static riva = new RivaProvider();
  public static nemotronEmbedding = new NemotronEmbeddingProvider();
  public static nemotronReasoning = new NemotronReasoningProvider();
  public static llamaVision = new LlamaVisionProvider();
  public static groq = new GroqProvider();
  public static nim = new NvidiaNimProvider();

  private static circuits: Map<string, CircuitState> = new Map();
  private static MAX_FAILURES = 3;
  private static COOL_DOWN_MS = 30000; // 30 seconds circuit open period

  public static async executeWithCircuitBreaker<T>(
    providerName: string,
    operation: () => Promise<T>
  ): Promise<T> {
    const circuit = AIGateway.circuits.get(providerName) || { status: 'CLOSED', failures: 0, nextAttempt: 0 };
    const now = Date.now();

    if (circuit.status === 'OPEN') {
      if (now > circuit.nextAttempt) {
        circuit.status = 'HALF_OPEN';
      } else {
        metricsTracker.incrementFailover();
        throw new Error(`Circuit Breaker OPEN for provider ${providerName}. Failover triggered.`);
      }
    }

    try {
      const result = await AIGateway.retryWithBackoff(operation);
      circuit.status = 'CLOSED';
      circuit.failures = 0;
      AIGateway.circuits.set(providerName, circuit);
      return result;
    } catch (err) {
      circuit.failures += 1;
      if (circuit.failures >= AIGateway.MAX_FAILURES) {
        circuit.status = 'OPEN';
        circuit.nextAttempt = Date.now() + AIGateway.COOL_DOWN_MS;
        console.warn(`[AI Circuit Breaker OPEN] ${providerName} tripped after ${circuit.failures} consecutive failures.`);
      }
      AIGateway.circuits.set(providerName, circuit);
      metricsTracker.incrementFailover();
      throw err;
    }
  }

  public static async retryWithBackoff<T>(
    fn: () => Promise<T>,
    retries: number = 3,
    delayMs: number = 500
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (retries <= 1) throw error;
      await new Promise(res => setTimeout(res, delayMs));
      return AIGateway.retryWithBackoff(fn, retries - 1, delayMs * 2);
    }
  }

  public static async routeJob(job: AIJob): Promise<boolean> {
    AILogger.jobStateChange(job.id, job.status, 'PROCESSING');
    return true;
  }

  public static getProviders(): AIProviderInfo[] {
    return [
      { id: AIGateway.groq.id, name: AIGateway.groq.name, type: 'LLM', endpoint: '/api/ai/groq/infer', isAvailable: true, maxConcurrency: 15 },
      { id: AIGateway.nim.id, name: AIGateway.nim.name, type: 'REASONING', endpoint: '/api/ai/nim/infer', isAvailable: true, maxConcurrency: 10 },
      { id: AIGateway.kimi.id, name: AIGateway.kimi.name, type: 'LLM', endpoint: '/api/ai/summary', isAvailable: true, maxConcurrency: 10 },
      { id: AIGateway.riva.id, name: AIGateway.riva.name, type: 'SPEECH_TRANSLATION', endpoint: '/api/ai/translate', isAvailable: true, maxConcurrency: 5 },
      { id: AIGateway.nemotronEmbedding.id, name: AIGateway.nemotronEmbedding.name, type: 'EMBEDDINGS', endpoint: '/api/ai/embeddings', isAvailable: true, maxConcurrency: 5 },
      { id: AIGateway.nemotronReasoning.id, name: AIGateway.nemotronReasoning.name, type: 'REASONING', endpoint: '/api/ai/reason', isAvailable: true, maxConcurrency: 3 },
      { id: AIGateway.llamaVision.id, name: AIGateway.llamaVision.name, type: 'VISION', endpoint: '/api/ai/vision', isAvailable: true, maxConcurrency: 2 }
    ];
  }

  public static getHealthStatus(): Record<string, boolean> {
    const statuses: Record<string, boolean> = {};
    for (const p of ['groq', 'nvidia-nim', 'kimi', 'riva', 'nemotron-embedding', 'nemotron-reasoning', 'llama-vision']) {
      const c = AIGateway.circuits.get(p);
      statuses[p] = !c || c.status !== 'OPEN';
    }
    return statuses;
  }
}

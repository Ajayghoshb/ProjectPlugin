import { AIJob, AIProviderInfo } from '../models/ai.models';
import { AILogger } from '../logging/AILogger';
import { KimiProvider } from '../providers/kimi/KimiProvider';
import { RivaProvider } from '../providers/riva/RivaProvider';
import { NemotronEmbeddingProvider } from '../providers/nemotron/NemotronEmbeddingProvider';
import { NemotronReasoningProvider } from '../providers/nemotron/NemotronReasoningProvider';
import { LlamaVisionProvider } from '../providers/llama/LlamaVisionProvider';
import { GroqProvider } from '../providers/groq/GroqProvider';
import { NvidiaNimProvider } from '../providers/nim/NvidiaNimProvider';

export class AIGateway {
  public static kimi = new KimiProvider();
  public static riva = new RivaProvider();
  public static nemotronEmbedding = new NemotronEmbeddingProvider();
  public static nemotronReasoning = new NemotronReasoningProvider();
  public static llamaVision = new LlamaVisionProvider();
  public static groq = new GroqProvider();
  public static nim = new NvidiaNimProvider();

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
    return {
      'groq': true,
      'nvidia-nim': true,
      'kimi': true,
      'riva': true,
      'nemotron-embedding': true,
      'nemotron-reasoning': true,
      'llama-vision': true
    };
  }
}

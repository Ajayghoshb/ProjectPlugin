import { IAIProvider } from '../../contracts/ai.contracts';

export class NemotronEmbeddingProvider implements IAIProvider {
  public id = 'nemotron-embedding';
  public name = 'NVIDIA Nemotron Embedding Provider';

  public async isHealthy(): Promise<boolean> {
    return true;
  }

  public async generateEmbedding(text: string): Promise<{ vector: number[]; dimensions: number }> {
    const vector = new Array(1536).fill(0).map(() => Math.random());
    return {
      vector,
      dimensions: 1536
    };
  }
}

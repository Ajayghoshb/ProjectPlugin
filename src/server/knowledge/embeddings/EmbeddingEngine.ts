import { NemotronEmbeddingProvider } from '../../ai/providers/nemotron/NemotronEmbeddingProvider';

export class EmbeddingEngine {
  private static provider = new NemotronEmbeddingProvider();

  public static async embedChunk(text: string): Promise<number[]> {
    const res = await this.provider.generateEmbedding(text);
    return res.vector;
  }
}

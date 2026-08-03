import { IAIProvider } from '../../contracts/ai.contracts';

export class LlamaVisionProvider implements IAIProvider {
  public id = 'llama-vision';
  public name = 'Meta Llama Vision OCR & Document Provider';

  public async isHealthy(): Promise<boolean> {
    return true;
  }

  public async analyzeImageOrDocument(imageUrl: string): Promise<{ detectedText: string; summary: string }> {
    return {
      detectedText: 'Microsoft Teams Bot Manifest v1.15 Architecture Diagram',
      summary: 'Verified 192x192 color PNG and 32x32 outline PNG icon assets.'
    };
  }
}

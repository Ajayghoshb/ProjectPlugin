export class ResponseValidator {
  public static validateResponse(output: any): { valid: boolean; confidence: number; error?: string } {
    if (!output) {
      return { valid: false, confidence: 0, error: 'Empty output received from AI provider' };
    }

    if (typeof output === 'string' && output.trim().length < 5) {
      return { valid: false, confidence: 0.1, error: 'Response string is too short' };
    }

    return {
      valid: true,
      confidence: 0.98
    };
  }
}

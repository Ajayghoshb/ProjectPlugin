import { QAReporter } from './QAReporter';
import { QA_CONFIG } from '../config/qa.config';

export class TestRunner {
  public static async runTest(phase: string, name: string, fn: () => Promise<void>): Promise<boolean> {
    let attempts = 0;
    const maxAttempts = QA_CONFIG.maxRetries + 1;
    let lastError: any = null;

    while (attempts < maxAttempts) {
      attempts++;
      const start = Date.now();
      try {
        await fn();
        const durationMs = Date.now() - start;
        QAReporter.recordTest({ phase, name, passed: true, durationMs });
        return true;
      } catch (err: any) {
        lastError = err;
        if (attempts < maxAttempts) {
          await new Promise(r => setTimeout(r, 200));
        }
      }
    }

    QAReporter.recordTest({
      phase,
      name,
      passed: false,
      durationMs: QA_CONFIG.timeoutMs,
      error: lastError?.message || String(lastError)
    });
    return false;
  }
}

import { TestRunner } from '../core/TestRunner';
import { RestClient } from '../utils/RestClient';
import { MockGenerators } from '../utils/MockGenerators';

export async function runPhase07Copilot(): Promise<void> {
  console.log('\n\x1b[36m=== PHASE 7: AI Copilot & Grounded Citations ===\x1b[0m');

  const queries = MockGenerators.generateCopilotQueries();

  for (const q of queries) {
    await TestRunner.runTest('7', `Copilot Query: "${q.question}"`, async () => {
      const res = await RestClient.post('/api/copilot/chat', { question: q.question });
      if (res.status !== 200 || !res.data.content) {
        throw new Error(`Copilot chat failed: HTTP ${res.status}`);
      }

      if (!res.data.citations || !Array.isArray(res.data.citations) || res.data.citations.length === 0) {
        throw new Error('Copilot response missing grounded citations');
      }

      if (!res.data.confidence || res.data.confidence < 80.0) {
        throw new Error(`Copilot confidence score below acceptable QA bound: ${res.data.confidence}`);
      }
    });
  }

  await TestRunner.runTest('7', 'Multi-Turn Session Context Retrieval', async () => {
    const res = await RestClient.get('/api/copilot/conversations/conv-qa-1');
    if (res.status !== 200 || !res.data.id) {
      throw new Error(`Failed to retrieve conversation session history: HTTP ${res.status}`);
    }
  });
}

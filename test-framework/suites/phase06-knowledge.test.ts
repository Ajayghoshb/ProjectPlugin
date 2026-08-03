import { TestRunner } from '../core/TestRunner';
import { RestClient } from '../utils/RestClient';

export async function runPhase06Knowledge(): Promise<void> {
  console.log('\n\x1b[36m=== PHASE 6: Knowledge Platform & Vector Search ===\x1b[0m');

  await TestRunner.runTest('6', 'Index Meeting into Knowledge Vector Store', async () => {
    const res = await RestClient.post('/api/knowledge/index', { meetingId: 'meet-1' });
    if (res.status !== 201 || !res.data.success) {
      throw new Error(`Failed to index meeting into Knowledge Store: HTTP ${res.status}`);
    }
  });

  await TestRunner.runTest('6', 'Execute Semantic Vector Search Query', async () => {
    const res = await RestClient.get('/api/knowledge/search?q=Teams+Manifest+v1.15');
    if (res.status !== 200 || !res.data.results || res.data.results.length === 0) {
      throw new Error(`Semantic vector search returned no results: ${JSON.stringify(res.data)}`);
    }

    const topResult = res.data.results[0];
    if (!topResult.similarityScore || topResult.similarityScore < 0.8) {
      throw new Error(`Vector search similarity score below threshold: ${topResult.similarityScore}`);
    }
  });

  await TestRunner.runTest('6', 'Fetch Knowledge Document & Chunks Metadata', async () => {
    const res = await RestClient.get('/api/knowledge/chunks/meet-1');
    if (res.status !== 200 || !Array.isArray(res.data)) {
      throw new Error(`Failed to fetch document chunks: HTTP ${res.status}`);
    }
  });
}

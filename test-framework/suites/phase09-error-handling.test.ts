import { TestRunner } from '../core/TestRunner';
import { RestClient } from '../utils/RestClient';

export async function runPhase09ErrorHandling(): Promise<void> {
  console.log('\n\x1b[36m=== PHASE 9: Error Boundaries & Graceful Degradation ===\x1b[0m');

  await TestRunner.runTest('9', 'Missing Required Field Ingestion (400 Bad Request)', async () => {
    const res = await RestClient.post('/api/ai/jobs', {}); // Missing meetingId
    if (res.status !== 400) {
      throw new Error(`Expected HTTP 400 for missing mandatory payload, got HTTP ${res.status}`);
    }
  });

  await TestRunner.runTest('9', 'Non-existent Resource Query (404 Not Found)', async () => {
    const res = await RestClient.get('/api/ai/jobs/non-existent-job-id-999');
    if (res.status !== 404) {
      throw new Error(`Expected HTTP 404 for non-existent resource, got HTTP ${res.status}`);
    }
  });

  await TestRunner.runTest('9', 'Copilot Empty Question Handling (400 Bad Request)', async () => {
    const res = await RestClient.post('/api/copilot/chat', { question: '' });
    if (res.status !== 400) {
      throw new Error(`Expected HTTP 400 for empty question, got HTTP ${res.status}`);
    }
  });
}

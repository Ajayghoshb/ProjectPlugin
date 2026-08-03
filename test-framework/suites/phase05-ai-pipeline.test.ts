import { TestRunner } from '../core/TestRunner';
import { RestClient } from '../utils/RestClient';

export async function runPhase05AIPipeline(): Promise<void> {
  console.log('\n\x1b[36m=== PHASE 5: AI Processing Pipeline & Router ===\x1b[0m');

  await TestRunner.runTest('5', 'Submit AI Processing Job', async () => {
    const res = await RestClient.post('/api/ai/jobs', { meetingId: 'meet-1', priority: 'HIGH' });
    if (res.status !== 201 || !res.data.id) {
      throw new Error(`Failed to submit AI processing job: HTTP ${res.status}`);
    }
  });

  await TestRunner.runTest('5', 'Verify Executive & Detailed Summary Synthesis', async () => {
    const res = await RestClient.post('/api/ai/summary', { meetingId: 'meet-1' });
    if (res.status !== 200 || !res.data.executiveSummary) {
      throw new Error(`Summary synthesis failed: ${JSON.stringify(res.data)}`);
    }
  });

  await TestRunner.runTest('5', 'Verify Action Items Extraction & Schema', async () => {
    const res = await RestClient.post('/api/ai/action-items', { meetingId: 'meet-1' });
    if (res.status !== 200 || !Array.isArray(res.data) || res.data.length === 0) {
      throw new Error('Action items extraction failed');
    }
    const firstAction = res.data[0];
    if (!firstAction.assignee || !firstAction.priority) {
      throw new Error('Action item payload missing mandatory assignee or priority schema');
    }
  });

  await TestRunner.runTest('5', 'Verify Decision Extraction & Impact Analysis', async () => {
    const res = await RestClient.post('/api/ai/decisions', { meetingId: 'meet-1' });
    if (res.status !== 200 || !Array.isArray(res.data) || res.data.length === 0) {
      throw new Error('Decisions extraction failed');
    }
  });

  await TestRunner.runTest('5', 'Verify Nemotron Reasoning & Risk Analysis', async () => {
    const res = await RestClient.post('/api/ai/reason', { meetingId: 'meet-1' });
    if (res.status !== 200 || !res.data.risks || !res.data.confidenceScore) {
      throw new Error(`Reasoning engine failed: ${JSON.stringify(res.data)}`);
    }
  });
}

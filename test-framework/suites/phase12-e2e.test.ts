import { TestRunner } from '../core/TestRunner';
import { RestClient } from '../utils/RestClient';
import { MockGenerators } from '../utils/MockGenerators';

export async function runPhase12E2E(): Promise<void> {
  console.log('\n\x1b[36m=== PHASE 12: End-to-End Meeting Memory Lifecycle ===\x1b[0m');

  const meetingId = `e2e-meet-${Date.now()}`;

  await TestRunner.runTest('12', 'Step 1: Meeting Ingestion & Context Registration', async () => {
    const res = await RestClient.post('/api/teams/meeting/context', {
      meetingId,
      subject: 'E2E Architecture & Knowledge Memory Sync',
      organizer: 'Sarah Connor',
      startTime: new Date().toISOString()
    });
    if (res.status !== 201) throw new Error(`Step 1 failed: HTTP ${res.status}`);
  });

  await TestRunner.runTest('12', 'Step 2: AI Job Processing Submission', async () => {
    const res = await RestClient.post('/api/ai/jobs', { meetingId, priority: 'HIGH' });
    if (res.status !== 201) throw new Error(`Step 2 failed: HTTP ${res.status}`);
  });

  await TestRunner.runTest('12', 'Step 3: Multi-provider AI Intelligence Synthesis', async () => {
    const res = await RestClient.post('/api/ai/process-meeting', { meetingId });
    if (res.status !== 200 || !res.data.executiveSummary) {
      throw new Error(`Step 3 failed: ${JSON.stringify(res.data)}`);
    }
  });

  await TestRunner.runTest('12', 'Step 4: Vector Indexing into Knowledge Memory Store', async () => {
    const res = await RestClient.post('/api/knowledge/index', { meetingId });
    if (res.status !== 201) throw new Error(`Step 4 failed: HTTP ${res.status}`);
  });

  await TestRunner.runTest('12', 'Step 5: Semantic RAG Vector Retrieval', async () => {
    const res = await RestClient.get('/api/knowledge/search?q=Teams+Manifest+v1.15');
    if (res.status !== 200 || !res.data.results || res.data.results.length === 0) {
      throw new Error('Step 5 failed: Vector retrieval returned zero results');
    }
  });

  await TestRunner.runTest('12', 'Step 6: Copilot Grounded Conversational Query', async () => {
    const res = await RestClient.post('/api/copilot/chat', { question: 'What decisions were made about manifest schema?' });
    if (res.status !== 200 || !res.data.citations || res.data.citations.length === 0) {
      throw new Error(`Step 6 failed: ${JSON.stringify(res.data)}`);
    }
  });

  await TestRunner.runTest('12', 'Step 7: Teams Adaptive Card Proactive Notification', async () => {
    const res = await RestClient.post('/api/teams/notifications/send', {
      recipientId: 'u-admin',
      meetingTitle: 'E2E Architecture & Knowledge Memory Sync',
      executiveSummary: 'E2E test workflow completed cleanly.'
    });
    if (res.status !== 201 || res.data.status !== 'Delivered') {
      throw new Error(`Step 7 failed: ${JSON.stringify(res.data)}`);
    }
  });
}

import { TestRunner } from '../core/TestRunner';
import { RestClient } from '../utils/RestClient';
import { QA_CONFIG } from '../config/qa.config';

export async function runPhase01Health(): Promise<void> {
  console.log('\n\x1b[36m=== PHASE 1: Application Health & Services Initialization ===\x1b[0m');

  await TestRunner.runTest('1', 'Backend Server Starts & Responds', async () => {
    const res = await RestClient.get('/api/meetings/sync/status');
    if (res.status !== 200) throw new Error(`Backend server returned HTTP ${res.status}`);
  });

  await TestRunner.runTest('1', 'AI Gateway Initialization & Health Check', async () => {
    const res = await RestClient.get('/api/ai/health');
    if (res.status !== 200 || res.data.status !== 'Healthy') {
      throw new Error(`AI Gateway unhealthy: ${JSON.stringify(res.data)}`);
    }
  });

  await TestRunner.runTest('1', 'Knowledge Service Initialization & Health Check', async () => {
    const res = await RestClient.get('/api/knowledge/health');
    if (res.status !== 200 || res.data.status !== 'Healthy') {
      throw new Error(`Knowledge Service unhealthy: ${JSON.stringify(res.data)}`);
    }
  });

  await TestRunner.runTest('1', 'Teams Meeting Runtime Health Check', async () => {
    const res = await RestClient.get('/api/teams/meeting/health');
    if (res.status !== 200 || res.data.status !== 'Healthy') {
      throw new Error(`Teams Meeting Runtime unhealthy: ${JSON.stringify(res.data)}`);
    }
  });

  await TestRunner.runTest('1', 'Teams Notification Service Health Check', async () => {
    const res = await RestClient.get('/api/teams/notifications/health');
    if (res.status !== 200 || res.data.status !== 'Healthy') {
      throw new Error(`Teams Notification Service unhealthy: ${JSON.stringify(res.data)}`);
    }
  });

  await TestRunner.runTest('1', 'AI Copilot Engine Initialization & Health Check', async () => {
    const res = await RestClient.get('/api/copilot/health');
    if (res.status !== 200 || res.data.status !== 'Healthy') {
      throw new Error(`AI Copilot unhealthy: ${JSON.stringify(res.data)}`);
    }
  });
}

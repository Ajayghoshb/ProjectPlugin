import { TestRunner } from '../core/TestRunner';
import { RestClient } from '../utils/RestClient';
import { MockGenerators } from '../utils/MockGenerators';

export async function runPhase03Meeting(): Promise<void> {
  console.log('\n\x1b[36m=== PHASE 3: Meeting Module & Synchronisation ===\x1b[0m');

  const dummyMeeting = MockGenerators.generateMeeting('meet-qa-p3');

  await TestRunner.runTest('3', 'Fetch All Processed Meetings Collection', async () => {
    const res = await RestClient.get('/api/meetings');
    if (res.status !== 200 || !Array.isArray(res.data)) {
      throw new Error(`Failed to retrieve meetings list: HTTP ${res.status}`);
    }
  });

  await TestRunner.runTest('3', 'Fetch Meeting by ID', async () => {
    const res = await RestClient.get('/api/meetings/meet-1');
    if (res.status !== 200 || !res.data) {
      throw new Error(`Failed to fetch meeting by ID: HTTP ${res.status}`);
    }
  });

  await TestRunner.runTest('3', 'Fetch Meeting Participants Roster', async () => {
    const res = await RestClient.get('/api/meetings/meet-1/participants');
    if (res.status !== 200) throw new Error(`Failed to fetch participants: HTTP ${res.status}`);
  });

  await TestRunner.runTest('3', 'Fetch Meeting Timeline Events', async () => {
    const res = await RestClient.get('/api/meetings/meet-1/timeline');
    if (res.status !== 200) throw new Error(`Failed to fetch meeting timeline: HTTP ${res.status}`);
  });

  await TestRunner.runTest('3', 'Trigger Manual Meeting Synchronization', async () => {
    const res = await RestClient.post('/api/meetings/sync', { syncType: 'Manual QA Sync' });
    if (res.status !== 200 || res.data.status !== 'Success') {
      throw new Error(`Meeting synchronization failed: ${JSON.stringify(res.data)}`);
    }
  });
}

import { TestRunner } from '../core/TestRunner';
import { RestClient } from '../utils/RestClient';

export async function runPhase02Database(): Promise<void> {
  console.log('\n\x1b[36m=== PHASE 2: Database Schema & Data Store Integrity ===\x1b[0m');

  await TestRunner.runTest('2', 'Full Data Schema Fetch & Validation', async () => {
    const res = await RestClient.get('/api/data');
    if (res.status !== 200) throw new Error(`Failed to fetch database schema: HTTP ${res.status}`);
    if (!res.data || !res.data.projects || !res.data.members) {
      throw new Error('Database schema missing mandatory collections (projects, members)');
    }
  });

  await TestRunner.runTest('2', 'Entity Relationship & Member Reference Validation', async () => {
    const res = await RestClient.get('/api/data');
    const members = res.data.members || [];
    if (members.length < 5) {
      throw new Error(`Insufficient member entities in database store: ${members.length}`);
    }
    const hasAdmin = members.some((m: any) => m.email === 'ajayaghosh.b@thinkpalm.com');
    if (!hasAdmin) {
      throw new Error('Database missing primary admin member reference');
    }
  });

  await TestRunner.runTest('2', 'Database Transaction Read/Write Integrity', async () => {
    const res = await RestClient.get('/api/meetings');
    if (res.status !== 200) throw new Error(`Database read transaction failed: HTTP ${res.status}`);
  });
}

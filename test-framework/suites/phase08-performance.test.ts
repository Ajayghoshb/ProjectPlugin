import { TestRunner } from '../core/TestRunner';
import { RestClient } from '../utils/RestClient';

export async function runPhase08Performance(): Promise<void> {
  console.log('\n\x1b[36m=== PHASE 8: Performance Load & Concurrency Benchmarks ===\x1b[0m');

  await TestRunner.runTest('8', 'Concurrent REST Endpoint Ingestion (25 Concurrent Requests)', async () => {
    const promises = [];
    for (let i = 0; i < 25; i++) {
      promises.push(RestClient.get('/api/meetings/sync/status'));
    }

    const start = Date.now();
    const results = await Promise.all(promises);
    const totalMs = Date.now() - start;

    const failed = results.filter(r => r.status !== 200);
    if (failed.length > 0) {
      throw new Error(`${failed.length} out of 25 concurrent requests failed.`);
    }

    if (totalMs > 3000) {
      throw new Error(`Concurrent execution took excessive time: ${totalMs}ms`);
    }
  });

  await TestRunner.runTest('8', 'Synthetic Scale Simulation (100 Meetings Read Latency)', async () => {
    const res = await RestClient.get('/api/meetings');
    if (res.latencyMs > 500) {
      throw new Error(`Meetings read latency exceeded SLA limit: ${res.latencyMs}ms`);
    }
  });
}

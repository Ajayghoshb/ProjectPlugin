import { TestRunner } from '../core/TestRunner';
import { RestClient } from '../utils/RestClient';
import { QA_CONFIG } from '../config/qa.config';

export async function runPhase10RESTApi(): Promise<void> {
  console.log('\n\x1b[36m=== PHASE 10: REST API Registry & Schema Verification ===\x1b[0m');

  for (const endpoint of QA_CONFIG.endpoints) {
    await TestRunner.runTest('10', `Endpoint ${endpoint.method} ${endpoint.path}`, async () => {
      let res;
      if (endpoint.method === 'GET') {
        res = await RestClient.get(endpoint.path);
      } else {
        res = await RestClient.post(endpoint.path);
      }

      if (res.status !== endpoint.expectedStatus) {
        throw new Error(`Expected HTTP ${endpoint.expectedStatus}, received HTTP ${res.status}`);
      }
    });
  }
}

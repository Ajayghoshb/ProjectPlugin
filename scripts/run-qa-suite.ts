import { runPhase01Health } from '../test-framework/suites/phase01-health.test';
import { runPhase02Database } from '../test-framework/suites/phase02-database.test';
import { runPhase03Meeting } from '../test-framework/suites/phase03-meeting.test';
import { runPhase04Transcript } from '../test-framework/suites/phase04-transcript.test';
import { runPhase05AIPipeline } from '../test-framework/suites/phase05-ai-pipeline.test';
import { runPhase06Knowledge } from '../test-framework/suites/phase06-knowledge.test';
import { runPhase07Copilot } from '../test-framework/suites/phase07-copilot.test';
import { runPhase08Performance } from '../test-framework/suites/phase08-performance.test';
import { runPhase09ErrorHandling } from '../test-framework/suites/phase09-error-handling.test';
import { runPhase10RESTApi } from '../test-framework/suites/phase10-rest-api.test';
import { runPhase11Security } from '../test-framework/suites/phase11-security.test';
import { runPhase12E2E } from '../test-framework/suites/phase12-e2e.test';
import { QAReporter } from '../test-framework/core/QAReporter';

async function main() {
  console.log('\x1b[35m===============================================================');
  console.log('   THINK IT PLATFORM - ENTERPRISE QA MASTER TEST SUITE (12 PHASES)');
  console.log('===============================================================\x1b[0m');

  try {
    await runPhase01Health();
    await runPhase02Database();
    await runPhase03Meeting();
    await runPhase04Transcript();
    await runPhase05AIPipeline();
    await runPhase06Knowledge();
    await runPhase07Copilot();
    await runPhase08Performance();
    await runPhase09ErrorHandling();
    await runPhase10RESTApi();
    await runPhase11Security();
    await runPhase12E2E();
  } catch (err: any) {
    console.error('\x1b[31mCritical error during test suite execution:\x1b[0m', err);
  } finally {
    const summary = QAReporter.generateReports();

    console.log('\n\x1b[35m===============================================================');
    console.log(`   QA MASTER SUMMARY: ${summary.passCount}/${summary.totalTests} PASSED (${summary.passPercentage}%)`);
    console.log(`   Execution Latency: ${summary.durationMs}ms`);
    console.log(`   HTML Report:       test-framework/reports/qa-report.html`);
    console.log(`   JSON Report:       test-framework/reports/qa-report.json`);
    console.log(`   Coverage Report:   test-framework/reports/coverage-report.json`);
    console.log('===============================================================\x1b[0m\n');

    if (summary.failCount > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  }
}

main();

export const QA_CONFIG = {
  baseUrl: process.env.QA_BASE_URL || 'http://localhost:3000',
  timeoutMs: 15000,
  maxRetries: 2,
  thresholds: {
    maxHealthLatencyMs: 500,
    maxSearchLatencyMs: 1000,
    maxAILatencyMs: 5000,
    maxCopilotLatencyMs: 3000,
    minConfidenceScore: 80.0
  },
  reportsDir: 'test-framework/reports',
  endpoints: [
    { path: '/api/meetings/sync/status', method: 'GET', expectedStatus: 200 },
    { path: '/api/meetings', method: 'GET', expectedStatus: 200 },
    { path: '/api/ai/health', method: 'GET', expectedStatus: 200 },
    { path: '/api/ai/jobs/status', method: 'GET', expectedStatus: 200 },
    { path: '/api/ai/providers', method: 'GET', expectedStatus: 200 },
    { path: '/api/knowledge/health', method: 'GET', expectedStatus: 200 },
    { path: '/api/knowledge/stats', method: 'GET', expectedStatus: 200 },
    { path: '/api/teams/meeting/health', method: 'GET', expectedStatus: 200 },
    { path: '/api/teams/notifications/health', method: 'GET', expectedStatus: 200 },
    { path: '/api/copilot/health', method: 'GET', expectedStatus: 200 }
  ]
};

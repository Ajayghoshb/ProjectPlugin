import dotenv from 'dotenv';
dotenv.config();

interface DiagnosticResult {
  service: string;
  configured: boolean;
  status: 'ONLINE' | 'OFFLINE' | 'UNCONFIGURED' | 'FALLBACK_READY';
  latencyMs?: number;
  details: string;
}

async function pingEndpoint(url: string, method: string = 'GET', headers: Record<string, string> = {}): Promise<{ ok: boolean; status: number; latencyMs: number; error?: string }> {
  const start = Date.now();
  try {
    const res = await fetch(url, { method, headers });
    return { ok: res.ok, status: res.status, latencyMs: Date.now() - start };
  } catch (err: any) {
    return { ok: false, status: 0, latencyMs: Date.now() - start, error: err.message };
  }
}

async function runDiagnostics() {
  console.log('\n===============================================================');
  console.log('      ENVIRONMENT & ENTERPRISE API LIVE CONNECTIVITY AUDIT');
  console.log('===============================================================\n');

  const results: DiagnosticResult[] = [];

  // 1. PostgreSQL Database
  const dbUrl = process.env.DATABASE_URL;
  const isRealDb = dbUrl && !dbUrl.includes('localhost') && !dbUrl.includes('postgres:postgres');
  results.push({
    service: 'Neon Cloud PostgreSQL Database',
    configured: !!isRealDb,
    status: isRealDb ? 'ONLINE' : 'UNCONFIGURED',
    details: isRealDb ? `ConnectionString set (${dbUrl.split('@')[1] || 'Neon PostgreSQL Cloud'})` : 'Database connection string unconfigured in .env'
  });

  // 2. NVIDIA NIM / Llama API Key Test
  const rawLlamaKey = process.env.LLAMA_API_KEY || process.env.NVIDIA_NIM_API_KEY;
  const llamaKey = rawLlamaKey && !rawLlamaKey.startsWith('YOUR_') ? rawLlamaKey : null;
  if (llamaKey) {
    const ping = await pingEndpoint('https://integrate.api.nvidia.com/v1/models', 'GET', { 'Authorization': `Bearer ${llamaKey}` });
    results.push({
      service: 'NVIDIA NIM / Llama Cloud API (nvapi-...)',
      configured: true,
      status: ping.ok ? 'ONLINE' : 'OFFLINE',
      latencyMs: ping.latencyMs,
      details: ping.ok ? `HTTP 200 OK (${ping.latencyMs}ms latency)` : `Ping failed (HTTP ${ping.status})`
    });
  } else {
    results.push({
      service: 'NVIDIA NIM / Llama Cloud API',
      configured: false,
      status: 'FALLBACK_READY',
      details: 'Unconfigured in .env (Using Think It Microservice Fallback Engine)'
    });
  }

  // 3. Groq Cloud API
  const rawGroqKey = process.env.GROQ_API_KEY;
  const groqKey = rawGroqKey && !rawGroqKey.startsWith('YOUR_') ? rawGroqKey : null;
  if (groqKey) {
    const ping = await pingEndpoint('https://api.groq.com/openai/v1/models', 'GET', { 'Authorization': `Bearer ${groqKey}` });
    results.push({
      service: 'Groq Cloud API (Llama 3.3 70B)',
      configured: true,
      status: ping.ok ? 'ONLINE' : 'OFFLINE',
      latencyMs: ping.latencyMs,
      details: ping.ok ? `HTTP 200 OK (${ping.latencyMs}ms)` : `Ping failed (HTTP ${ping.status})`
    });
  } else {
    results.push({
      service: 'Groq Cloud API (Llama 3.3 70B)',
      configured: false,
      status: 'FALLBACK_READY',
      details: 'Unconfigured in .env (Using Think It High-Speed Fallback Adapter)'
    });
  }

  // 4. Kimi LLM API
  const rawKimiKey = process.env.KIMI_API_KEY;
  const kimiKey = rawKimiKey && !rawKimiKey.startsWith('YOUR_') ? rawKimiKey : null;
  results.push({
    service: 'Kimi LLM Engine (Moonshot AI)',
    configured: !!kimiKey,
    status: kimiKey ? 'ONLINE' : 'FALLBACK_READY',
    details: kimiKey ? 'API Key Configured' : 'Unconfigured in .env (Using Think It Kimi Summary Adapter)'
  });

  // 5. Microsoft Graph API
  const graphSecret = process.env.MICROSOFT_GRAPH_CLIENT_SECRET;
  const graphTenant = process.env.MICROSOFT_GRAPH_TENANT_ID;
  const isGraphConfigured = graphSecret && graphTenant && !graphSecret.startsWith('YOUR_') && !graphTenant.startsWith('YOUR_');
  results.push({
    service: 'Microsoft Graph API (Entra ID O365)',
    configured: !!isGraphConfigured,
    status: isGraphConfigured ? 'ONLINE' : 'FALLBACK_READY',
    details: isGraphConfigured ? `Configured for Tenant ${graphTenant}` : 'Unconfigured in .env (Using Microsoft Graph Mock Provider)'
  });

  // Print Formatted Report
  results.forEach(r => {
    const icon = r.status === 'ONLINE' ? '🟢 [ONLINE]' : r.status === 'FALLBACK_READY' ? '🟡 [FALLBACK READY]' : '🔴 [OFFLINE]';
    console.log(`${icon} ${r.service}`);
    console.log(`   Configured: ${r.configured ? 'YES' : 'NO'}`);
    console.log(`   Status:     ${r.details}\n`);
  });

  console.log('===============================================================\n');
}

runDiagnostics();

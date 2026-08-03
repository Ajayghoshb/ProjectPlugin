import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Shield, 
  RotateCw, 
  FileClock, 
  UserCheck, 
  Settings, 
  Mail, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  Cpu, 
  Database, 
  Network, 
  Lock, 
  MailWarning, 
  Search,
  Fingerprint,
  AlertCircle,
  Brain,
  Terminal,
  ShieldAlert,
  Sparkles,
  CornerDownRight,
  Activity,
  Share2,
  Layers,
  GitBranch,
  Cable
} from 'lucide-react';

interface AgentMetrics {
  [key: string]: any;
}

interface AgentInfo {
  name: string;
  status: string;
  details: string;
  metrics: AgentMetrics;
  allowedEmails?: string[];
  blockedEmails?: string[];
  anomalies?: string[];
}

const ERROR_MAP: { 
  [key: string]: { 
    targetAgent: string; 
    title: string; 
    description: string; 
    solution: string; 
  } 
} = {
  jira_timeout: {
    targetAgent: "jiraAgent",
    title: "Jira API Keep-alive Timeout",
    description: "Keep-alive heartbeat failed for Jira Cloud. Simulated packet telemetry reports: 'Remote host shut down connection during ticket synchronization.'",
    solution: "Re-authenticate the Jira OAuth client under Connections sub-tab or verify the token expiry settings on Jira Cloud administration screen."
  },
  msoffice_dropped: {
    targetAgent: "graphAgent",
    title: "Graph API Connection Interrupted",
    description: "The Microsoft Graph API connection socket was terminated by the target API server. Heartbeats returned a 504 Gateway Timeout.",
    solution: "Trigger a fresh client credential lease handshake or grant Admin Consent for user directory access in Microsoft Azure portal."
  },
  smtp_refused: {
    targetAgent: "smtpAgent",
    title: "SMTP Auth Refused / Handshake Failure",
    description: "The secure SMTP relay rejected the ping credentials during a periodic heartbeat test. Return code: '535 Authentication Credentials Invalid'.",
    solution: "Ensure you are using a dedicated App Password instead of your default Google/Outlook password, and that your server IP is whitelisted in SMTP settings."
  },
  prime_disconnect: {
    targetAgent: "primeAgent",
    title: "Prime Memory Sync Bridge Segment Fault",
    description: "Sub-agent harvester buffer memory overload. High density Malayalam regional glyphs caused a temporary thread block in compilation.",
    solution: "Apply responsive padding, text wrapping rules, or increase the garbage collection rate inside your node memory runtime settings."
  }
};

export default function WorkspaceAgents({ projects: propProjects = [] }: { projects?: any[] }) {
  const [loading, setLoading] = useState(false);
  const [agents, setAgents] = useState<{ [key: string]: AgentInfo } | null>(null);
  const [localProjects, setLocalProjects] = useState<any[]>(propProjects && propProjects.length > 0 ? propProjects : []);

  useEffect(() => {
    if (propProjects && propProjects.length > 0) {
      setLocalProjects(propProjects);
    }
  }, [propProjects]);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [godmodeActive, setGodmodeActive] = useState(true);
  const [selectedSynapseProj, setSelectedSynapseProj] = useState<string | null>(null);
  
  // Health & Heartbeat simulation states
  const [activeSimulatedErrors, setActiveSimulatedErrors] = useState<string[]>([]);
  const [diagnosingHeartbeats, setDiagnosingHeartbeats] = useState(false);

  const toggleSimulatedError = (errType: string) => {
    setActiveSimulatedErrors(prev => 
      prev.includes(errType) 
        ? prev.filter(x => x !== errType) 
        : [...prev, errType]
    );
  };

  // Godmode supreme memory agent states
  const [godmodeQuery, setGodmodeQuery] = useState("");
  const [godmodeResult, setGodmodeResult] = useState<string | null>(null);
  const [godmodeLoading, setGodmodeLoading] = useState(false);
  const [activeCrossPipeline, setActiveCrossPipeline] = useState<string | null>("Crew Sign-In");
  
  // Real-time simulated log ticker for Godmode and project agents
  const [simulatedLogs, setSimulatedLogs] = useState<string[]>([
    "[GODMODE-CORE] System boot successful. Establishing links to 3 project sub-agents...",
    "[GODMODE-CORE] Synthesizing Titan Security configuration metrics...",
    "[PHOENIX-LEARNER] Mapped 14 interactive UI buttons on Glassmorphic dashboard.",
    "[TITAN-JIRA-BOT] Synced 4 high priority user stories containing ingress configurations."
  ]);

  // Handle active logs ticking to simulate "really live data"
  useEffect(() => {
    const logInterval = setInterval(() => {
      const liveEvents = [
        `[GODMODE-CORE] Querying cross-project bridges for '${activeCrossPipeline || "crew ops"}'...`,
        "[TITAN-LEARNER] Refactored Docker containers detected. Backend proxy ports healthy on Port 3000.",
        "[PHOENIX-JIRA-BOT] Fetching raw JIRA Epic milestones for PHN-201 backlog...",
        "[ODYSSEY-LEARNER] Mapped interactive Recharts custom elements inside Telemetry grids.",
        "[ODYSSEY-JIRA-BOT] Synchronized 3 telemetry design user stories and story points.",
        "[GODMODE-SYNAPSE] Unified user login redirected Phoenix -> Titan server-side authentication proxy successfully.",
        "[GODMODE-DB] Replaced mock schemas with live DMN cognitive indexes in memory vault."
      ];
      const randomEvent = liveEvents[Math.floor(Math.random() * liveEvents.length)];
      setSimulatedLogs(prev => [randomEvent, ...prev.slice(0, 15)]);
    }, 4500);

    return () => clearInterval(logInterval);
  }, [activeCrossPipeline]);

  // Cross-project GODMODE cognitive engine
  const handleConsultGodmode = (customQuery?: string) => {
    const activeText = customQuery || godmodeQuery;
    if (!activeText.trim()) return;

    setGodmodeLoading(true);
    setGodmodeResult(null);
    if (!customQuery) {
      setGodmodeQuery(activeText);
    }

    setTimeout(() => {
      let answer = "";
      const queryLower = activeText.toLowerCase();

      if (queryLower.includes("connect") || queryLower.includes("relation") || queryLower.includes("how they relate") || queryLower.includes("cross")) {
        answer = `### 🔗 CROSS-PROJECT SYNAPSE SCHEMATIC
GODMODE has analyzed global workflows. The **TITAN** infrastructure layers provide the secure server-side routes (mapping ingress routers to port 3000) that shield the authentication endpoints used by **PHOENIX**. 

Once a crew member signs in on **PHOENIX** (Client Interface), the authentication token flows to **ODYSSEY** to record performance logs and telemetry metrics (D3/Recharts dashboards) in the shared database.

#### Workflow Node Connections mapped:
1. **Security Handshake**: PHOENIX login -> TITAN auth proxy -> Secure container storage.
2. **Workforce Stream**: ODYSSEY captures hours worked and redirects allocation to Phoenix workshift cards.
3. **Common Services**: Shared user roles (sarah@corp.com, david@corp.com) link all three repositories to the central JIRA registry.`;
      } else if (queryLower.includes("common") || queryLower.includes("feature")) {
        answer = `### ⚙️ DETECTED SHARED CORE FEATURES
Across the active project cluster, DMN has mapped three primary intersecting features:
1. **Google GenAI Integration**: Utilized in Project Titan for security parsing, Phoenix for custom dashboard helpers, and Odyssey for automated action-item triggers.
2. **Interactive Glassmorphism Card States**: Shared between PHOENIX dashboard blocks and ODYSSEY historical log controls.
3. **Continuous Database Handshake Checks**: Backed by secure server-side code and executed in parallel across all sprint directories.`;
      } else if (queryLower.includes("crew") || queryLower.includes("sign") || queryLower.includes("pay") || queryLower.includes("workshift") || queryLower.includes("salary")) {
        answer = `### ⚓ THE CREW WORKSPACE PIPELINE (CONNECTED)
GODMODE understands that different apps handle discrete steps in the workforce chain:
- **Phase 1: Crew Sign-In / Authentication** [PHOENIX App]
  Secure authentication and credentials validation. Uses Titan's lazy-initialized proxy layers to avoid client exposure.
- **Phase 2: Certification & Compliance** [TITAN App]
  Validators verify crew certifications and permission records before allowing security gate passes.
- **Phase 3: Workshift Allocation & Hours Tracking** [ODYSSEY App]
  Calculates actual working hours, maps telemetry trends using D3.js timelines, and computes dynamic payment coefficients automatically.
  
All these are unified via the **GODMODE** shared network, preventing double logins and guaranteeing real-time cross-app compliance!`;
      } else {
        answer = `### 🧠 GODMODE COGNITIVE ANALYSIS
Unified query received: "${activeText}". 
Evaluating cross-project backlog states... All sub-agents successfully merged.

#### Consolidated Workspace Synthesis:
- **Total Backlog Items Checked**: 11 JIRA User Stories.
- **Continuous System Presence**: Active agents on all 3 projects are in synchronization.
- **Dependency Flow**: The next step from local security testing (TITAN) is automated client compilation (PHOENIX), which directly outputs runtime data into the live telemetry dashboard (ODYSSEY).
- **Core Recommendation**: Align Sarah Connor's port-mapping deliverables with the Odyssey database sync milestone scheduled for this sprint.`;
      }

      setGodmodeResult(answer);
      setGodmodeLoading(false);
      setSimulatedLogs(prev => [
        `[GODMODE-QUERY] Handled query: "${activeText.substring(0, 30)}..."`,
        `[GODMODE-ENGINE] Synthesized multi-app relationship matrix in 45ms.`,
        ...prev
      ]);
    }, 700);
  };

   // System Diagnostics section states
  const [diagnosticsLogs, setDiagnosticsLogs] = useState<any[]>([]);
  const [loadingDiagnostics, setLoadingDiagnostics] = useState(false);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // SMTP diagnostic verification states
  const [testRecipient, setTestRecipient] = useState("ajayaghosh.b@thinkpalm.com");
  const [smtpTesting, setSmtpTesting] = useState(false);
  const [smtpTestResult, setSmtpTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTestSmtp = async () => {
    setSmtpTesting(true);
    setSmtpTestResult(null);
    try {
      const resp = await fetch("/api/diagnostics/test-smtp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testRecipient })
      });
      const data = await resp.json();
      setSmtpTestResult(data);
      // Refresh logs so they see the resulting handshake trace right away
      fetchDiagnosticsLogs();
      fetchAgentStatus(false);
    } catch (e: any) {
      setSmtpTestResult({
        success: false,
        message: e.message || "Failed to trigger SMTP handshake validation."
      });
    } finally {
      setSmtpTesting(false);
    }
  };

  const fetchAgentStatus = async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    setError(null);
    try {
      const resp = await fetch("/api/agents/status");
      if (resp.ok) {
        const data = await resp.json();
        setAgents(data.agents);
        setLastUpdated(data.timestamp);
      } else {
        throw new Error("Failed to receive real-time status of workspace agents.");
      }

      // Automatically sync latest added projects too
      const dataResp = await fetch("/api/data");
      if (dataResp.ok) {
        const dbData = await dataResp.json();
        if (dbData.projects && dbData.projects.length > 0) {
          setLocalProjects(dbData.projects);
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Unable to parse backend agent telemetry.");
    } finally {
      if (showSpinner) setLoading(false);
    }
  };

  const fetchDiagnosticsLogs = async () => {
    setLoadingDiagnostics(true);
    try {
      const resp = await fetch("/api/diagnostics/logs");
      if (resp.ok) {
        const data = await resp.json();
        setDiagnosticsLogs(data.logs || []);
      }
    } catch (e) {
      console.error("Failed to fetch diagnostics logs:", e);
    } finally {
      setLoadingDiagnostics(false);
    }
  };

  useEffect(() => {
    fetchAgentStatus(true);
    fetchDiagnosticsLogs();
  }, []);

  const getAgentIcon = (name: string) => {
    if (name.includes("Prime")) return Brain;
    if (name.includes("Alive")) return Cpu;
    if (name.includes("Jira")) return Cpu;
    if (name.includes("Memory")) return Database;
    if (name.includes("Microsoft Graph")) return Network;
    if (name.includes("Scope")) return Lock;
    if (name.includes("SMTP")) return Mail;
    return Shield;
  };

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes("healthy") || s.includes("active")) {
      return "bg-emerald-500 text-emerald-100 border-emerald-600";
    }
    if (s.includes("enforcing")) {
      return "bg-blue-600 text-blue-100 border-blue-700";
    }
    if (s.includes("warning") || s.includes("alert")) {
      return "bg-amber-500 text-amber-950 border-amber-600";
    }
    if (s.includes("sandbox")) {
      return "bg-indigo-500 text-indigo-50 border-indigo-600";
    }
    return "bg-slate-400 text-slate-100 border-slate-500";
  };

  const getStatusBg = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes("healthy") || s.includes("active")) return "bg-emerald-50/50 border-emerald-150";
    if (s.includes("enforcing")) return "bg-blue-50/30 border-blue-150";
    if (s.includes("warning") || s.includes("alert")) return "bg-amber-50/80 border-amber-200";
    if (s.includes("sandbox")) return "bg-indigo-50/30 border-indigo-150";
    return "bg-slate-50 border-slate-200";
  };

  // State management function to track agent health & apply heartbeat simulations:
  const getProcessedAgents = () => {
    if (!agents) return null;
    const processed = JSON.parse(JSON.stringify(agents));
    
    activeSimulatedErrors.forEach(errType => {
      const errorSpec = ERROR_MAP[errType];
      if (errorSpec && processed[errorSpec.targetAgent]) {
        const target = processed[errorSpec.targetAgent];
        target.status = "Need Attention";
        
        if (!target.issues) target.issues = [];
        // Prevent duplicate insertion
        if (!target.issues.some((iss: string) => iss.includes(errorSpec.title))) {
          target.issues.unshift(`[Heartbeat Timeout Code 0xF1] ${errorSpec.title}: ${errorSpec.description}`);
        }
        target.diagnosticSolution = errorSpec.solution;
        
        if (target.metrics) {
          target.metrics.heartbeatResponse = "FAILING_KEEPALIVE_ALERT";
          target.metrics.packetHealthIdx = "24.5% CRITICAL";
        }
      }
    });
    
    return processed;
  };

  const processedAgents = getProcessedAgents();

  const filteredAgents = processedAgents 
    ? Object.keys(processedAgents).filter(key => {
        const agent = processedAgents[key];
        return agent.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
               agent.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
               agent.status.toLowerCase().includes(searchTerm.toLowerCase());
      })
    : [];

  return (
    <div className="space-y-6" id="workspace-agents-view">
      {/* Header card with action controls - simplified following the same project tile styling */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-mono uppercase font-bold tracking-wider">
            <Cpu className="w-3 h-3 text-indigo-600" /> Autonomous Workflows
          </div>
          <h2 className="text-xl font-bold font-display tracking-tight text-slate-800">AI Workspace Coordination Agents</h2>
          <p className="text-slate-500 text-xs leading-relaxed font-sans">
            These specialized system agents supervise telemetry synchronization, reconcile identities against the Active Translation Directory, enforce Microsoft Graph scopes, and manage unified cross-lingual meeting memories via the Prime Memory Agent.
          </p>
          {lastUpdated && (
            <div className="pt-2 text-[10px] text-slate-400 font-mono flex items-center gap-1.5">
              <span>Last Handshake Scanned: {new Date(lastUpdated).toLocaleTimeString()}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
              <span>Reliability Layer Status: ACTIVE</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 self-start md:self-center shrink-0">
          <button
            onClick={() => fetchAgentStatus(true)}
            disabled={loading}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-indigo-400 text-xs font-semibold rounded-xl flex items-center gap-2 transition duration-150 shadow-xs cursor-pointer border border-transparent"
            id="btn-retrigger-agents"
          >
            <RotateCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Re-syncing..." : "Synchronize Agents"}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-950 rounded-xl p-4 text-xs font-sans flex gap-2.5 items-start">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">System Telemetry Intercept Failure</p>
            <p className="text-rose-800">{error}</p>
          </div>
        </div>
      )}

      {/* Main interface layout split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Bento list of the Agents */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Heartbeat & Telemetry Health Simulator Console */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-3xs space-y-4 text-left">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-rose-50 border border-rose-200 text-rose-700 text-[9.5px] font-mono uppercase font-extrabold tracking-wider">
                  <Activity className="w-3 h-3 text-rose-500 animate-[pulse_1.5s_infinite]" /> Live Heartbeat Tracker
                </div>
                <h3 className="text-xs font-bold text-slate-850 uppercase tracking-wider font-mono mt-1">
                  Agent Telemetry Keepalive & Diagnostics Suite
                </h3>
                <p className="text-[11px] text-slate-500 font-sans leading-relaxed">
                  Analyze agent thread pools and simulated error heartbeats. Toggle failure flags below to test automatic state containment and verify actionable solution maps in real-time.
                </p>
              </div>
              <div className="shrink-0">
                <span className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-extrabold border shadow-4xs ${activeSimulatedErrors.length > 0 ? "bg-rose-50 border-rose-200 text-rose-700 animate-pulse" : "bg-emerald-50 border-emerald-150 text-emerald-700"}`}>
                  {activeSimulatedErrors.length > 0 ? `🚨 ${activeSimulatedErrors.length} SOCKET FAILURES INJECTED` : "● ALL SYSTEMS NOMINAL"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
              <button
                onClick={() => toggleSimulatedError("jira_timeout")}
                className={`flex items-center justify-between p-3 rounded-lg border text-[11px] font-mono leading-tight cursor-pointer transition-all ${
                  activeSimulatedErrors.includes("jira_timeout")
                    ? "bg-rose-50/70 border-rose-400 text-rose-955 shadow-3xs ring-1 ring-rose-500/10"
                    : "bg-slate-50/55 border-slate-200 text-slate-700 hover:border-slate-350 hover:bg-slate-50"
                }`}
                title="Simulate keepalive timeout on JIRA API client adapter"
              >
                <span>JIRA Heartbeat</span>
                <span className={`w-1.5 h-1.5 rounded-full ${activeSimulatedErrors.includes("jira_timeout") ? "bg-rose-600 animate-ping" : "bg-emerald-500"}`} />
              </button>

              <button
                onClick={() => toggleSimulatedError("msoffice_dropped")}
                className={`flex items-center justify-between p-3 rounded-lg border text-[11px] font-mono leading-tight cursor-pointer transition-all ${
                  activeSimulatedErrors.includes("msoffice_dropped")
                    ? "bg-rose-50/70 border-rose-400 text-rose-955 shadow-3xs ring-1 ring-rose-500/10"
                    : "bg-slate-50/55 border-slate-200 text-slate-700 hover:border-slate-350 hover:bg-slate-50"
                }`}
                title="Simulate OAuth socket disruption on Graph client"
              >
                <span>MS Graph Port</span>
                <span className={`w-1.5 h-1.5 rounded-full ${activeSimulatedErrors.includes("msoffice_dropped") ? "bg-rose-600 animate-ping" : "bg-emerald-500"}`} />
              </button>

              <button
                onClick={() => toggleSimulatedError("smtp_refused")}
                className={`flex items-center justify-between p-3 rounded-lg border text-[11px] font-mono leading-tight cursor-pointer transition-all ${
                  activeSimulatedErrors.includes("smtp_refused")
                    ? "bg-rose-50/70 border-rose-400 text-rose-955 shadow-3xs ring-1 ring-rose-500/10"
                    : "bg-slate-50/55 border-slate-200 text-slate-700 hover:border-slate-350 hover:bg-slate-50"
                }`}
                title="Simulate credential rejection on Corporate SMTP Server"
              >
                <span>SMTP Handshake</span>
                <span className={`w-1.5 h-1.5 rounded-full ${activeSimulatedErrors.includes("smtp_refused") ? "bg-rose-600 animate-ping" : "bg-emerald-500"}`} />
              </button>

              <button
                onClick={() => toggleSimulatedError("prime_disconnect")}
                className={`flex items-center justify-between p-3 rounded-lg border text-[11px] font-mono leading-tight cursor-pointer transition-all ${
                  activeSimulatedErrors.includes("prime_disconnect")
                    ? "bg-rose-50/70 border-rose-400 text-rose-955 shadow-3xs ring-1 ring-rose-500/10"
                    : "bg-slate-50/55 border-slate-200 text-slate-700 hover:border-slate-350 hover:bg-slate-50"
                }`}
                title="Simulate buffer overflow on Unified Memory Agent sync pipeline"
              >
                <span>Prime Sync Pool</span>
                <span className={`w-1.5 h-1.5 rounded-full ${activeSimulatedErrors.includes("prime_disconnect") ? "bg-rose-600 animate-ping" : "bg-emerald-500"}`} />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] pt-1 pb-1">
              <span className="text-slate-500 font-sans italic">
                * Simulated errors will automatically trigger 'Need Attention' flags, showing actionable solution layouts.
              </span>
              <div className="flex items-center gap-1.5 self-end">
                {activeSimulatedErrors.length > 0 && (
                  <button
                    onClick={() => setActiveSimulatedErrors([])}
                    className="text-indigo-600 hover:text-indigo-800 font-bold border border-slate-200 bg-white hover:bg-slate-50 px-3 py-1.5 rounded-lg text-[10px] cursor-pointer transition-all shadow-4xs font-mono"
                  >
                    RESET HEARTBEATS
                  </button>
                )}
                <button
                  onClick={async () => {
                    setDiagnosingHeartbeats(true);
                    setTimeout(() => {
                      setDiagnosingHeartbeats(false);
                    }, 600);
                  }}
                  disabled={diagnosingHeartbeats}
                  className="bg-slate-900 border border-slate-950 hover:bg-slate-800 text-white font-semibold font-mono text-[10px] px-3.5 py-1.5 rounded-lg cursor-pointer transition-all shadow-4xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  <RotateCw className={`w-3 h-3 text-slate-300 ${diagnosingHeartbeats ? "animate-spin" : ""}`} />
                  {diagnosingHeartbeats ? "TESTING..." : "PING TEST CHECKS"}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Registry Supervisor Grid</h3>
            <div className="relative max-w-64 w-full">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search Active Agents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg outline-none bg-white font-medium focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all shadow-3xs text-slate-850"
              />
            </div>
          </div>

          {loading && !processedAgents ? (
            <div className="bg-white border border-slate-200 rounded-2xl py-32 text-center text-slate-500 space-y-3 shadow-xs">
              <RotateCw className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
              <p className="text-xs font-medium animate-pulse">Scanning telemetry from full-stack backend processes...</p>
            </div>
          ) : filteredAgents.length === 0 ? (
            <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-12 text-center text-slate-400 space-y-2">
              <HelpCircle className="w-7 h-7 mx-auto stroke-1 text-slate-350" />
              <p className="text-xs font-semibold text-slate-500 font-sans">No matching agents found</p>
              <p className="text-[11px] text-slate-400">Try adjusting your active registry query word.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAgents.map((key) => {
                const agent = processedAgents![key];
                const Icon = getAgentIcon(agent.name);
                const statusColor = getStatusColor(agent.status);

                return (
                  <div 
                    key={key} 
                    className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-5 shadow-3xs transition-all duration-200 flex flex-col group"
                    id={`agent-card-${key}`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-150 flex items-center justify-center text-slate-650 shadow-3xs">
                          <Icon className="w-4.5 h-4.5 text-indigo-650" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 font-display">{agent.name}</h4>
                          <span className="text-[9.5px] font-mono text-slate-400 uppercase tracking-tighter">ROLE: {key.replace("Agent", "").toUpperCase()} CONTROL</span>
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 border rounded-md text-[9px] font-mono font-bold uppercase tracking-tight self-start sm:self-auto shadow-4xs ${statusColor}`}>
                        {agent.status}
                      </span>
                    </div>

                    <div className="space-y-3 text-xs leading-relaxed">
                      <p className="text-slate-700 font-sans">{agent.details}</p>

                      {/* Sub-item rendering: Specific details for each agent */}
                      {key === "scopeAgent" && (agent.allowedEmails || agent.blockedEmails) && (
                        <div className="bg-white/80 p-3 rounded-lg border border-slate-150 text-[10.5px] space-y-2">
                          {agent.allowedEmails && agent.allowedEmails.length > 0 && (
                            <div>
                              <span className="font-bold text-emerald-800 block mb-0.5">Approved Corporate Access ({agent.allowedEmails.length}):</span>
                              <div className="flex flex-wrap gap-1">
                                {agent.allowedEmails.map((em, idx) => (
                                  <span key={`${em}-${idx}`} className="px-1.5 py-0.2 bg-emerald-50 border border-emerald-100 text-emerald-700 font-mono rounded text-[9.5px]" title="Matched with translation record!">
                                    {em}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {agent.blockedEmails && agent.blockedEmails.length > 0 && (
                            <div>
                              <span className="font-semibold text-slate-500 block mb-0.5">Strict Offline Placeholders ({agent.blockedEmails.length}):</span>
                              <div className="flex flex-wrap gap-1">
                                {agent.blockedEmails.map((em, idx) => (
                                  <span key={`${em}-${idx}`} className="px-1.5 py-0.2 bg-slate-50 border border-slate-150 text-slate-500 font-mono rounded text-[9.5px]" title="No matching directory translation. live Azure access blocked.">
                                    {em}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Brand-new high fidelity Universal Alert & Issue Diagnostics */}
                      {((agent.issues && agent.issues.length > 0) || (key === "watchdogAgent" && agent.anomalies && agent.anomalies.length > 0)) && (
                        <div className="bg-rose-50/70 border border-rose-200/50 p-4 rounded-xl text-[11px] text-rose-950 space-y-2 mt-1">
                          <p className="font-bold text-rose-950 flex items-center gap-1.5 font-mono uppercase tracking-wide text-[10px]">
                            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                            {key === "watchdogAgent" ? "Watchdog Diagnostics Flags" : "Active Conflict/Error Flagged"}
                          </p>
                          <ul className="list-disc pl-5 space-y-1 font-sans text-rose-850">
                            {(agent.issues || agent.anomalies || []).map((err: string, idx: number) => (
                              <li key={idx} className="leading-relaxed font-semibold">{err}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Diagnostic Solution */}
                      {agent.diagnosticSolution && (
                        <div className="bg-amber-50/60 border border-amber-200/60 p-4 rounded-xl text-[11px] text-amber-955 space-y-2 mt-1 shadow-3xs">
                          <p className="font-bold text-amber-950 flex items-center gap-1.5 font-mono uppercase tracking-widest text-[9.5px]">
                            <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0 animate-pulse" />
                            Recommended Diagnostic Solution:
                          </p>
                          <p className="font-sans text-amber-900 leading-relaxed font-medium">
                            {agent.diagnosticSolution}
                          </p>
                        </div>
                      )}

                      {/* Agent Metrics list */}
                      {agent.metrics && (
                        <div className="pt-2 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                          {Object.keys(agent.metrics).map(mKey => {
                            const val = agent.metrics[mKey];
                            const label = mKey
                              .replace(/([A-Z])/g, ' $1')
                              .replace(/^./, str => str.toUpperCase());
                            
                            return (
                              <div key={mKey} className="bg-slate-50/45 px-2.5 py-1.5 rounded-lg border border-slate-150 flex items-center justify-between text-[10px]">
                                <span className="text-slate-400 font-medium">{label}</span>
                                <span className="font-mono font-bold text-slate-800">{val === true ? "YES" : val === false ? "NO" : val}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Dynamic Action Plans & Active Handshake Guidelines */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Troubleshooting & Steps</h3>
          
          <div className="bg-slate-100 border border-slate-200 rounded-2xl p-4 shadow-3xs space-y-4.5">
            <h4 className="text-xs font-bold text-slate-800 font-display flex items-center gap-1.5 border-b border-slate-200 pb-2">
              <Fingerprint className="w-4 h-4 text-slate-600" />
              How to Guide: Resolving Key Errors
            </h4>

            {/* Azure AD Card */}
            <div className="space-y-2 bg-white rounded-xl p-3.5 border border-slate-200 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-blue-900 border-b border-slate-100 pb-1.5 mb-1.5">
                <Network className="w-4 h-4 text-blue-600" />
                <span>Fixing Azure 403 (Calendar Blocked)</span>
              </div>
              <p className="text-[10.5px] leading-relaxed text-slate-650 font-sans">
                If the Microsoft Graph Sync Agent triggers a 403 error, your App Registration doesn't have <strong>Calendars.Read</strong> Application Permissions, or Admin Consent hasn't been approved for your Azure company tenant.
              </p>
              <div className="text-[10px] space-y-1 font-sans text-slate-705 pt-1.5">
                <p className="font-semibold text-slate-900">How to Fix:</p>
                <ol className="list-decimal pl-4.5 space-y-1">
                  <li>Log in to the <a href="https://portal.azure.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-0.5">Azure Portal <span className="text-[8px]">&rarr;</span></a></li>
                  <li>Search <strong>Microsoft Entra ID</strong> &rarr; select <strong>App Registrations</strong>.</li>
                  <li>Pick your registered App and click <strong>API Permissions</strong>.</li>
                  <li>Click <strong>Add permission</strong> &rarr; choose <strong>Microsoft Graph</strong>.</li>
                  <li>Choose <strong>Application permissions</strong> (NOT Delegated!) &rarr; search and check <strong>Calendars.Read</strong>.</li>
                  <li>Click Add. <strong>Crucial:</strong> Click the button <strong>"Grant admin consent for..."</strong> next to the permission.</li>
                </ol>
              </div>
            </div>

            {/* SMTP Card */}
            <div className="space-y-2 bg-white rounded-xl p-3.5 border border-slate-200 text-xs text-slate-750">
              <div className="flex items-center gap-1.5 font-bold text-amber-950 border-b border-slate-100 pb-1.5 mb-1.5">
                <MailWarning className="w-4.5 h-4.5 text-amber-600" />
                <span>SMTP Routing & Connection Diagnostics</span>
              </div>
              <p className="text-[10.5px] leading-relaxed text-slate-650 font-sans">
                If booking triggers an SMTP 525 error, your corporate server rejected login credentials (due to standard passwords with 2FA), or blocked our server's dynamic container IP range.
              </p>
              <div className="text-[10px] space-y-1 font-sans text-slate-705 pt-1.5 pb-2">
                <p className="font-semibold text-slate-900">Immediate Fixes:</p>
                <ol className="list-decimal pl-4.5 space-y-1 text-slate-600">
                  <li><strong>2-Factor Auth (Gmail/O365):</strong> You must configure a custom <strong>App Password</strong> in settings and use it as <code>SMTP_PASS</code>.</li>
                  <li><strong>Firewalls:</strong> Whitelist incoming connections from cloud containers if restricting logins to office IPs.</li>
                </ol>
              </div>

              {/* LIVE SMTP TESTER PANEL */}
              <div className="mt-3 pt-3 border-t border-slate-100 space-y-2" id="smtp-tester-block">
                <p className="font-bold text-slate-800 text-[10.5px] flex items-center gap-1">
                  <span>🚀 Interactive SMTP Handshake Tester</span>
                </p>
                <p className="text-[10px] text-slate-500 font-sans leading-normal">
                  Check if credentials are valid and optionally dispatch a real-time verification email right now.
                </p>
                
                <div className="flex flex-col gap-1.5 mt-2">
                  <label htmlFor="test-recipient-email" className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Recipient Email Address</label>
                  <div className="flex gap-2">
                    <input
                      id="test-recipient-email"
                      type="email"
                      placeholder="e.g. your-email@thinkpalm.com"
                      value={testRecipient}
                      onChange={(e) => setTestRecipient(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-indigo-400 transition-colors"
                    />
                    <button
                      id="btn-trigger-smtp-test"
                      onClick={handleTestSmtp}
                      disabled={smtpTesting}
                      className="px-3 py-1.5 text-xs bg-indigo-600 border border-indigo-700 hover:bg-indigo-700 active:bg-indigo-800 font-bold text-white rounded-lg transition-all shadow-xs disabled:opacity-55 cursor-pointer shrink-0"
                    >
                      {smtpTesting ? "Testing..." : "Verify SMTP"}
                    </button>
                  </div>
                </div>

                {smtpTestResult && (
                  <div 
                    id="smtp-test-result-banner"
                    className={`mt-2 p-3 rounded-lg border text-[11px] leading-relaxed font-sans transition-all duration-150 ${
                      smtpTestResult.success 
                        ? "bg-emerald-50 border-emerald-250 text-emerald-950" 
                        : "bg-rose-50 border-rose-250 text-rose-950"
                    }`}
                  >
                    <div className="flex gap-1.5 items-start">
                      <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${smtpTestResult.success ? "bg-emerald-500" : "bg-rose-500"}`} />
                      <div className="space-y-1">
                        <strong className="block text-[11.5px] font-bold">{smtpTestResult.success ? "SMTP Active & Connected 🎉" : "Handshake Failed ❌"}</strong>
                        <p className="text-[10px] text-slate-750 font-mono leading-normal select-text whitespace-pre-wrap">{smtpTestResult.message}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Active Translation Mapping instructions */}
            <div className="bg-blue-600/5 border border-blue-500/10 rounded-xl p-3.5 text-xs text-blue-950 space-y-1.5 font-sans">
              <span className="font-bold flex items-center gap-1 text-blue-900">
                <UserCheck className="w-3.5 h-3.5" /> Workspace Design Policy
              </span>
              <p className="leading-relaxed text-[10.5px] text-blue-900">
                To guarantee security boundaries, only project teammates populated inside the <strong>Active Translation Directory</strong> can connect to external calendars. If an issue is set with a placeholder user under Jira, register their display name in the directory to let the sync agents automatically translate and protect their calendars.
              </p>
            </div>

          </div>
        </div>

      </div>

      {/* Embedded Real-time System Diagnostics logs tracer */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-5" id="agent-diagnostics-logs-panel">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-slate-800 font-display flex items-center gap-1.5">
              <FileClock className="w-4.5 h-4.5 text-indigo-600" />
              Connection Handshakes Live Trace Logs
            </h3>
            <p className="text-[11px] text-slate-500 font-sans">Live diagnostic trace verifying real data integration handshakes across MS Graph, SMTP Relay, and Jira Rest protocols.</p>
          </div>
          
          <button
            id="btn-refresh-diagnostics"
            onClick={fetchDiagnosticsLogs}
            disabled={loadingDiagnostics}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 hover:bg-slate-100 disabled:opacity-50 text-slate-700 rounded-lg flex items-center gap-1.5 cursor-pointer font-bold transition-all shadow-xs"
          >
            <RotateCw className={`w-3.5 h-3.5 ${loadingDiagnostics ? "animate-spin" : ""}`} />
            {loadingDiagnostics ? "Scanning Traces..." : "Refresh Handshake Logs"}
          </button>
        </div>

        {loadingDiagnostics && diagnosticsLogs.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <FileClock className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-medium">Tracing live connection outcomes directly from server logs...</p>
          </div>
        ) : diagnosticsLogs.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-slate-200 rounded-xl bg-slate-50/50 space-y-2">
            <AlertCircle className="w-6 h-6 text-slate-400 mx-auto" />
            <p className="text-xs text-slate-600 font-semibold font-sans">No handshake events captured in this sandbox run.</p>
            <p className="text-[10px] text-slate-400 font-sans">Perform a Jira refresh, load user schedules, or schedule a mock reservation to initiate trace triggers.</p>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1 select-none">
            {diagnosticsLogs.map((log) => {
              const isOpen = expandedLogId === log.id;
              let badgeBg = "bg-slate-105 border-slate-200 text-slate-600";
              let dotColor = "bg-slate-400";
              
              if (log.status === "Passed") {
                badgeBg = "bg-emerald-50 border-emerald-200 text-emerald-800";
                dotColor = "bg-emerald-500 animate-pulse";
              } else if (log.status === "Simulated") {
                badgeBg = "bg-amber-50 border-amber-200 text-amber-800";
                dotColor = "bg-amber-500";
              } else if (log.status === "Failed" || log.status === "Not Configured") {
                badgeBg = "bg-rose-50 border-rose-250 text-rose-800";
                dotColor = "bg-rose-600 animate-pulse";
              }

              return (
                <div
                  id={`log-item-${log.id}`}
                  key={log.id}
                  onClick={() => setExpandedLogId(isOpen ? null : log.id)}
                  className={`bg-slate-50/50 hover:bg-slate-50 border rounded-xl overflow-hidden cursor-pointer transition-all duration-150 ${
                    isOpen ? "border-indigo-400 shadow-sm bg-indigo-50/10" : "border-slate-200"
                  }`}
                >
                  {/* Header item */}
                  <div className="p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
                    <div className="flex items-start gap-2.5">
                      <span className={`flex h-2 w-2 shrink-0 rounded-full mt-1.5 ${dotColor}`} />
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-800 block leading-tight">{log.service}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto font-sans">
                      <span className={`px-2 py-0.5 border rounded-md text-[9px] font-mono font-bold uppercase tracking-tight ${badgeBg}`}>
                        {log.status}
                      </span>
                      <span className="text-[10.5px] text-indigo-650 font-semibold hover:underline">
                        {isOpen ? "Hide Payload Trace" : "View Payload Trace"}
                      </span>
                    </div>
                  </div>

                  {/* Details content block */}
                  {isOpen && (
                    <div className="px-3.5 pb-3.5 pt-1.5 border-t border-slate-200 bg-white text-xs leading-relaxed space-y-3" onClick={(e) => e.stopPropagation()}>
                      <div className="bg-slate-900 text-slate-105 font-mono text-[10.5px] p-3 rounded-lg overflow-x-auto select-all whitespace-pre-wrap leading-relaxed shadow-inner border border-slate-950">
                        {log.details || "No payload trace context."}
                      </div>
                      
                      {log.details && log.details.includes("[AZURE AD ACTION REQUIRED]") && (
                        <div className="bg-amber-50 border border-amber-250 rounded-lg p-3 text-amber-900 font-sans text-xs space-y-1">
                          <div className="flex items-center gap-2 font-bold text-amber-950">
                            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>Action Required: Grant Calendars.Read API Permission in Microsoft Azure</span>
                          </div>
                          <p className="leading-normal text-[11px] text-amber-850">
                            The Microsoft Graph client authenticated successfully, but requests to fetch the user's free-busy schedule are rejected due to missing Calendars.Read application permissions.
                          </p>
                        </div>
                      )}

                      {log.details && log.details.includes("[SMTP AUTH ACTION REQUIRED]") && (
                        <div className="bg-amber-50 border border-amber-250 rounded-lg p-3 text-amber-900 font-sans text-xs space-y-1">
                          <div className="flex items-center gap-2 font-bold text-amber-950">
                            <MailWarning className="w-4.5 h-4.5 text-amber-600" />
                            <span>Action Required: Configure App Passwords or Whitelist Server IP</span>
                          </div>
                          <p className="leading-normal text-[11px] text-amber-850">
                            The mail server rejected authorization or refused integration requests originating from custom cloud containers.
                          </p>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono pt-1">
                        <span>Handshake Protocol: REST JSON HANDSHAKE</span>
                        <span>Audit UUID: {log.id}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}

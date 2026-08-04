import React, { useState, useEffect } from 'react';
import { 
  Brain, Search, Sparkles, Quote, Check, Globe, 
  Calendar, Clock, User, Users, Cpu, Zap, 
  ChevronRight, BookOpen, Layers, Video, MapPin, 
  Send, MessageSquare, ShieldCheck, Activity, Languages,
  GitCommit, ArrowRight, CornerDownRight, CheckSquare, AlertCircle,
  Network, Terminal, Database, ShieldAlert, RotateCw,
  Cable, Share2, UserCheck, Mail
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Meeting, Project, TeamMember } from '../types';
import { API_URL } from '../config/api';

interface TheBrainProps {
  meetings: Meeting[];
  projects?: Project[];
  members?: TeamMember[];
  onRefreshData?: () => Promise<void>;
}

// Generate realistic simulated user stories matching each project key
function getSimulatedUserStories(projectKey: string): { id: string; title: string; points: number; status: 'To Do' | 'In Progress' | 'Done'; assigneeName: string }[] {
  const normalized = (projectKey || "").toUpperCase();
  if (normalized === "TITAN") {
    return [
      { id: "TITAN-101", title: "Refactor Container Ingress Router to support port 3000 mapping", points: 8, status: "Done", assigneeName: "Sarah Connor" },
      { id: "TITAN-102", title: "Integrate Google GenAI Client with lazy initialization", points: 5, status: "In Progress", assigneeName: "David Chen" },
      { id: "TITAN-103", title: "Build robust security proxy for third-party API key protection", points: 13, status: "To Do", assigneeName: "Aisha Rahman" },
      { id: "TITAN-104", title: "Implement comprehensive fallback for permission denied error loops", points: 5, status: "Done", assigneeName: "Elena Rostova" }
    ];
  } else if (normalized === "PHN" || normalized === "PHOENIX") {
    return [
      { id: "PHN-201", title: "Craft premium glassmorphism landing view with sleek animations", points: 5, status: "Done", assigneeName: "Marcus Wright" },
      { id: "PHN-202", title: "Create responsive layouts with fluid touch support for mobile", points: 3, status: "In Progress", assigneeName: "Elena Rostova" },
      { id: "PHN-203", title: "Establish semantic web accessibility mappings across data hubs", points: 8, status: "To Do", assigneeName: "David Chen" }
    ];
  } else if (normalized === "ODY" || normalized === "ODYSSEY") {
    return [
      { id: "ODY-301", title: "Instate D3.js and Recharts modules for real-time telemetry", points: 13, status: "Done", assigneeName: "Julian Vester" },
      { id: "ODY-302", title: "Construct database sync state checkers for corporate network logs", points: 8, status: "In Progress", assigneeName: "Sarah Connor" },
      { id: "ODY-303", title: "Model dynamic charts for multi-tenant analytics dashboard metrics", points: 5, status: "Done", assigneeName: "Aisha Rahman" }
    ];
  }
  // Generic fallback stories
  return [
    { id: `${normalized}-401`, title: "Map external project epics with localized story parameters", points: 5, status: "Done", assigneeName: "Ajayaghosh B" },
    { id: `${normalized}-402`, title: "Analyze Teams presence variables inside communication bridges", points: 3, status: "In Progress", assigneeName: "Team Member" },
    { id: `${normalized}-403`, title: "Validate sprint milestone completions against database states", points: 8, status: "To Do", assigneeName: "System Lead" }
  ];
}

interface SampleQA {
  q: string;
  a: string;
}

const PROJECT_KNOWLEDGE: Record<string, {
  summary: string;
  insights: string[];
  qa: SampleQA[];
}> = {
  "TITAN": {
    summary: "Project Titan is an infrastructure and security sub-grid designed to securely refactor container configuration mappings. It establishes resilient server-side proxy layers and protects sensitive keys, ensuring compliance with sandboxed runtime constraints.",
    insights: [
      "Secure API proxy channels are being engineered to shield secrets like Google GenAI from client-side exposure.",
      "Router modifications on Port 3000 are essential for aligning container ingress routing behind reverse-proxy layers.",
      "Elena Rostova is actively designing defensive wrapper logic to capture and gracefully resolve permission error loops."
    ],
    qa: [
      { q: "Who is working on the Port 3000 container ingress routing?", a: "Sarah Connor has been assigned TITAN-101 to refactor the Container Ingress Router to support appropriate Port 3000 mappings." },
      { q: "How is the Gemini API key secured in this project?", a: "TITAN-103 mandates a robust security proxy. To prevent browser exposure, the system uses server-side token validation under Aisha Rahman's security protocol." },
      { q: "What is David Chen's current objective?", a: "David Chen is working on TITAN-102, integrating the Google GenAI Client with lazy initialization components to prevent cold boot issues." }
    ]
  },
  "PHN": {
    summary: "Project Phoenix is a high-density client-front experience overhaul. It implements highly responsive glassmorphic card grids, fluid touch adaptations for mobile, and semantic ARIA structural linkages across navigation channels.",
    insights: [
      "Marcus Wright is leading the premium visual landing cards styled using high-contrast slate aesthetics.",
      "Elena Rostova is resolving layout snapping issues and touch delays on medium-size viewport frames.",
      "David Chen is executing accessibility crawls to map semantic headers to automated audio aids."
    ],
    qa: [
      { q: "What is the status of the mobile touch interface design?", a: "PHN-202 is currently In Progress under Elena Rostova. She is streamlining card swipe delays and fluid resizing structures." },
      { q: "Who is in charge of accessibility standards?", a: "David Chen is currently assigned PHN-203 (To Do), mapping semantic web pathways and screen-reader accessibility layers." },
      { q: "What UI components are being redesigned?", a: "Marcus Wright is finalizing PHN-201, a premium glassmorphic landing deck with dynamic entry animations to replace legacy cards." }
    ]
  },
  "PHOENIX": {
    summary: "Project Phoenix is a high-density client-front experience overhaul. It implements highly responsive glassmorphic card grids, fluid touch adaptations for mobile, and semantic ARIA structural linkages across navigation channels.",
    insights: [
      "Marcus Wright is leading the premium visual landing cards styled using high-contrast slate aesthetics.",
      "Elena Rostova is resolving layout snapping issues and touch delays on medium-size viewport frames.",
      "David Chen is executing accessibility crawls to map semantic headers to automated audio aids."
    ],
    qa: [
      { q: "What is the status of the mobile touch interface design?", a: "PHOENIX-201 or secondary items are being refined. PHN-202 is currently In Progress under Elena Rostova. She is streamlining card swipe delays and fluid resizing structures." },
      { q: "Who is in charge of accessibility standards?", a: "David Chen is currently assigned PHN-203 (To Do), mapping semantic web pathways and screen-reader accessibility layers." },
      { q: "What UI components are being redesigned?", a: "Marcus Wright is finalizing PHN-201, a premium glassmorphic landing deck with dynamic entry animations to replace legacy cards." }
    ]
  },
  "ODY": {
    summary: "Project Odyssey maps high-fidelity workspace telemetry. Utilizing custom D3.js and responsive Recharts modules, the team creates state charts, live event monitors, and persistent tracking logs.",
    insights: [
      "Julian Vester is heading D3.js module integration for custom telemetry graphs.",
      "Sarah Connor ensures real-time database write checks to verify that external Jiras stay in lock-step.",
      "Aisha Rahman coordinates structural elements for a sleek, responsive dashboard stage."
    ],
    qa: [
      { q: "What charting libraries are selected for this dashboard?", a: "ODY-301 defines standard D3.js and Recharts implementations configured by Julian Vester to output fluid, lightweight vector charts." },
      { q: "What is Sarah Connor's task?", a: "Sarah Connor is resolving ODY-302 (In Progress), crafting system state checkers to handle connection drops without crashing client memory." }
    ]
  },
  "ODYSSEY": {
    summary: "Project Odyssey maps high-fidelity workspace telemetry. Utilizing custom D3.js and responsive Recharts modules, the team creates state charts, live event monitors, and persistent tracking logs.",
    insights: [
      "Julian Vester is heading D3.js module integration for custom telemetry graphs.",
      "Sarah Connor ensures real-time database write checks to verify that external Jiras stay in lock-step.",
      "Aisha Rahman coordinates structural elements for a sleek, responsive dashboard stage."
    ],
    qa: [
      { q: "What charting libraries are selected for this dashboard?", a: "ODY-301 defines standard D3.js and Recharts implementations configured by Julian Vester to output fluid, lightweight vector charts." },
      { q: "What is Sarah Connor's task?", a: "Sarah Connor is resolving ODY-302 (In Progress), crafting system state checkers to handle connection drops without crashing client memory." }
    ]
  }
};

const DEFAULT_KNOWLEDGE = {
  summary: "A newly indexed repository. DMN has analyzed external Jira issue keys, calculated story points, tracked assignees, and mapped sprint priorities.",
  insights: [
    "External story parameters are being mapped into local variables under Ajayaghosh B.",
    "System verification pathways monitor active databases to verify that milestones match current states.",
    "Project status tracking utilizes lightweight client local state persistence."
  ],
  qa: [
    { q: "Who is the lead on story translations?", a: "Ajayaghosh B is spearheading the localized sprint parameter translations." },
    { q: "What is the main task?", a: "Validating that database records are persistent and synchronization matches sprint milestones." }
  ]
};

interface SynapseFeatureNode {
  id: string;
  name: string;
  project: string; // "PHOENIX", "TITAN", "ODYSSEY"
  role: string;
  status: 'online' | 'syncing' | 'offline' | 'audit_mode';
  description: string;
  jiraStory: string; // e.g. "PHN-42"
  points: number;
  assignee: string; // "Sarah Connor", "Alex Mercer", etc.
  connections: string[]; // connects to what other entities
  flowStep: string;
  flowDesc: string;
  technicalDetails: string;
}

const CrewSynapseData: SynapseFeatureNode[] = [
  {
    id: "onboarding",
    name: "Crew Onboarding Protocol",
    project: "TITAN",
    role: "Candidate Intake & Screening",
    status: "online",
    description: "Vets maritime candidate background logs, passport clearance data, physical stamina screenings, and active visa endorsements prior to vessel assignment.",
    jiraStory: "TITAN-41: Automatic Merchant Marine Background Vetting",
    points: 8,
    assignee: "Sarah Connor",
    connections: ["certification", "management"],
    flowStep: "Step 1: Onshore Intake",
    flowDesc: "New marine officers submit biometric profiles onshore. Titan triggers automatic cross-reference against international maritime agency clearance lists.",
    technicalDetails: "Titan database engines lazy-initialize external vetting links securely on local host bindings."
  },
  {
    id: "certification",
    name: "Crew Certification Vetting",
    project: "TITAN",
    role: "License Authorization Engine",
    status: "syncing",
    description: "Tracks, audits, and validates mandatory international licenses (STCW, marine safety licenses, GMDSS radio operator status, medical fitness certs).",
    jiraStory: "TITAN-45: STCW License Expiry Monitor Daemon",
    points: 5,
    assignee: "David Miller",
    connections: ["onboarding", "insurance", "login"],
    flowStep: "Step 2: Sea-Duty Clearance Vetting",
    flowDesc: "Validates active credentials. If any STCW certificates are expired, Titan routes blockages to the dispatcher to prevent active scheduling.",
    technicalDetails: "Continuous DB handshake models verify credentials validity logs within 45ms loops."
  },
  {
    id: "insurance",
    name: "Crew Medical & Insurance Core",
    project: "TITAN",
    role: "Risk & Protection Registry",
    status: "online",
    description: "Binds active sailors with P&I Club indemnity limits, health plans, offshore sickness repatriation schedules, and liability bounds.",
    jiraStory: "TITAN-12: P&I Club Policy Automated Binder Rule",
    points: 5,
    assignee: "David Miller",
    connections: ["certification", "management"],
    flowStep: "Step 3: Liability & Risk Binding",
    flowDesc: "Each onboard assignation generates dynamic insurance binders, checking sea readiness against medical profiles.",
    technicalDetails: "Safe endpoint mappings in Titan prevent any public leak of confidential medical records."
  },
  {
    id: "management",
    name: "Crew Roster Management",
    project: "TITAN",
    role: "Fleet Watch Schedule Router",
    status: "online",
    description: "Arranges duty assignments, watch-stand hours, bed allocations, and ensures rest ratios strictly respect international MLC 2006 guidelines.",
    jiraStory: "TITAN-19: Build Dynamic watch-standing rosters",
    points: 13,
    assignee: "Sarah Connor",
    connections: ["onboarding", "rules", "timesheet"],
    flowStep: "Step 4: Shift Assignments",
    flowDesc: "Allocates personnel into watch squads (Deck, Engine, Command). Directly synchronizes watch durations into Phoenix terminals.",
    technicalDetails: "Renders highly comprehensive roster states inside Titan's high-density desktop dashboards."
  },
  {
    id: "login",
    name: "Crew Terminal Login",
    project: "PHOENIX",
    role: "Command Deck Authentication",
    status: "online",
    description: "Secure terminal entry point on board. Allows sailors to authenticate at command bridge consoles via military-grade multi-factor hardware keys.",
    jiraStory: "PHN-12: Secure Crew Authentication Layer",
    points: 3,
    assignee: "Sarah Connor",
    connections: ["certification", "rules", "app"],
    flowStep: "Step 5: Bridge Check-In",
    flowDesc: "Active officer clocks onto shift at physical console. Login signals route through Titan proxies to verify session authorizations.",
    technicalDetails: "Phoenix secures passwords through server-side Argon2 hashes behind Port 3000 integrations."
  },
  {
    id: "rules",
    name: "Crew Rules & Safety Policies",
    project: "PHOENIX",
    role: "Onboard Compliance Enforcer",
    status: "online",
    description: "Ensures personnel understand vessel emergency muster directories, hazardous deck regulations, and coordinates automated drill schedules.",
    jiraStory: "PHN-8: Onboard Muster Station Assignment Engine",
    points: 5,
    assignee: "Alex Mercer",
    connections: ["login", "management", "timesheet"],
    flowStep: "Step 6: Onboard Drill Compliance",
    flowDesc: "Triggers safety alert widgets on client stations, requiring crew to confirm hazardous work permit checkmarks before duty shifts.",
    technicalDetails: "Phoenix synchronizes alarm signals with emergency consoles using instant local push sockets."
  },
  {
    id: "app",
    name: "Crew Companion App",
    project: "PHOENIX",
    role: "Personnel Frontline Mobility",
    status: "syncing",
    description: "Compact client companion interface for crew members' personal mobile devices. Logs shift handovers, cabin requests, and daily rest times.",
    jiraStory: "PHN-33: Local Cache for Phoenix Mobile Companion UI",
    points: 8,
    assignee: "Alex Mercer",
    connections: ["login", "timesheet"],
    flowStep: "Step 7: Personal Taskboard Sync",
    flowDesc: "Provides messmenus, safety drills, and sleep log trackers. Mariners can use the client-side app offline during high-sea voyages.",
    technicalDetails: "Leverages React local state arrays to sync dirty queue objects back onto servers on port 3000."
  },
  {
    id: "timesheet",
    name: "Crew Timesheet Ledger",
    project: "ODYSSEY",
    role: "Work hours & rest auditor",
    status: "syncing",
    description: "Enforces strict limits against operator exhaust. Records exact work shifts, keeping safe resting hours audit logs to defend maritime union rules.",
    jiraStory: "ODY-24: Dynamic Mariners Fatigue & Rest Indexer",
    points: 8,
    assignee: "Aisha Rahman",
    connections: ["management", "rules", "salary", "spends"],
    flowStep: "Step 8: Sleep & Labor Audit",
    flowDesc: "Binds logged work durations with ship telemetry, tracking exact times of operations across global clock boundaries.",
    technicalDetails: "Executes rich data visualizations of duty durations inside Odyssey's Recharts tables."
  },
  {
    id: "salary",
    name: "Crew Salary & Payroll",
    project: "ODYSSEY",
    role: "Overtime & Econ Calculator",
    status: "online",
    description: "Translates ledger hours into direct payouts, calculating dynamic overtime factors, hazardous region bonuses, union dues, and tax plans.",
    jiraStory: "ODY-7: Multi-currency Port Bounty Payroll System",
    points: 13,
    assignee: "Aisha Rahman",
    connections: ["timesheet", "spends"],
    flowStep: "Step 9: Direct Payroll Routing",
    flowDesc: "Assembles monthly wage metrics, factoring in dynamic maritime overtime indices, initiating automatic bank transfers.",
    technicalDetails: "Executes backend batch transactions safely utilizing secure database credentials."
  },
  {
    id: "spends",
    name: "Crew Operational Spends",
    project: "ODYSSEY",
    role: "Expense & slop-chest registry",
    status: "audit_mode",
    description: "Audits cellular communication allocations, emergency cash advances, and duty-free slop-chest purchases directly from payroll.",
    jiraStory: "ODY-9: Shipboard Cash Advance Ledger Config",
    points: 5,
    assignee: "Aisha Rahman",
    connections: ["salary", "timesheet"],
    flowStep: "Step 10: Shipboard Deductions",
    flowDesc: "Crew offsets canteen purchases and cellular recharges directly against earned salary, updating the Odyssey operational sheet.",
    technicalDetails: "Guarantees transactional consistency through transactional database lock schemas."
  }
];

const VesselSynapseData: SynapseFeatureNode[] = [
  {
    id: "registry",
    name: "Vessel Flag Flagship Register",
    project: "TITAN",
    role: "Class Registration Vault",
    status: "online",
    description: "Stores international legal registrations, IMO identity digits, port of registries (e.g. Panama), and Class society approvals.",
    jiraStory: "TITAN-2: Class Certificate Expiry Daemon",
    points: 8,
    assignee: "Sarah Connor",
    connections: ["clearance", "terminal", "drydock"],
    flowStep: "Step 1: Flag State Vetting",
    flowDesc: "Ensures the hull complies with international marine standards, issuing encrypted flag keys directly to maritime portals.",
    technicalDetails: "Saves encrypted certificates inside safe database tables for fast load auditing."
  },
  {
    id: "clearance",
    name: "Port Customs Clearance",
    project: "TITAN",
    role: "In-Port Border Ingress",
    status: "syncing",
    description: "Arranges crew manifest declarations, customs cargo forms, bio-hazard ballasts checklists, and schedules harbor pilot boarding sessions.",
    jiraStory: "TITAN-14: Harbour Pilot Border Ingress Webhooks",
    points: 5,
    assignee: "David Miller",
    connections: ["registry", "terminal"],
    flowStep: "Step 2: Port Border Approvals",
    flowDesc: "Submits electronic manifests to harbor authorities before the ship enters coastal waters, preventing long anchorage times.",
    technicalDetails: "Exposes secure webhook routes on Port 3000 mapping."
  },
  {
    id: "drydock",
    name: "Drydock Scheduler & Refit",
    project: "TITAN",
    role: "Scheduled Overhaul Planner",
    status: "offline",
    description: "Identifies decaying hulls or engine components and automatically reserves drydock spaces in associated global shipyards.",
    jiraStory: "TITAN-8: Automated Drydock Maintenance Detours",
    points: 13,
    assignee: "David Miller",
    connections: ["hull", "terminal", "registry"],
    flowStep: "Step 3: Refit & Detour",
    flowDesc: "When a drydock schedule is approved, Odyssey redirects route coordination logs, halting general voyages.",
    technicalDetails: "Issues automated webhooks across active project databases to lock operational tracking."
  },
  {
    id: "terminal",
    name: "Vessel Operational Terminal",
    project: "PHOENIX",
    role: "Bridge Operations Central",
    status: "online",
    description: "Primary client command experience on the bridge. Displays real-time engine telemetry, radar charts, and active crew rosters.",
    jiraStory: "PHN-15: Bridge Console Telemetry Parser Interface",
    points: 8,
    assignee: "Sarah Connor",
    connections: ["registry", "cargo", "hull"],
    flowStep: "Step 4: Ocean Command Console",
    flowDesc: "The live console on the ship acts as the gateway feedback thread. Feeds live engine parameters straight to high-seas satellite links.",
    technicalDetails: "Utilizes lightweight render trees to maximize frames during heavy processing."
  },
  {
    id: "cargo",
    name: "Cargo Ballast Control Matrix",
    project: "PHOENIX",
    role: "Stability & Weight Calculator",
    status: "online",
    description: "Tracks active container allocations, calculates hull shear stresses, and coordinates automated ballast tank water pumping actions.",
    jiraStory: "PHN-22: Ballast Load Sensor Relief Hook",
    points: 5,
    assignee: "Alex Mercer",
    connections: ["terminal", "hull"],
    flowStep: "Step 5: Trim & Draft Optimization",
    flowDesc: "Monitors physical container weight values. Redistributes water across ballast tanks to correct listed or unstable ships.",
    technicalDetails: "Feeds draft values instantly to Odyssey stress calculators."
  },
  {
    id: "hull",
    name: "Hull Stress & Fatigue Metrics",
    project: "ODYSSEY",
    role: "Acoustic Wear Diagnostic",
    status: "online",
    description: "Analyzes acoustic strain data from physical hull sensor plates, tracking corrosion index numbers and micro-fissure fatigue logs.",
    jiraStory: "ODY-18: Real-time Acoustical Hull Strain Detector",
    points: 13,
    assignee: "Aisha Rahman",
    connections: ["cargo", "drydock"],
    flowStep: "Step 6: Structural Core Audits",
    flowDesc: "Calculates marine corrosion statistics during high impact waves. If strain crosses trigger lines, drydock plans are forced.",
    technicalDetails: "Constructs live fatigue graphs via ultra-fast vector telemetry monitors."
  },
  {
    id: "engine",
    name: "Engine Propulsion Analytics",
    project: "ODYSSEY",
    role: "Predictive Thermal Watch",
    status: "online",
    description: "Maps generator temperatures, RPM performance indicators, exhaust indices, and lube motor safety levels to anticipate failures.",
    jiraStory: "ODY-77: Turbine Performance Diagnostics Module",
    points: 8,
    assignee: "Aisha Rahman",
    connections: ["terminal", "bunker"],
    flowStep: "Step 7: Machine Room Overwatch",
    flowDesc: "Continuous thermal scanning prevents core failures. Predictive warnings auto-assign low priority tickets to Sarah Connor.",
    technicalDetails: "Binds predictive sensors directly with local historical project models."
  },
  {
    id: "bunker",
    name: "Bunker Fuel Eco-efficiency",
    project: "ODYSSEY",
    role: "Vessel Fuel Optimization Engine",
    status: "online",
    description: "Calculates bunker usage metrics and optimizes boat speed to meet international low-sulfur emission criteria.",
    jiraStory: "ODY-2: Low-Carbon Marine Transit Auditor",
    points: 5,
    assignee: "Aisha Rahman",
    connections: ["engine", "terminal"],
    flowStep: "Step 8: Carbon Compliance Vetting",
    flowDesc: "Calculates bunker conservation levels. Generates digital regulatory safety certificates for harbor entry audits.",
    technicalDetails: "Constructs eco-compliance vectors mapped straight to dispatchers."
  }
];

const MaritimeSynapseData: SynapseFeatureNode[] = CrewSynapseData;

// Interactive animated soundwave monitor representing actual recorded dialogue streams
function NeuroAudioWaveform() {
  const bars = Array.from({ length: 28 }, (_, i) => i);
  return (
    <div className="flex items-center justify-between gap-1 h-12 bg-indigo-950/30 border border-white/5 rounded-xl px-4 relative overflow-hidden">
      <div className="absolute top-1 left-2 flex items-center gap-1">
        <span className="inline-block w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" />
        <span className="text-[7.5px] font-mono text-cyan-400 font-bold uppercase tracking-widest">Holographic Waveform Synchronized</span>
      </div>
      <div className="flex items-end gap-0.5 h-6 pt-2 select-none w-full justify-center">
        {bars.map((v) => {
          const duration = 0.8 + Math.random() * 1.2;
          const delay = Math.random() * 0.5;
          return (
            <motion.div
              key={v}
              className="w-1 rounded-full bg-gradient-to-t from-indigo-500 via-cyan-400 to-fuchsia-400"
              animate={{
                height: ["15%", "95%", "35%", "100%", "25%", "75%", "15%"]
              }}
              transition={{
                duration,
                repeat: Infinity,
                delay,
                ease: "easeInOut"
              }}
              style={{
                height: `${25 + Math.random() * 75}%`,
                minWidth: '2.5px'
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

// Interactive graphic representing the core neural linkages of the active meeting memory node
function NeuralMemoryConstellation({ activeMeeting }: { activeMeeting: Meeting }) {
  const keywords = activeMeeting.mainPoints 
    ? activeMeeting.mainPoints.slice(0, 3).map(pt => pt.split(' ').slice(0, 2).join(' ')) 
    : ['Meeting Core', 'Workspace', 'Synapse'];

  // Calculate coordinates for nodes in a neat star constellation
  const centerNode = { id: 'center', label: activeMeeting.type || 'SYNC', x: 100, y: 100, type: 'center', size: 12 };
  
  const kwNodes = keywords.map((kw, i) => {
    const angle = (i / keywords.length) * 2 * Math.PI - Math.PI / 2;
    return {
      id: `kw-${i}`,
      label: kw,
      x: 100 + 60 * Math.cos(angle),
      y: 100 + 60 * Math.sin(angle),
      type: 'keyword',
      size: 8
    };
  });

  const pNodes = (activeMeeting.participants || []).slice(0, 3).map((p, i) => {
    const name = p.includes('@') ? p.split('@')[0] : p;
    const angle = (i / 3) * 2 * Math.PI + Math.PI / 6;
    return {
      id: `p-${i}`,
      label: name,
      x: 100 + 40 * Math.cos(angle),
      y: 100 + 40 * Math.sin(angle),
      type: 'participant',
      size: 7
    };
  });

  const allNodes = [centerNode, ...kwNodes, ...pNodes];

  return (
    <div className="relative w-full h-[180px] bg-slate-950/40 border border-white/5 rounded-2xl overflow-hidden flex items-center justify-center p-2 mb-4 group/const">
      {/* Background radial soft light */}
      <div className="absolute inset-x-0 top-0 h-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.08)_0%,transparent_70%)] pointer-events-none" />
      
      {/* Absolute floating backdrop sparkles */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <span className="absolute top-[20%] left-[25%] block w-1 h-1 bg-cyan-300 rounded-full animate-ping" style={{ animationDuration: '2.5s' }} />
        <span className="absolute bottom-[30%] right-[30%] block w-1 h-1 bg-violet-300 rounded-full animate-ping" style={{ animationDuration: '4s' }} />
      </div>

      <svg viewBox="0 0 200 200" className="w-full h-full max-w-[200px] overflow-visible select-none relative z-10">
        {/* Draw web linkages with animated path dashes */}
        {allNodes.map(node => {
          if (node.id === 'center') return null;
          return (
            <g key={`line-group-${node.id}`}>
              {/* Pulse running along lines */}
              <motion.line
                x1="100"
                y1="100"
                x2={node.x}
                y2={node.y}
                stroke={node.type === 'keyword' ? "rgba(34, 211, 238, 0.4)" : "rgba(167, 139, 250, 0.4)"}
                strokeWidth="1.25"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              <line
                x1="100"
                y1="100"
                x2={node.x}
                y2={node.y}
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="0.75"
              />
            </g>
          );
        })}

        {/* Orbit track ring */}
        <circle cx="100" cy="100" r="50" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="1" strokeDasharray="4,4" />

        {/* Draw the nodes as beautifully stylized rings and dots */}
        {allNodes.map((node) => (
          <g key={node.id}>
            {/* Pulsating back glows */}
            {node.type === 'center' ? (
              <circle cx={node.x} cy={node.y} r={node.size + 6} className="fill-indigo-600/10 animate-pulse" />
            ) : null}

            {/* Hover circle trigger */}
            <motion.circle
              cx={node.x}
              cy={node.y}
              r={node.size}
              className={`transition-colors cursor-pointer ${
                node.type === 'center' ? 'fill-indigo-600 stroke-cyan-400' :
                node.type === 'keyword' ? 'fill-slate-950 stroke-cyan-500/80' :
                'fill-slate-900 stroke-violet-500/80'
              }`}
              strokeWidth="1.25"
              whileHover={{ scale: 1.2, strokeWidth: 1.5 }}
              animate={node.type === 'center' ? {
                scale: [1, 1.05, 1],
              } : {
                y: [0, Math.sin(node.label.charCodeAt(0)) * 2, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            {/* Inner glowing core center */}
            <circle
              cx={node.x}
              cy={node.y}
              r={node.type === 'center' ? 3 : 2}
              fill="#ffffff"
              className="pointer-events-none"
            />
          </g>
        ))}
      </svg>

      {/* High-fidelity CSS HTML labels overlay, keeping SVG text readable or responsive */}
      <div className="absolute inset-0 pointer-events-none select-none z-20">
        {allNodes.map(node => (
          <motion.div
            key={`l-tag-${node.id}`}
            className={`absolute text-[8px] font-mono px-1 py-0.5 rounded border leading-none tracking-tight whitespace-nowrap bg-slate-950/90 ${
              node.type === 'center' ? 'text-indigo-300 border-indigo-500/30 font-bold scale-105 shadow-md shadow-indigo-950/40' :
              node.type === 'keyword' ? 'text-cyan-300 border-cyan-500/20' :
              'text-violet-300 border-violet-500/10'
            }`}
            style={{
              left: `${(node.x / 200) * 100}%`,
              top: `${(node.y / 200) * 100}%`,
              transform: 'translate(-50%, 14px)',
            }}
          >
            {node.label}
          </motion.div>
        ))}
      </div>

      <div className="absolute top-2.5 left-3 flex items-center gap-1.5 pointer-events-none select-none">
        <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
        <span className="text-[8px] font-mono tracking-widest font-bold text-cyan-400 uppercase">SYNAPSE CONNECTION PLOT</span>
      </div>
    </div>
  );
}

export default function TheBrain({ 
  meetings = [], 
  projects = [], 
  members = [], 
  onRefreshData 
}: TheBrainProps) {
  const [activeSection, setActiveSection] = useState<'project' | 'meeting'>('project');
  const [selectedSynapseProj, setSelectedSynapseProj] = useState<string | null>(null);
  
  // Project Memory state selectors
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  
  // Meeting Memory state selectors
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);
  const [meetingTab, setMeetingTab] = useState<'mom' | 'transcript'>('mom');
  
  // Selected project tab: 'stories' | 'agents' | 'dmn-model'
  const [projectDetailTab, setProjectDetailTab] = useState<'stories' | 'agents' | 'dmn-model'>('stories');

  // Godmode supreme memory agent states
  const [godmodeActive, setGodmodeActive] = useState(true);
  const [godmodeQuery, setGodmodeQuery] = useState("");
  const [godmodeResult, setGodmodeResult] = useState<string | null>(null);
  const [godmodeLoading, setGodmodeLoading] = useState(false);
  const [activeCrossPipeline, setActiveCrossPipeline] = useState<string | null>("Crew Sign-In");
  const [selectedDmnTheme, setSelectedDmnTheme] = useState<'crew' | 'vessel'>('crew');
  const [selectedNodeId, setSelectedNodeId] = useState<string>("onboarding");
  const [isSimulatingSync, setIsSimulatingSync] = useState(false);
  const [syncTimerText, setSyncTimerText] = useState("ALL NODES ALIGNED");
  
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

  // Multi-step learning simulator states
  const [learnedProjects, setLearnedProjects] = useState<Record<string, {
    isLearning: boolean;
    isLearnt: boolean;
    progress: number;
    stepText: string;
    qaHistory: { q: string; a: string }[];
  }>>({});

  // Prompt input specialized for project Q&A
  const [projectQuery, setProjectQuery] = useState("");
  const [projectAiLoading, setProjectAiLoading] = useState(false);

  const handleStudyProject = (projectId: string) => {
    setLearnedProjects(prev => ({
      ...prev,
      [projectId]: {
        isLearning: true,
        isLearnt: false,
        progress: 10,
        stepText: "Connecting neural sub-arrays...",
        qaHistory: []
      }
    }));

    const steps = [
      { progress: 25, text: "Scanning connected Jira APIs..." },
      { progress: 45, text: "Parsing story points & backlog metrics..." },
      { progress: 65, text: "Evaluating Scrum role commitments..." },
      { progress: 85, text: "Constructing semantic correlation matrix..." },
      { progress: 100, text: "Cognitive reconstruction locked and memorized!" }
    ];

    steps.forEach((step, i) => {
      setTimeout(() => {
        setLearnedProjects(prev => {
          const curr = prev[projectId] || { isLearning: true, isLearnt: false, progress: 0, stepText: "", qaHistory: [] };
          return {
            ...prev,
            [projectId]: {
              ...curr,
              progress: step.progress,
              stepText: step.text,
              isLearning: step.progress < 100,
              isLearnt: step.progress === 100
            }
          };
        });
      }, (i + 1) * 600);
    });
  };

  const handleAskProjectDmn = (projectId: string, queryText: string) => {
    if (!queryText.trim()) return;
    
    // Find project key
    const proj = projects.find(p => p.id === projectId);
    const key = (proj?.key || "DEFAULT").toUpperCase();
    
    const dbKey = PROJECT_KNOWLEDGE[key] ? key : Object.keys(PROJECT_KNOWLEDGE).find(k => key.includes(k)) || "DEFAULT";
    const info = PROJECT_KNOWLEDGE[dbKey] || DEFAULT_KNOWLEDGE;

    setProjectAiLoading(true);

    setTimeout(() => {
      let answer = "";
      const lowerQuery = queryText.toLowerCase();

      const matchedQA = info.qa.find(qa => 
        lowerQuery.includes(qa.q.toLowerCase()) || 
        qa.q.toLowerCase().includes(lowerQuery)
      );

      if (matchedQA) {
        answer = matchedQA.a;
      } else {
        if (lowerQuery.includes("who") || lowerQuery.includes("assignee") || lowerQuery.includes("assigned") || lowerQuery.includes("lead")) {
          answer = `Based on the memorized issue logs, key stakeholders include ${proj?.lead || "the project lead"}. Specific user stories list assignments such as: ` + 
            info.insights.join(" and ");
        } else if (lowerQuery.includes("summary") || lowerQuery.includes("overview") || lowerQuery.includes("about") || lowerQuery.includes("minds")) {
          answer = `Here is my complete synthesized summary for ${proj?.name}: ${info.summary}`;
        } else if (lowerQuery.includes("point") || lowerQuery.includes("points") || lowerQuery.includes("velocity") || lowerQuery.includes("load")) {
          answer = `The project registry reports a total scale count of ${proj?.userStoriesCount || 0} user stories. Reviewing story points, typical backlog loads range from 3 to 13 points per core deliverable, distributed to guarantee fast sprint iteration.`;
        } else if (lowerQuery.includes("insight") || lowerQuery.includes("insights") || lowerQuery.includes("risk") || lowerQuery.includes("learn") || lowerQuery.includes("learnt")) {
          answer = `I have isolated these primary insights regarding this repository:\n\n` + info.insights.map(i => `- ${i}`).join("\n");
        } else {
          answer = `I have indexed and understood all scope items for ${proj?.name}. Regarding "${queryText}", my semantic mapping suggests that the team focuses heavily on the deliverables defined in the backlog. Here is the project summary I logged:\n\n${info.summary}`;
        }
      }

      setLearnedProjects(prev => {
        const curr = prev[projectId] || { isLearning: false, isLearnt: true, progress: 100, stepText: "Complete", qaHistory: [] };
        return {
          ...prev,
          [projectId]: {
            ...curr,
            qaHistory: [...curr.qaHistory, { q: queryText, a: answer }]
          }
        };
      });
      setProjectAiLoading(false);
      setProjectQuery("");
    }, 850);
  };

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
      const queryLower = activeText.toLowerCase();

      // Advanced matrix matching
      let matchedTheme: 'crew' | 'vessel' | null = null;
      let matchedNode: string | null = null;

      // Crew keywords matrix
      const crewKeywords: Record<string, string[]> = {
        onboarding: ["onboard", "intake", "register", "vet", "visa", "passport", "background", "hiring"],
        certification: ["cert", "license", "stcw", "fit", "gmdss", "qualification", "credential"],
        insurance: ["insur", "p&i", "indemnity", "benefit", "medical", "accident", "health"],
        management: ["management", "roster", "watch", "schedule", "assign", "cabin", "m Crewmanagemnet", "crewmanagemnet"],
        login: ["login", "sign", "auth", "finger", "credentials", "password"],
        rules: ["rule", "policy", "muster", "drill", "emergency", "haz", "compliance"],
        app: ["app", "companion", "mobile", "pocket", "notification", "phone"],
        timesheet: ["timesheet", "hour", "ledger", "shift", "rest", "duration", "fatigue"],
        salary: ["salary", "pay", "tax", "union", "compensated", "compensation", "overtime", "payroll"],
        spends: ["spend", "expense", "slop", "canteen", "cash", "deductions", "purchase"]
      };

      // Vessel keywords matrix
      const vesselKeywords: Record<string, string[]> = {
        registry: ["registry", "flag", "imo", "class", "vessel register", "name"],
        clearance: ["clearance", "port", "customs", "harbour", "pilot", "docking", "immigration"],
        drydock: ["drydock", "overhaul", "yard", "refit", "detour", "maint", "schedule"],
        terminal: ["terminal", "console", "bridge", "command", "operations", "ocean"],
        cargo: ["cargo", "ballast", "trim", "draft", "container", "shear", "loading"],
        hull: ["hull", "strain", "corros", "fissure", "wear", "fatigue"],
        engine: ["engine", "turbine", "thermal", "propuls", "rpm", "motor"],
        bunker: ["bunker", "fuel", "sulfur", "emission", "carbon", "eco"]
      };

      // 1. Search in Crew Synapse keywords
      for (const [nodeId, words] of Object.entries(crewKeywords)) {
        if (words.some(word => queryLower.includes(word))) {
          matchedTheme = 'crew';
          matchedNode = nodeId;
          break;
        }
      }

      // 2. Search in Vessel Synapse keywords (if not matched yet)
      if (!matchedTheme) {
        for (const [nodeId, words] of Object.entries(vesselKeywords)) {
          if (words.some(word => queryLower.includes(word))) {
            matchedTheme = 'vessel';
            matchedNode = nodeId;
            break;
          }
        }
      }

      // 3. Simple fallback heuristics directly targeting "crew" or "vessel"
      if (!matchedTheme) {
        if (queryLower.includes("crew")) {
          matchedTheme = 'crew';
          matchedNode = 'onboarding'; // default entry point
        } else if (queryLower.includes("vessel") || queryLower.includes("ship") || queryLower.includes("boat") || queryLower.includes("hull")) {
          matchedTheme = 'vessel';
          matchedNode = 'terminal';
        } else {
          // Absolute system fallback - prioritize Crew framework
          matchedTheme = 'crew';
          matchedNode = 'onboarding';
        }
      }

      // Apply theme and selected node to states to feed visualizers
      setSelectedDmnTheme(matchedTheme);
      setSelectedNodeId(matchedNode!);

      // Construct customized cognitive response explaining the connection
      let answer = "";
      const nodeInfo = (matchedTheme === 'crew' ? CrewSynapseData : VesselSynapseData).find(n => n.id === matchedNode) || CrewSynapseData[0];

      if (matchedTheme === 'crew') {
        answer = `### 🔗 DMN COGNITIVE RETRIEVAL: **${nodeInfo.name.toUpperCase()}**

Evaluating cross-project dependency pathways for **${nodeInfo.name}** across the active workspace...
The Default Mode Network (DMN) has successfully verified the parameters, workflows, and API layers.

#### 🌐 Cross-Project Workspace Distribution:
- **Project TITAN (Infrastructure & Core Portal)** handles **Crew Onboarding**, **Crew Certification**, **Medical & Insurance**, and **Watch Rosters**.
- **Project PHOENIX (Vessel Command Terminal & Companion App)** manages **Crew Login**, **Rules & Safety**, and the **Mobile Companion App**.
- **Project ODYSSEY (Workforce & Telemetry Auditing)** ledgerizes **Crew Timesheets**, **Salary & Payroll**, and **Operational Slop-chest Spends**.

---

#### 🚀 Node Execution (Flow Segment: ${nodeInfo.flowStep}):
${nodeInfo.flowDesc}

- **Assigned Engineering Lead**: *${nodeInfo.assignee}*
- **Linked JIRA Backlog Item**: *${nodeInfo.jiraStory}* (${nodeInfo.points} Story Points)
- **Technical Database Mapping**: \`${nodeInfo.technicalDetails}\`
- **Component Status**: **${nodeInfo.status.toUpperCase()}**

*Trace further connected modules in the visual interactive mapping block below!*`;
      } else {
        answer = `### 🔗 DMN COGNITIVE RETRIEVAL: **${nodeInfo.name.toUpperCase()}**

Analyzing core ship infrastructure coordinate mapping for **${nodeInfo.name}**...
DMN mapped critical safety thresholds, port clearance triggers, and sensor analytics logs.

#### 🌐 Workspace Topology:
- **Project TITAN (Secure Database & Harbour Registries)** hosts **Flag Registry**, **Customs Clearances**, and **Drydock Maintenance schedulers**.
- **Project PHOENIX (Bridge Screen Controls)** powers the live **Vessel Control Terminal** and **Cargo Loading Ballast matrices**.
- **Project ODYSSEY (Raw IoT Sensor Feeds)** streams **Hull Fatigue registers**, **Predictive Engine thermals**, and **Bunker Fuel eco-compliance indicators**.

---

#### 🚀 Node Execution (Flow Segment: ${nodeInfo.flowStep}):
${nodeInfo.flowDesc}

- **Assigned Engineering Lead**: *${nodeInfo.assignee}*
- **Linked JIRA Backlog Item**: *${nodeInfo.jiraStory}* (${nodeInfo.points} Story Points)
- **Technical Database Mapping**: \`${nodeInfo.technicalDetails}\`
- **Dynamic Component Status**: **${nodeInfo.status.toUpperCase()}**

*Trace further connected modules in the visual interactive mapping block below!*`;
      }

      setGodmodeResult(answer);
      setGodmodeLoading(false);
      setSimulatedLogs(prev => [
        `[GODMODE-QUERY] Synthesized multi-app relationship matrix for '${matchedNode}' (Theme: ${matchedTheme?.toUpperCase()})`,
        `[GODMODE-ENGINE] Auto-routed user search to DMN node in 35ms.`,
        ...prev
      ]);
    }, 700);
  };

  // Oracle Prompt query states
  const [oracleQuery, setOracleQuery] = useState("");
  const [oracleResponse, setOracleResponse] = useState<string | null>(null);
  const [oracleLoading, setOracleLoading] = useState(false);
  const [oracleError, setOracleError] = useState<string | null>(null);
  const [searchedKeyword, setSearchedKeyword] = useState<string>("");
  const [oracleMatchedMeetings, setOracleMatchedMeetings] = useState<{
    id: string;
    relevanceReason: string;
    matchedPoints: string[];
    matchedActionItems: string[];
  }[]>([]);

  // Highlight keyword in text helper
  const highlightKeyword = (text: string, keyword: string) => {
    if (!keyword || !keyword.trim() || !text) return text;
    const cleanKeyword = keyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const parts = text.split(new RegExp(`(${cleanKeyword})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === keyword.toLowerCase() 
        ? <mark key={i} className="bg-yellow-250 text-slate-900 font-semibold px-0.5 rounded">{part}</mark>
        : part
    );
  };

  const parseInlineStyles = (line: string) => {
    const parts = line.split('**');
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return <strong key={i} className="font-extrabold text-slate-900">{part}</strong>;
      }
      return part;
    });
  };

  // Background floating particles state
  const [ambientBubbles, setAmbientBubbles] = useState<{ id: number; left: number; top: number; scale: number; speed: number; opacity: number }[]>([]);
  
  // Custom tiny blue and yellow thread-like triangular particles
  const [threadParticles, setThreadParticles] = useState<{
    id: number;
    left: number;
    top: number;
    size: number;
    speed: number;
    opacity: number;
    color: 'blue' | 'yellow';
    angle: number;
  }[]>([]);

  useEffect(() => {
    // Select default items on load
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
    if (meetings.length > 0 && !selectedMeetingId) {
      setSelectedMeetingId(meetings[0].id);
    }

    // Set up unique design floating particles
    const list = Array.from({ length: 25 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      scale: Math.random() * 1.5 + 0.5,
      speed: Math.random() * 15 + 10,
      opacity: Math.random() * 0.25 + 0.05
    }));
    setAmbientBubbles(list);

    // Set up unique design floating blue & yellow triangle threads
    const threads = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 5 + 4, // 4px to 9px triangle height
      speed: Math.random() * 14 + 12, // 12 to 26 seconds speed
      opacity: Math.random() * 0.35 + 0.25, // highly visible and stunning
      color: Math.random() > 0.5 ? 'blue' as const : 'yellow' as const,
      angle: Math.random() * 360
    }));
    setThreadParticles(threads);
  }, [projects, meetings]);

  const activeProject = projects.find(p => p.id === selectedProjectId) || (projects.length > 0 ? projects[0] : null);
  const activeMeeting = meetings.find(m => m.id === selectedMeetingId) || (meetings.length > 0 ? meetings[0] : null);

  const learnState = activeProject 
    ? (learnedProjects[activeProject.id] || { isLearning: false, isLearnt: false, progress: 0, stepText: "", qaHistory: [] }) 
    : { isLearning: false, isLearnt: false, progress: 0, stepText: "", qaHistory: [] };
  const keyProj = activeProject ? (activeProject.key || "DEFAULT").toUpperCase() : "DEFAULT";
  const dbKeyProj = PROJECT_KNOWLEDGE[keyProj] ? keyProj : Object.keys(PROJECT_KNOWLEDGE).find(k => keyProj.includes(k)) || "DEFAULT";
  const info = PROJECT_KNOWLEDGE[dbKeyProj] || DEFAULT_KNOWLEDGE;

  // Handle cognitive search/oracle query
  const handleConsultOracle = async (presetText?: string) => {
    const textToSubmit = presetText || oracleQuery;
    if (!textToSubmit.trim()) return;
    
    setOracleLoading(true);
    setOracleError(null);
    setOracleResponse(null);
    setOracleMatchedMeetings([]);
    setSearchedKeyword(textToSubmit);
    if (!presetText) {
      setOracleQuery(textToSubmit);
    }

    try {
      const resp = await fetch(`${API_URL}/api/brain/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: textToSubmit })
      });

      if (!resp.ok) {
        throw new Error("Synaptic service index handshake error.");
      }

      const res = await resp.json();
      setOracleResponse(res.answer);
      setOracleMatchedMeetings(res.matchedMeetings || []);
    } catch (err: any) {
      setOracleError("handshake timeout. Local memory search indexing substituted successfully.");
      // Fallback local matching
      const keyword = textToSubmit.toLowerCase();
      const matched = meetings.filter(m => 
        m.title.toLowerCase().includes(keyword) || 
        (m.summary && m.summary.toLowerCase().includes(keyword)) ||
        (m.transcript && m.transcript.toLowerCase().includes(keyword)) ||
        (m.mainPoints && m.mainPoints.some(pt => pt.toLowerCase().includes(keyword))) ||
        (m.actionItems && m.actionItems.some(item => item.toLowerCase().includes(keyword)))
      );
      if (matched.length > 0) {
        let text = `### 🔍 Local Cognition Synapse Index (Fallbacked)\nFound **${matched.length}** meetings related to "${textToSubmit}":\n\n`;
        matched.forEach((m, i) => {
          text += `#### ${i + 1}. ${m.title} (${m.date})\n- **Summary:** ${m.summary}\n`;
          if (m.actionItems && m.actionItems.length > 0) {
            text += `- **Tasks Assigned:**\n${m.actionItems.map(a => `  - ${a}`).join("\n")}\n`;
          }
          text += `\n`;
        });
        setOracleResponse(text);
        
        const fallbackMatched = matched.map(m => ({
          id: m.id,
          relevanceReason: `Contains the keyword "${textToSubmit}" in the meeting details.`,
          matchedPoints: m.mainPoints?.filter(pt => pt.toLowerCase().includes(keyword)) || [],
          matchedActionItems: m.actionItems?.filter(item => item.toLowerCase().includes(keyword)) || []
        }));
        setOracleMatchedMeetings(fallbackMatched);
      } else {
        setOracleResponse(`### ❌ Cognitive Scan Completed\nNo direct matches found in our historical meetings for key terms: "${textToSubmit}". Try searching for 'titan', 'kochi', or 'contrast'.`);
        setOracleMatchedMeetings([]);
      }
    } finally {
      setOracleLoading(false);
    }
  };

  const parseComplexFormat = (text: string) => {
    return text.split('\n').map((line, idx) => {
      const trimmed = line.trim();
      
      // Headers
      if (trimmed.startsWith('####')) {
        return (
          <h5 key={idx} className="text-[12px] font-mono font-bold text-slate-900 mt-3 mb-1.5 flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-500 shrink-0" />
            {parseInlineStyles(trimmed.replace(/^####+/, '').trim())}
          </h5>
        );
      }
      if (trimmed.startsWith('###')) {
        return (
          <h4 key={idx} className="text-xs font-mono font-bold text-indigo-900 mt-4 mb-2 flex items-center gap-1 border-b border-slate-100 pb-1">
            <Search className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            {parseInlineStyles(trimmed.replace('###', '').trim())}
          </h4>
        );
      }
      if (trimmed.startsWith('##')) {
        return (
          <h3 key={idx} className="text-sm font-mono font-extrabold text-slate-900 mt-5 mb-2.5 flex items-center gap-1.5 border-b border-indigo-100 pb-1">
            <Brain className="w-4 h-4 text-indigo-600 shrink-0" />
            {parseInlineStyles(trimmed.replace('##', '').trim())}
          </h3>
        );
      }
      if (trimmed.startsWith('#')) {
        return (
          <h2 key={idx} className="text-base font-sans font-black text-slate-900 mt-6 mb-3">
            {parseInlineStyles(trimmed.replace(/^#+/, '').trim())}
          </h2>
        );
      }
      
      // List items
      if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
        return (
          <li key={idx} className="list-disc ml-5 text-slate-850 text-xs py-1 font-sans leading-relaxed">
            {parseInlineStyles(trimmed.substring(1).trim())}
          </li>
        );
      }
      
      // Numbered list items (e.g. 1. , 2. )
      const numberedMatch = trimmed.match(/^(\d+)\.\s(.*)/);
      if (numberedMatch) {
        return (
          <div key={idx} className="flex gap-2 ml-2 py-1 text-xs text-slate-850 font-sans leading-relaxed">
            <span className="font-mono font-bold text-indigo-600 shrink-0">{numberedMatch[1]}.</span>
            <span>{parseInlineStyles(numberedMatch[2])}</span>
          </div>
        );
      }
      
      if (trimmed.length === 0) return <div key={idx} className="h-2" />;
      
      // Standard paragraph
      return (
        <p key={idx} className="text-xs text-slate-800 font-sans leading-relaxed mb-2.5">
          {parseInlineStyles(trimmed)}
        </p>
      );
    });
  };

  const getMatchedMeetings = () => {
    if (!searchedKeyword || !searchedKeyword.trim()) return [];
    const query = searchedKeyword.toLowerCase().trim();
    return meetings.filter(m => {
      return (
        m.title.toLowerCase().includes(query) ||
        (m.summary && m.summary.toLowerCase().includes(query)) ||
        (m.transcript && m.transcript.toLowerCase().includes(query)) ||
        (m.mainPoints && m.mainPoints.some(pt => pt.toLowerCase().includes(query))) ||
        (m.actionItems && m.actionItems.some(item => item.toLowerCase().includes(query)))
      );
    });
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-xl text-slate-850 relative overflow-hidden min-h-[750px] font-sans">
      
      {/* Corporate AI Brain Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-50 border border-slate-200 p-6 rounded-2xl relative overflow-hidden mb-6 shadow-sm leading-relaxed">
        <div className="flex items-center gap-4 relative z-10">
          <div className="bg-blue-50 p-2.5 rounded-xl border border-blue-200 flex items-center justify-center relative shrink-0">
            <motion.div
              animate={{
                scale: [1, 1.12, 1],
                opacity: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0 rounded-xl bg-blue-100/50"
            />
            <motion.div
              animate={{
                rotate: [0, 8, -8, 0],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="relative z-10 font-bold"
            >
              <Brain className="w-5 h-5 text-blue-600" />
            </motion.div>
          </div>
          <div>
            <h2 className="text-xl font-mono tracking-tight text-slate-900 flex items-center gap-2 font-bold">
              THE MEMORY NETWORK
            </h2>
          </div>
        </div>
      </div>

      {/* EXACTLY TWO SECTIONS SELECTOR with blueprint look */}
      <div className="grid grid-cols-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 mb-8 relative z-25 select-none text-center">
        <button
          onClick={() => setActiveSection('project')}
          className={`cursor-pointer group relative py-3 rounded-xl font-mono text-xs font-bold tracking-wider transition-all duration-300 flex items-center justify-center gap-2 z-10 ${activeSection === 'project' ? 'text-white' : 'text-slate-500 hover:text-slate-800'}`}
        >
          <Layers className={`w-4 h-4 ${activeSection === 'project' ? 'text-white' : 'text-blue-600'} group-hover:scale-110 transition-transform`} />
          PROJECT MEMORY
          {activeSection === 'project' && (
            <motion.div 
              layoutId="mainSectionHighlight" 
              className="absolute inset-0 bg-blue-600 rounded-xl shadow-md -z-10"
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
            />
          )}
          {activeSection === 'project' && (
            <span className="absolute bottom-1 w-6 h-0.5 bg-yellow-400 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveSection('meeting')}
          className={`cursor-pointer group relative py-3 rounded-xl font-mono text-xs font-bold tracking-wider transition-all duration-300 flex items-center justify-center gap-2 z-10 ${activeSection === 'meeting' ? 'text-white font-bold' : 'text-slate-500 hover:text-slate-800'}`}
        >
          <Brain className={`w-4 h-4 ${activeSection === 'meeting' ? 'text-white' : 'text-blue-600'} group-hover:scale-110 transition-transform`} />
          MEETING MEMORY
          {activeSection === 'meeting' && (
            <motion.div 
              layoutId="mainSectionHighlight" 
              className="absolute inset-0 bg-blue-600 rounded-xl shadow-md -z-10"
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
            />
          )}
          {activeSection === 'meeting' && (
            <span className="absolute bottom-1 w-6 h-0.5 bg-yellow-400 rounded-full" />
          )}
        </button>
      </div>

      {/* Main Container Switch */}
      <AnimatePresence mode="wait">
        
        {/* ===================================== SECTION 1: PROJECT MEMORY ===================================== */}
        {activeSection === 'project' && (
          <motion.div
            key="project-memory"
            initial={{ opacity: 0, scale: 0.99, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.99, y: -10 }}
            transition={{ duration: 0.35 }}
            className="flex flex-col items-center justify-center min-h-[480px] w-full max-w-4xl mx-auto px-4 py-8 relative z-10 space-y-8"
          >
            {/* Header / Sub-branding */}
            <div className="text-center space-y-3 max-w-2xl text-left">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-600 text-[10px] font-mono uppercase font-bold tracking-widest mx-auto">
                <Brain className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                the Memory Cognitive Synthesis Oracle
              </div>
              <h2 className="text-2xl font-bold font-display tracking-tight text-slate-900 sm:text-3xl text-center">
                Unified Meeting Memory Search
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-sans text-center">
                Query the GODMODE master intelligence to perform real-time retrieval across all configured project repositories, code pathways, and JIRA user story dependencies.
              </p>
            </div>

            {/* Central Unified Search Box */}
            <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-xs relative overflow-hidden">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleConsultGodmode();
                }}
                className="space-y-4"
              >
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="search"
                    className="block w-full pl-10 pr-24 py-4 bg-white border border-slate-300 hover:border-slate-400 focus:border-blue-550 focus:ring-1 focus:ring-blue-550 rounded-xl text-xs sm:text-sm font-sans text-slate-800 placeholder-slate-400 focus:ring-1 focus:ring-blue-500 outline-none transition-all shadow-xs"
                    placeholder="What You are looking for"
                    value={godmodeQuery}
                    onChange={(e) => setGodmodeQuery(e.target.value)}
                    disabled={godmodeLoading}
                    autoFocus
                  />
                  <div className="absolute inset-y-2 right-2 flex items-center">
                    <button
                      type="submit"
                      disabled={godmodeLoading || !godmodeQuery.trim()}
                      className="h-full px-5 bg-blue-600 hover:bg-blue-700 text-white font-mono font-bold text-xs rounded-lg transition-all shadow-md disabled:opacity-45 flex items-center gap-1.5 cursor-pointer border border-transparent"
                    >
                      {godmodeLoading ? (
                        <>
                          <RotateCw className="w-3.5 h-3.5 animate-spin" />
                          SCANNING...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          SYNAPSE
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Popular Synapse Recommendations / Shortcuts - Styled in yellow button with black text */}
                <div className="flex flex-wrap items-center gap-2 pt-2 text-[10.5px] justify-center sm:justify-start">
                  <span className="text-slate-500 font-mono">Suggested consults:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setGodmodeQuery("how do the crew sign-in, security tokens, and hours tracking relate?");
                      handleConsultGodmode("how do the crew sign-in, security tokens, and hours tracking relate?");
                    }}
                    className="px-2.5 py-1 bg-yellow-400 hover:bg-yellow-500 border border-yellow-500/20 text-slate-900 font-bold rounded-lg cursor-pointer transition-colors"
                  >
                    "Show app relationship maps"
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setGodmodeQuery("What are the key shared features across projects?");
                      handleConsultGodmode("What are the key shared features across projects?");
                    }}
                    className="px-2.5 py-1 bg-yellow-400 hover:bg-yellow-500 border border-yellow-500/20 text-slate-900 font-bold rounded-lg cursor-pointer transition-colors"
                  >
                    "Analyze common features"
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setGodmodeQuery("Summarize current project sprint status and recommendations");
                      handleConsultGodmode("Summarize current project sprint status and recommendations");
                    }}
                    className="px-2.5 py-1 bg-yellow-400 hover:bg-yellow-500 border border-yellow-500/20 text-slate-900 font-bold rounded-lg cursor-pointer transition-colors"
                  >
                    "Sprint recommendations"
                  </button>
                </div>
              </form>
            </div>

            {/* Synthesized Godmode Response Display */}
            <AnimatePresence mode="wait">
              {godmodeResult && (
                <motion.div
                  key="godmode-result"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="w-full bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-md relative text-left space-y-8 overflow-hidden"
                >
                  
                  {/* Report Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-blue-600 border border-blue-500 text-white text-[10px] font-mono uppercase font-bold tracking-widest">
                        <Terminal className="w-3.5 h-3.5 text-white animate-pulse" />
                        DMN Synapse Cognitive Report
                      </div>
                      <h3 className="text-lg font-bold font-display text-slate-900 tracking-tight flex items-center gap-2 mt-1">
                        <span>Workspace Relationship Schema Results</span>
                        <span className="flex h-2 w-2 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                      </h3>
                      <p className="text-slate-600 text-[11px] leading-relaxed font-mono">
                        Search query matched: <span className="text-blue-600 font-bold font-sans">"{godmodeQuery}"</span>
                      </p>
                    </div>
                    
                    <button 
                      onClick={() => setGodmodeResult(null)}
                      className="px-3 py-1.5 bg-yellow-400 hover:bg-yellow-500 text-slate-900 hover:text-black border border-yellow-550 rounded-lg text-[10px] uppercase font-mono font-bold transition-all cursor-pointer self-start sm:self-auto shadow-xs"
                    >
                      [✕ Exit Results]
                    </button>
                  </div>

                   {/* ⚓ IMMERSIVE ANIMATED INTERCONNECTED WEB STAGE */}
                  <div className="space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-xs">
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                          <Cable className="text-blue-600 w-3.5 h-3.5 animate-pulse" />
                          Default Mode Network (DMN) Flow Mappings
                        </h4>
                        <p className="text-[11px] text-slate-650 font-sans">
                          A dynamic multi-project model verifying connections from inception to completion. Click to transition frameworks.
                        </p>
                      </div>
                      
                      {/* Interactive Premium Dimension Selector - Structured with clean input design */}
                      <div className="flex p-0.5 bg-slate-100 rounded-xl border border-slate-200 self-start md:self-auto shadow-inner">
                        <button
                          onClick={() => {
                            setSelectedDmnTheme('crew');
                            setSelectedNodeId('onboarding');
                            // Re-trigger synthesis with default
                            handleConsultGodmode("crew onboarding integration details");
                          }}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                            selectedDmnTheme === 'crew'
                              ? 'bg-blue-600 text-white shadow-md font-bold'
                              : 'text-slate-650 hover:text-slate-900'
                          }`}
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          Crew Pipeline
                        </button>
                        <button
                          onClick={() => {
                            setSelectedDmnTheme('vessel');
                            setSelectedNodeId('registry');
                            // Re-trigger synthesis with default
                            handleConsultGodmode("vessel registry details");
                          }}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                            selectedDmnTheme === 'vessel'
                              ? 'bg-yellow-400 text-slate-900 shadow-md font-bold'
                              : 'text-slate-650 hover:text-slate-900'
                          }`}
                        >
                          <Cpu className="w-3.5 h-3.5" />
                          Vessel Assets
                        </button>
                      </div>
                    </div>

                    {/* Desktop SVG Interconnected Canvas Grid (Shown on lg) */}
                    <div className="relative h-[220px] bg-slate-50 border border-slate-200 rounded-2xl p-4 overflow-hidden select-none hidden lg:block" id="dmn-results-canvas-mesh">
                      
                      {/* Active theme graphic badge */}
                      <div className="absolute top-3 left-4 flex items-center gap-1.5 z-20 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-sm">
                        <span className="flex h-1.5 w-1.5 relative">
                          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${selectedDmnTheme === 'crew' ? 'bg-blue-500' : 'bg-yellow-500'}`}></span>
                          <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${selectedDmnTheme === 'crew' ? 'bg-blue-600' : 'bg-yellow-600'}`}></span>
                        </span>
                        <span className="text-[8px] font-mono tracking-widest font-extrabold uppercase text-slate-650">
                          {selectedDmnTheme === 'crew' ? 'Crew Unified Synapse (10 Nodes)' : 'Vessel Core Asset Mesh (8 Nodes)'}
                        </span>
                      </div>

                      {/* Dynamic SVG Connection paths based on mathematics */}
                      {(() => {
                        const activeDataset = selectedDmnTheme === 'crew' ? CrewSynapseData : VesselSynapseData;
                        
                        // Node coordinate generator helper
                        const getDynamicCoords = (idx: number, total: number) => {
                          const spacingX = total > 1 ? 610 / (total - 1) : 610;
                          const x = 75 + (idx * spacingX);
                          const y = idx % 2 === 0 ? 55 : 135;
                          return { x, y };
                        };

                        // Build curved spline path connecting all nodes
                        let splinePath = "";
                        activeDataset.forEach((node, idx) => {
                          const coords = getDynamicCoords(idx, activeDataset.length);
                          if (idx === 0) {
                            splinePath += `M ${coords.x} ${coords.y}`;
                          } else {
                            const prevCoords = getDynamicCoords(idx - 1, activeDataset.length);
                            const cp1x = prevCoords.x + (coords.x - prevCoords.x) / 1.8;
                            splinePath += ` C ${cp1x} ${prevCoords.y}, ${cp1x} ${coords.y}, ${coords.x} ${coords.y}`;
                          }
                        });

                        return (
                          <>
                            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 760 180" preserveAspectRatio="none">
                              <defs>
                                <linearGradient id="glow-line-phn-ttn" x1="0%" y1="0%" x2="100%" y2="0%">
                                  <stop offset="0%" stopColor="#06b6d4" />
                                  <stop offset="50%" stopColor="#10b981" />
                                  <stop offset="100%" stopColor="#6366f1" />
                                </linearGradient>
                                <linearGradient id="inactive-grey" x1="0%" y1="0%" x2="100%" y2="0%">
                                  <stop offset="0%" stopColor="#1e293b" stopOpacity={0.15} />
                                  <stop offset="100%" stopColor="#0f172a" stopOpacity={0.1} />
                                </linearGradient>
                              </defs>

                              {/* Static pipeline wave */}
                              <path 
                                d={splinePath} 
                                fill="none" 
                                stroke="url(#inactive-grey)"
                                strokeWidth="3"
                                className="transition-all duration-500"
                              />

                              {/* Glowing highlighted flow segment path */}
                              <motion.path 
                                d={splinePath} 
                                fill="none" 
                                stroke="url(#glow-line-phn-ttn)"
                                strokeWidth="1.8"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                              />

                              {/* Glowing micro-signal particle traveling down the pipeline */}
                              <circle r="4" fill={selectedDmnTheme === 'crew' ? '#22d3ee' : '#34d399'} className="shadow-lg shadow-cyan-500/50">
                                <animateMotion path={splinePath} dur="3.8s" repeatCount="indefinite" />
                              </circle>
                            </svg>

                            {/* Overlay Interactive Dynamic Node Cards */}
                            {activeDataset.map((node, idx) => {
                              const coords = getDynamicCoords(idx, activeDataset.length);
                              const isSelected = selectedNodeId === node.id;
                              
                              // Visual properties relative to active project matching
                              const projColorClasses = 
                                node.project === 'TITAN' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' :
                                node.project === 'PHOENIX' ? 'text-blue-600 bg-blue-50 border-blue-200' :
                                'text-indigo-600 bg-indigo-50 border-indigo-200';

                              const borderThemeGlow = 
                                isSelected
                                  ? (node.project === 'TITAN' ? 'border-emerald-555 shadow-md bg-emerald-600 text-white scale-105 z-30 font-bold' :
                                     node.project === 'PHOENIX' ? 'border-blue-555 shadow-md bg-blue-600 text-white scale-105 z-30 font-bold' :
                                     'border-indigo-555 shadow-md bg-indigo-600 text-white scale-105 z-30 font-bold')
                                  : 'border-slate-200 bg-white text-slate-800 hover:border-blue-300 hover:text-blue-600';

                              return (
                                <button
                                  key={node.id}
                                  onClick={() => setSelectedNodeId(node.id)}
                                  style={{
                                    left: `${(coords.x / 760) * 100}%`,
                                    top: `${(coords.y / 180) * 100}%`,
                                    transform: 'translate(-50%, -50%)',
                                  }}
                                  className={`absolute py-1.5 px-2.5 rounded-xl border text-[10px] sm:text-[11px] font-mono leading-none flex flex-col justify-center gap-1.5 transition-all duration-300 w-[112px] cursor-pointer select-none ${borderThemeGlow}`}
                                >
                                  <div className="flex items-center justify-between pointer-events-none w-full">
                                    <span className={`text-[7px] font-sans font-extrabold px-1 py-0.2 rounded border uppercase tracking-wider ${projColorClasses}`}>
                                      {node.project}
                                    </span>
                                    <span className={`text-[7.5px] font-bold ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>{node.flowStep.split(' ')[1] || ""}</span>
                                  </div>
                                  <span className={`font-sans font-bold block truncate text-left w-full tracking-tight ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                                    {node.name.replace('Crew ', '').replace('Vessel ', '')}
                                  </span>
                                </button>
                              );
                            })}
                          </>
                        );
                      })()}
                    </div>

                    {/* Mobile Button Toggles Grid (Shown instead of Canvas on sm/md viewports) */}
                    <div className="lg:hidden grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {(() => {
                        const activeDataset = selectedDmnTheme === 'crew' ? CrewSynapseData : VesselSynapseData;
                        return activeDataset.map((item) => {
                          const isSelected = selectedNodeId === item.id;
                          const projectBadgeColor = 
                            item.project === 'TITAN' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            item.project === 'PHOENIX' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                            'bg-indigo-50 text-indigo-600 border-indigo-200';

                          return (
                            <button
                              key={item.id}
                              onClick={() => setSelectedNodeId(item.id)}
                              className={`p-3 rounded-xl border text-left flex flex-col gap-1.5 select-none cursor-pointer transition-all ${
                                isSelected 
                                  ? "bg-blue-605 bg-blue-600 border-blue-500 text-white shadow-md font-bold" 
                                  : "bg-white border-slate-200 text-slate-500 hover:text-slate-800"
                              }`}
                            >
                              <div className="flex items-center justify-between w-full pointer-events-none">
                                <span className={`text-[7px] px-1 py-0.2 border rounded block font-mono font-bold tracking-wider ${projectBadgeColor}`}>
                                  {item.project}
                                </span>
                                <span className={`text-[8px] font-mono font-bold ${isSelected ? 'text-white/85' : 'text-slate-500'}`}>{item.flowStep.split(' ')[1] || ""}</span>
                              </div>
                              <span className={`text-[11px] font-sans font-bold truncate block pointer-events-none ${isSelected ? 'text-white' : 'text-slate-700'}`}>
                                {item.name}
                              </span>
                            </button>
                          );
                        });
                      })()}
                    </div>
                  </div>

                  {/* 📊 DYNAMICAL DETAIL VIEWER & SYNAPSE HANDSHAKE CORE */}
                  {(() => {
                    const activeDataset = selectedDmnTheme === 'crew' ? CrewSynapseData : VesselSynapseData;
                    const nodeDetails = activeDataset.find(d => d.id === selectedNodeId) || activeDataset[0];
                    return (
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-slate-50 border border-slate-200 rounded-2xl p-5 md:p-6 relative select-text shadow-xs">
                        
                        {/* Node Properties */}
                        <div className="md:col-span-8 space-y-4 text-left">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                            <div className="space-y-0.5">
                              <h4 className="text-base font-bold font-display text-slate-900 flex items-center gap-2">
                                <span>{nodeDetails.name}</span>
                                <span className={`text-[9px] font-mono px-2 py-0.5 rounded-md font-bold uppercase border ${
                                  nodeDetails.project === 'PHOENIX' ? 'bg-blue-50 border-blue-200 text-blue-600' :
                                  nodeDetails.project === 'TITAN' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                                  'bg-indigo-50 border-indigo-200 text-indigo-600'
                                }`}>
                                  Module: {nodeDetails.id}
                                </span>
                              </h4>
                              <p className="text-xs text-slate-550 font-mono italic">Functional Segment: {nodeDetails.flowStep}</p>
                            </div>
                            <span className={`text-[10px] font-mono font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-lg border w-fit ${
                              nodeDetails.status === 'online' ? 'bg-emerald-50 border-emerald-200 text-emerald-700 animate-pulse' :
                              nodeDetails.status === 'syncing' ? 'bg-blue-50 border-blue-200 text-blue-600' :
                              nodeDetails.status === 'audit_mode' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                              'bg-slate-100 border-slate-200 text-slate-600'
                            }`}>
                              ● {nodeDetails.status === 'audit_mode' ? 'AUDIT MODE' : nodeDetails.status.toUpperCase()}
                            </span>
                          </div>

                          <div className="space-y-3.5 text-xs sm:text-sm">
                            <div className="space-y-1 font-mono text-left">
                              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-blue-600">Functional Backlog Description</span>
                              <p className="text-slate-700 leading-relaxed font-sans">{nodeDetails.description}</p>
                            </div>

                            {/* Core Backlog JIRA Details */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white border border-slate-200 rounded-xl p-3">
                              <div className="text-left font-mono">
                                <span className="text-[8.5px] font-bold text-slate-500 uppercase tracking-wider block">Connected Backlog Code</span>
                                <span className="text-indigo-650 text-xs font-bold leading-normal block mt-0.5 truncate">{nodeDetails.jiraStory}</span>
                              </div>
                              <div className="text-left font-mono">
                                <span className="text-[8.5px] font-bold text-slate-500 uppercase tracking-wider block">Complexity Density</span>
                                <span className="text-slate-800 text-xs font-bold leading-normal block mt-0.5">{nodeDetails.points} Story pts</span>
                              </div>
                              <div className="text-left font-mono">
                                <span className="text-[8.5px] font-bold text-slate-500 uppercase tracking-wider block">Lead Developer</span>
                                <span className="text-blue-600 text-xs font-bold leading-normal block mt-0.5 truncate">{nodeDetails.assignee}</span>
                              </div>
                            </div>

                            {/* Couplings Matrix */}
                            <div className="space-y-1.5 font-mono text-left">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-650 block">Dynamic Cross-App Synapse Bridges</span>
                              <div className="flex flex-wrap gap-2 pt-0.5">
                                {nodeDetails.connections.map((cName, cIdx) => (
                                  <span key={cIdx} className="px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-650 text-[10.5px] flex items-center gap-1.5 font-sans">
                                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full inline-block animate-pulse" />
                                    <span>Tunnels directly to: <strong className="text-slate-800 font-bold">{cName}</strong></span>
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Interactive Cognitive Handshake Simulator Controls */}
                        <div className="md:col-span-4 bg-white border border-slate-200 rounded-2xl p-4.5 flex flex-col justify-between text-left relative overflow-hidden space-y-4 shadow-3xs">
                          <div className="space-y-2">
                            <span className="text-[9px] font-mono font-bold text-blue-600 uppercase tracking-widest block font-extrabold">Cognitive Simulator</span>
                            <h5 className="text-[11.5px] font-bold text-slate-900 uppercase font-mono">DMN Bridge Dispatcher</h5>
                            <p className="text-[10.5px] text-slate-600 leading-relaxed font-sans">
                              Manually verify port bindings, credentials pipelines, and DB syncing loops for this feature.
                            </p>
                          </div>

                          {/* Animation Display */}
                          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 font-mono text-[10px] text-center min-h-[50px] flex flex-col items-center justify-center relative overflow-hidden text-slate-800">
                            {isSimulatingSync ? (
                              <div className="space-y-2 w-full">
                                <div className="flex items-center justify-center gap-1.5 pointer-events-none">
                                  <RotateCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                                  <span className="text-blue-600 font-bold uppercase blink text-[8px] tracking-tight">{syncTimerText}</span>
                                </div>
                                <div className="w-full bg-white h-1 rounded-full overflow-hidden border border-slate-200">
                                  <motion.div 
                                    className="h-full bg-blue-600"
                                    initial={{ width: "0%" }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 1.8, ease: "linear" }}
                                  />
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <div className="text-emerald-600 font-bold uppercase flex items-center gap-1 justify-center tracking-normal">
                                  <ShieldCheck className="w-4 h-4 text-emerald-600 animate-pulse" />
                                  ALL SYS INTEGRATED
                                </div>
                                <span className="text-slate-500 text-[8.5px] block font-mono">STABILITY COEFFICIENT: 99.8%</span>
                              </div>
                            )}
                          </div>

                          {/* Sync Button */}
                          <button
                            onClick={() => {
                              setIsSimulatingSync(true);
                              setSyncTimerText("DIAGNOSING PORT MAPPINGS...");
                              setTimeout(() => setSyncTimerText("COMMITTING COGNITIVE SYNC LOGS..."), 650);
                              setTimeout(() => setSyncTimerText("RE-ROUTING SECURE ENDPOINTS..."), 1200);
                              setTimeout(() => {
                                setIsSimulatingSync(false);
                                setSimulatedLogs(prev => [
                                  `[COGNITIVE-SYNAPSE] Success: Completed active handshake test on feature '${nodeDetails.name}' across PHOENIX, TITAN, and ODYSSEY frameworks.`,
                                  `[SYSTEM-METRIC] Stability validated on port 3000 mapping at 0.0.0.0 host routing.`,
                                  ...prev
                                ]);
                              }, 1800);
                            }}
                            disabled={isSimulatingSync}
                            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-mono font-bold text-[10px] rounded-lg transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 border border-transparent disabled:opacity-45 uppercase"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            {isSimulatingSync ? "SYNCHRONIZING..." : "INITIATE COGNITIVE HANDSHAKE"}
                          </button>
                        </div>
                      </div>
                    );
                  })()}

                  {/* 📌 TIMELINE FLOW OF USER JOURNEY / CONNECTIONS */}
                  <div className="space-y-4 border-t border-slate-200 pt-6 text-left">
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Share2 className="w-3.5 h-3.5 text-blue-600" />
                        Connected Maritime Lifespan & User Flow
                      </h4>
                      <p className="text-[11px] text-slate-600 font-sans">
                        Observe how the data triggers cascades from crew assignment across multiple microservices to shipyard refits.
                      </p>
                    </div>

                    {/* Timeline Tracker Graphic */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 relative">
                      {/* Desktop arrow wires separator */}
                      <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2 pointer-events-none hidden lg:block select-none z-0" />
                      
                      {(() => {
                        const activeDataset = selectedDmnTheme === 'crew' ? CrewSynapseData : VesselSynapseData;
                        return activeDataset.map((node) => {
                          const isNodeSelected = selectedNodeId === node.id;
                          return (
                            <motion.div
                              key={node.id}
                              whileHover={{ scale: 1.015 }}
                              onClick={() => setSelectedNodeId(node.id)}
                              className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all duration-300 relative z-10 space-y-2 flex flex-col justify-between select-none ${
                                isNodeSelected 
                                  ? "bg-blue-600 border-blue-500 text-white shadow-md font-bold" 
                                  : "bg-white border-slate-200 text-slate-700 hover:border-slate-350 hover:bg-slate-50"
                              }`}
                            >
                              <div className="space-y-1 pointer-events-none">
                                <span className={`text-[8px] font-mono font-bold px-1.5 py-0.2 border rounded-md block w-fit shrink-0 uppercase tracking-wider ${
                                  isNodeSelected
                                    ? "bg-white/20 text-white border-white/30"
                                    : node.project === "PHOENIX" ? "bg-blue-50 text-blue-600 border-blue-200" :
                                      node.project === "TITAN" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                      "bg-indigo-50 text-indigo-700 border-indigo-200"
                                }`}>
                                  {node.project}
                                </span>
                                <h5 className={`text-[11px] font-bold font-mono tracking-tight leading-tight truncate mt-1 ${isNodeSelected ? 'text-white font-bold' : 'text-slate-900 font-bold'}`}>
                                  {node.flowStep}
                                </h5>
                                <p className={`text-[10px] font-sans leading-relaxed line-clamp-3 ${isNodeSelected ? 'text-white/80' : 'text-slate-500'}`}>
                                  {node.flowDesc}
                                </p>
                              </div>

                              <span className={`text-[9px] font-mono font-bold tracking-wider pt-1.5 uppercase block mt-1 pointer-events-none border-t ${
                                isNodeSelected ? 'text-white/70 border-white/20' : 'text-slate-400 border-slate-100'
                              }`}>
                                {isNodeSelected ? '▸ ACTIVE NODE' : '▸ INSPECT FOCUS'}
                              </span>
                            </motion.div>
                          );
                        });
                      })()}
                    </div>
                  </div>

                  {/* Simulated Telemetry Log ticker specific to results */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4.5 space-y-2 text-left shadow-2xs">
                    <span className="text-[8.5px] font-mono font-extrabold text-slate-500 tracking-widest uppercase block">Dynamic Workspace Integration Logs</span>
                    <div className="max-h-[85px] overflow-y-auto space-y-1.5 pr-2">
                      <div className="text-[11px] font-mono text-blue-600 font-bold">
                        [SYNAPSE_INFO] Cognitive DMN matched {selectedDmnTheme === 'crew' ? CrewSynapseData.length : VesselSynapseData.length} core workflow elements mapping the maritime coordinate grid.
                      </div>
                      <div className="text-[10.5px] font-mono text-slate-600 leading-relaxed">
                        🟢 Client compiled successfully on host 0.0.0.0:3000 to deliver client interface components for {selectedNodeId}.
                      </div>
                      <div className="text-[10.5px] font-mono text-slate-600 leading-relaxed flex items-center gap-1.5">
                        <span className="inline-block h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        <span>[NETWORK-MESH] Secured handshake verification on node '{selectedNodeId}' completed in 14ms across TITAN auth proxies.</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Disabled background data per user request */}
        {false && activeSection === 'project' && (
          <motion.div
            key="project-memory-legacy"
            initial={{ opacity: 0, scale: 0.99, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.99, y: -10 }}
            transition={{ duration: 0.35 }}
            className="flex flex-col gap-8 w-full relative z-10"
          >
            {/* ==================== GODMODE SUPREME CONSOLE PANEL ==================== */}
            <div 
              id="godmode-synaptic-panel" 
              className="bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950/40 border border-[#22d3ee]/25 rounded-2xl p-6 relative overflow-hidden backdrop-blur-md text-left shadow-2xl shadow-indigo-950/20"
            >
              <div className="absolute top-0 right-0 w-80 h-40 bg-cyan-500/5 rounded-full filter blur-[80px] pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-60 h-40 bg-indigo-500/5 rounded-full filter blur-[80px] pointer-events-none" />

              {/* Header block (Hidden per user request, moved to Workspace Agents) */}
              <div className="hidden">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-cyan-950 text-cyan-300 font-bold border border-cyan-500/35 font-mono px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                      <Brain className="w-3.5 h-3.5 text-cyan-400 rotate-12" />
                      MASTER AGENT
                    </span>
                    <h2 className="text-md font-mono font-bold tracking-wider text-white uppercase flex items-center gap-1">
                      "GODMODE" Unified Cognitive Workspace
                    </h2>
                  </div>
                  <p className="text-xs text-slate-300 max-w-2xl font-sans leading-relaxed">
                    A supreme intelligence nexus aggregating JIRA backlogs, user stories, and application flows from all three configured micro-apps. Maintains persistent memory of cross-product connections, data streams, and operational pipeline routes automatically.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 font-mono shrink-0">
                  <button 
                    onClick={() => {
                      setGodmodeActive(!godmodeActive);
                      setSimulatedLogs(prev => [`[SYSTEM] GODMODE toggled to ${!godmodeActive ? 'ONLINE' : 'SHUTDOWN'} state.`, ...prev]);
                    }}
                    className={`text-[9px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${godmodeActive ? 'bg-cyan-950/45 border-cyan-400/40 text-cyan-300 shadow-teal-900/15' : 'bg-slate-950/80 border-white/10 text-slate-500'}`}
                  >
                    STATUS: {godmodeActive ? '● ALL SYSTEMS SYNCED' : '○ OFFLINE'}
                  </button>
                </div>
              </div>

              {/* Three Way Live Synaptic Pipeline Map */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 pt-5 items-stretch">
                <div className="xl:col-span-8 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono tracking-widest text-[#22d3ee] font-bold block uppercase flex items-center gap-1.5">
                      <Network className="w-4 h-4 text-cyan-400" />
                      Multi-App Roster Sync Pipelines
                    </span>
                    <span className="text-[9px] font-mono text-slate-500 italic">
                      Click flow cards to trace live synchronization pathways
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Pipeline A */}
                    <button
                      onClick={() => {
                        setActiveCrossPipeline("Crew Sign-In");
                        handleConsultGodmode("how do the crew sign-in, security tokens, and hours tracking relate?");
                      }}
                      className={`text-left p-3.5 rounded-xl border transition-all relative flex flex-col justify-between h-36 cursor-pointer ${activeCrossPipeline === "Crew Sign-In" ? 'bg-slate-900/90 border-[#22d3ee]/40 ring-1 ring-[#22d3ee]/10 shadow-lg' : 'bg-slate-950/40 border-white/5 hover:border-white/10 hover:bg-slate-950/70'}`}
                    >
                      <div className="space-y-1">
                        <span className="text-[8px] font-mono font-bold uppercase py-0.5 px-1.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/20 inline-block">Pipeline Alpha</span>
                        <h4 className="text-xs font-mono font-bold text-white mt-1">Crew Sign-In & Secure Gateway</h4>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-normal line-clamp-2 font-sans">
                        Tracks Crew Sign-In (Phoenix) &rarr; Route Proxying validation (Titan) &rarr; Logger database initialization (Odyssey).
                      </p>
                    </button>

                    {/* Pipeline B */}
                    <button
                      onClick={() => {
                        setActiveCrossPipeline("Certification Sync");
                        handleConsultGodmode("how do compliant certifications and workshift allocation timing connect?");
                      }}
                      className={`text-left p-3.5 rounded-xl border transition-all relative flex flex-col justify-between h-36 cursor-pointer ${activeCrossPipeline === "Certification Sync" ? 'bg-slate-900/90 border-indigo-400/40 ring-1 ring-indigo-500/10 shadow-lg' : 'bg-slate-950/40 border-white/5 hover:border-white/10 hover:bg-slate-950/70'}`}
                    >
                      <div className="space-y-1">
                        <span className="text-[8px] font-mono font-bold uppercase py-0.5 px-1.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-500/20 inline-block">Pipeline Beta</span>
                        <h4 className="text-xs font-mono font-bold text-white mt-1">Certification & Shift Scheduler</h4>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-normal line-clamp-2 font-sans">
                        Validates user security passes (Titan) &rarr; Multi-device shift layout calculations (Odyssey) &rarr; Status feedback (Phoenix).
                      </p>
                    </button>

                    {/* Pipeline C */}
                    <button
                      onClick={() => {
                        setActiveCrossPipeline("Payment Audit");
                        handleConsultGodmode("What is the payment salary timing and work hours audit flow?");
                      }}
                      className={`text-left p-3.5 rounded-xl border transition-all relative flex flex-col justify-between h-36 cursor-pointer ${activeCrossPipeline === "Payment Audit" ? 'bg-slate-900/90 border-violet-400/40 ring-1 ring-violet-500/10 shadow-lg' : 'bg-slate-950/40 border-white/5 hover:border-white/10 hover:bg-slate-950/70'}`}
                    >
                      <div className="space-y-1">
                        <span className="text-[8px] font-mono font-bold uppercase py-0.5 px-1.5 rounded bg-violet-950 text-violet-400 border border-indigo-500/20 inline-block">Pipeline Gamma</span>
                        <h4 className="text-xs font-mono font-bold text-white mt-1">Payment Salary & Hours Auditing</h4>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-normal line-clamp-2 font-sans">
                        Computes operational timing parameters (Odyssey) &rarr; Secure financial ledger audit (Titan) &rarr; Interactive ledger logs (Phoenix).
                      </p>
                    </button>
                  </div>

                  {/* SVG Cognitive flow diagram representing live data transfers */}
                  <div className="bg-slate-950/80 border border-white/5 rounded-xl p-4 relative overflow-hidden min-h-[140px] flex flex-col justify-between">
                    <div className="absolute top-1 right-2 text-[9px] font-mono text-slate-650 tracking-wider">REAL-TIME DATA STREAM</div>
                    
                    {/* SVG canvas mapping connection nodes */}
                    <div className="relative h-20 w-full flex items-center justify-between px-10">
                      {/* Interactive pulsing lines background */}
                      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ minWidth: '100%' }}>
                        {/* Gold and Teal animated lines */}
                        <path d="M 120 40 Q 280 15 480 40" fill="none" stroke="url(#gradientTeal)" strokeWidth="1.5" strokeDasharray="5,5" className="animate-[dash_15s_linear_infinite]" />
                        <path d="M 480 40 Q 640 15 820 40" fill="none" stroke="url(#gradientGold)" strokeWidth="1.5" strokeDasharray="5,5" className="animate-[dash_20s_linear_infinite]" />
                        
                        {/* Gradients */}
                        <defs>
                          <linearGradient id="gradientTeal" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.2" />
                            <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.8" />
                            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.2" />
                          </linearGradient>
                          <linearGradient id="gradientGold" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2" />
                            <stop offset="50%" stopColor="#eab308" stopOpacity="0.8" />
                            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.2" />
                          </linearGradient>
                        </defs>
                      </svg>

                      {/* Node A (Phoenix) */}
                      <div className="z-10 flex flex-col items-center space-y-1 text-center bg-slate-900 border border-white/10 px-3 py-1.5 rounded-lg">
                        <span className="text-[8px] font-mono text-cyan-400 font-extrabold uppercase">PHOENIX PORTAL</span>
                        <span className="text-[10px] text-slate-100 font-bold font-sans">Crew User Sign-In</span>
                        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping mt-1" />
                      </div>

                      {/* Central Master Hub GODMODE representing convergence */}
                      <div className="z-10 flex flex-col items-center space-y-1 text-center bg-indigo-950 border border-indigo-500/40 px-5 py-2.5 rounded-xl shadow-lg ring-1 ring-cyan-400/20">
                        <span className="text-[9px] font-mono text-yellow-300 font-bold tracking-widest uppercase">🧠 GODMODE NEXUS</span>
                        <span className="text-[10px] text-indigo-200 font-mono font-extrabold">Active Controller</span>
                      </div>

                      {/* Node B (Titan) */}
                      <div className="z-10 flex flex-col items-center space-y-1 text-center bg-slate-900 border border-white/10 px-3 py-1.5 rounded-lg">
                        <span className="text-[8px] font-mono text-indigo-400 font-extrabold uppercase">TITAN SECURITY</span>
                        <span className="text-[10px] text-slate-100 font-bold font-sans">Proxy Compliance Gate</span>
                        <div className="w-2 h-2 rounded-full bg-indigo-400 animate-ping mt-1" />
                      </div>

                      {/* Node C (Odyssey) */}
                      <div className="z-10 flex flex-col items-center space-y-1 text-center bg-slate-900 border border-white/10 px-3 py-1.5 rounded-lg">
                        <span className="text-[8px] font-mono text-yellow-400 font-extrabold uppercase">ODYSSEY TELEMETRY</span>
                        <span className="text-[10px] text-slate-100 font-bold font-sans">Shift Allocation Logs</span>
                        <div className="w-2 h-2 rounded-full bg-yellow-400 animate-ping mt-1" />
                      </div>
                    </div>

                    <div className="bg-slate-900/60 p-2 border border-white/3 rounded-lg flex items-center justify-between text-[10.5px] text-slate-350 font-sans mt-2">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span>Active Pipeline Selection: <strong className="font-mono text-cyan-300">"{activeCrossPipeline}"</strong>. Tracing security permissions and telemetry triggers between the repositories.</span>
                      </div>
                      <span className="text-[9px] font-mono text-slate-500 shrink-0 hidden md:inline">Latency: 2ms</span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Interactive Prompt & Real-time Log Engine */}
                <div className="xl:col-span-4 flex flex-col justify-between space-y-4">
                  {/* Real-time sync logs terminal */}
                  <div className="bg-slate-950 border border-white/5 rounded-xl p-4 flex-grow flex flex-col justify-between space-y-3 relative font-mono text-[10px]">
                    <div className="flex items-center justify-between text-slate-500 pb-1.5 border-b border-white/3">
                      <span className="text-[9px] font-bold tracking-wider uppercase text-slate-450">Synaptic Activity Roster Logs</span>
                      <span className="text-[8px] text-emerald-400 bg-emerald-950 px-1.5 rounded uppercase animate-pulse">Live Ticker</span>
                    </div>

                    <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1 text-left flex-grow font-mono leading-relaxed select-text mt-1">
                      {simulatedLogs.map((log, idx) => (
                        <div key={idx} className={`truncate ${log.includes("GODMODE") ? "text-cyan-450" : log.includes("TITAN") ? "text-indigo-400" : log.includes("PHOENIX") ? "text-slate-300" : "text-yellow-400/80"}`}>
                          {log}
                        </div>
                      ))}
                    </div>

                    <div className="text-[9px] text-slate-500 italic mt-1 text-left">
                      Logs generated from active micro-app user stories
                    </div>
                  </div>

                  {/* Ask anything prompt box */}
                  <div className="bg-slate-950/60 border border-white/5 rounded-xl p-4 space-y-2">
                    <span className="text-[9.5px] font-mono text-yellow-400 font-bold block uppercase tracking-wider">
                      Consult Unified Memory Agent
                    </span>
                    <p className="text-[10px] text-slate-400 leading-normal font-sans">
                      Ask about cross-project integrations, multi-app dependencies, or stakeholder task distributions.
                    </p>

                    <div className="flex flex-wrap gap-1 mt-1.5">
                      <button
                        onClick={() => handleConsultGodmode("Tell me how Titan Phoenix and Odyssey connect")}
                        className="px-2 py-1 text-[9px] font-mono bg-slate-900 border border-white/5 hover:border-cyan-500/20 text-slate-300 rounded cursor-pointer leading-none hover:bg-slate-950"
                      >
                        "Explain app connections"
                      </button>
                      <button
                        onClick={() => handleConsultGodmode("Who is Aisha Rahman and where does she work?")}
                        className="px-2 py-1 text-[9px] font-mono bg-slate-900 border border-white/5 hover:border-cyan-500/20 text-slate-300 rounded cursor-pointer leading-none hover:bg-slate-950"
                      >
                        "Lookup user stories"
                      </button>
                    </div>

                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleConsultGodmode();
                      }}
                      className="flex gap-1.5 pt-2"
                    >
                      <input
                        type="search"
                        className="flex-grow bg-slate-950 border border-white/10 px-2.5 py-1.5 rounded text-[10px] font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 outline-none"
                        placeholder="Ask GODMODE on apps relationship..."
                        value={godmodeQuery}
                        onChange={(e) => setGodmodeQuery(e.target.value)}
                        disabled={godmodeLoading}
                      />
                      <button
                        type="submit"
                        disabled={godmodeLoading || !godmodeQuery.trim()}
                        className="bg-indigo-650 hover:bg-indigo-600 border border-white/10 text-white font-mono font-bold text-[9px] px-2.5 py-1.5 rounded cursor-pointer flex items-center gap-1 disabled:opacity-40"
                      >
                        {godmodeLoading ? "SCAN..." : "ASK"}
                      </button>
                    </form>
                  </div>
                </div>
              </div>

              {/* Godmode result modal/expansion inside container */}
              {godmodeResult && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-950 border border-[#22d3ee]/20 p-4.5 rounded-xl text-left text-xs font-mono select-text mt-4 space-y-2 max-h-[220px] overflow-y-auto"
                >
                  <div className="flex items-center justify-between text-[#22d3ee] border-b border-white/5 pb-1.5 text-[9.5px]">
                    <span className="font-bold flex items-center gap-1">
                      <Terminal className="w-3.5 h-3.5" />
                      GODMODE CONSOLIDATED OUTPUT
                    </span>
                    <button 
                      onClick={() => setGodmodeResult(null)}
                      className="text-slate-500 hover:text-white cursor-pointer px-1 text-[11px]"
                    >
                      [✕ CLOSE]
                    </button>
                  </div>
                  <div className="text-slate-200 whitespace-pre-wrap leading-relaxed font-sans prose prose-invert max-w-none text-[11px]">
                    {godmodeResult}
                  </div>
                </motion.div>
              )}
            </div>

            {/* ==================== CORE COLUMNS: ORIGINAL MAP & PROJECTS ==================== */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              {/* Left Dynamic Interactive Interconnecting Web Map */}
              <div className="lg:col-span-5 bg-gradient-to-b from-slate-900/40 to-slate-950 border border-white/5 rounded-2xl p-6 flex flex-col justify-between relative min-h-[480px] overflow-hidden backdrop-blur-md shadow-xl text-left">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono tracking-widest text-indigo-400 font-bold block uppercase font-mono">
                      Workspace Inter-Links Map
                    </span>
                    <div className="flex items-center gap-1 text-[9px] font-mono text-slate-500 bg-white/2 px-2 py-0.5 rounded border border-white/5 font-mono">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" /> LIVE JIRA DIRECTORY
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-405 leading-relaxed font-sans">
                  The synapse maps actual linkages between Projects. Select a Node to expand its user stories, linked members, and sprint parameters.
                </p>

                {/* SVG Interconnecting Project Map Web */}
                <div className="aspect-square w-full max-w-[280px] mx-auto relative select-none mt-4">
                  <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible relative">
                    <defs>
                      <radialGradient id="ringGlow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#818cf8" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
                      </radialGradient>
                    </defs>

                    {/* Shared Axis Ring */}
                    <circle cx="100" cy="100" r="50" fill="none" stroke="rgba(99, 102, 241, 0.1)" strokeWidth="0.75" strokeDasharray="3,3" />

                    {/* Render Interconnections - drawing paths between project vertices */}
                    {projects.map((proj, pIdx) => {
                      const angle = (pIdx / Math.max(projects.length, 1)) * 2 * Math.PI - Math.PI / 2;
                      const x = 100 + 50 * Math.cos(angle);
                      const y = 100 + 50 * Math.sin(angle);
                      
                      // Link each project to the next to display "how they link/influence each other"
                      const nextIdx = (pIdx + 1) % projects.length;
                      const nextAngle = (nextIdx / Math.max(projects.length, 1)) * 2 * Math.PI - Math.PI / 2;
                      const nextX = 100 + 50 * Math.cos(nextAngle);
                      const nextY = 100 + 50 * Math.sin(nextAngle);

                      const isSelected = selectedProjectId === proj.id;

                      return (
                        <g key={`links-${proj.id}`}>
                          {/* Interconnect link */}
                          <line
                            x1={x}
                            y1={y}
                            x2={nextX}
                            y2={nextY}
                            stroke={isSelected ? "#22d3ee" : "rgba(99, 102, 241, 0.25)"}
                            strokeWidth={isSelected ? "1.25" : "0.75"}
                            className="transition-all duration-300"
                          />
                          
                          {/* Link lines to absolute core */}
                          <line
                            x1="100"
                            y1="100"
                            x2={x}
                            y2={y}
                            stroke="rgba(99,102,241,0.08)"
                            strokeWidth="0.5"
                          />
                        </g>
                      );
                    })}

                    {/* Center point representing Jira Sync instance */}
                    <circle cx="100" cy="100" r="14" fill="url(#ringGlow)" />
                    <circle cx="100" cy="100" r="4" fill="#6366f1" className="animate-ping" />
                    <circle cx="100" cy="100" r="2.5" fill="#22d3ee" />

                    {/* Project Node representation */}
                    {projects.map((proj, pIdx) => {
                      const angle = (pIdx / Math.max(projects.length, 1)) * 2 * Math.PI - Math.PI / 2;
                      const x = 100 + 50 * Math.cos(angle);
                      const y = 100 + 50 * Math.sin(angle);
                      const isSelected = selectedProjectId === proj.id;

                      return (
                        <g 
                          key={`node-${proj.id}`} 
                          transform={`translate(${x}, ${y})`} 
                          className="cursor-pointer"
                          onClick={() => setSelectedProjectId(proj.id)}
                        >
                          <circle r={isSelected ? "7" : "5"} fill={isSelected ? "#22d3ee" : "#312e81"} stroke={isSelected ? "#ffffff" : "rgba(99, 102, 241, 0.5)"} strokeWidth="1" />
                          <circle r="1.5" fill="white" />
                        </g>
                      );
                    })}
                  </svg>

                  {/* SVG Node Label Text overlays */}
                  {projects.map((proj, pIdx) => {
                    const angle = (pIdx / Math.max(projects.length, 1)) * 2 * Math.PI - Math.PI / 2;
                    const x = 100 + 50 * Math.cos(angle);
                    const y = 100 + 50 * Math.sin(angle);
                    const isSelected = selectedProjectId === proj.id;

                    return (
                      <div
                        key={`label-${proj.id}`}
                        className="absolute text-[8.5px] font-mono bg-slate-950/90 border px-1.5 py-0.5 rounded transition-all whitespace-nowrap pointer-events-none translate-x-[-50%] translate-y-[-50%]"
                        style={{
                          left: `${(x / 200) * 100}%`,
                          top: `${(y / 200) * 100}%`,
                          marginTop: '15px',
                          borderColor: isSelected ? 'rgba(34, 211, 238, 0.35)' : 'rgba(255,255,255,0.04)',
                          color: isSelected ? '#22d3ee' : '#cbd5e1',
                          zIndex: isSelected ? 20 : 10
                        }}
                      >
                        {proj.key}
                      </div>
                    );
                  })}
                </div>

                {/* Quick selector sidebar lists */}
                <div className="border-t border-slate-200 pt-4 mt-4 space-y-2.5">
                <span className="text-[9.5px] font-mono text-slate-500 uppercase tracking-widest block font-bold">DIRECTORY ARCHIVES</span>
                <div className="flex flex-col gap-1.5">
                  {projects.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedProjectId(p.id)}
                      className={`cursor-pointer w-full text-left font-mono text-xs p-2.5 rounded-lg border flex items-center justify-between transition-all ${selectedProjectId === p.id ? 'bg-blue-600 border-blue-500 text-white font-bold shadow-xs' : 'bg-white border-slate-200 text-slate-700 hover:text-blue-600 hover:bg-slate-50'}`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <GitCommit className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{p.name}</span>
                      </div>
                      <span className="text-[10px] shrink-0 font-bold font-mono text-slate-500 flex items-center gap-1">
                        JIRA KEY: <strong className={`px-1.5 py-0.5 rounded border text-[9.5px] ${selectedProjectId === p.id ? 'bg-white/20 border-white/30 text-white' : 'bg-slate-100 border-slate-200 text-slate-900'}`}>{p.key}</strong>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Interactive Learned User Stories Panel */}
            <div className="lg:col-span-7 flex flex-col justify-between">
              {activeProject ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 flex-grow flex flex-col justify-between relative overflow-hidden text-left shadow-md">
                  <div className="space-y-4">
                    <span className="text-[10px] font-mono tracking-widest text-blue-600 font-bold block uppercase">
                      PROJECT MEMORY MATRIX FOR: {activeProject.key}
                    </span>

                    {/* Node Core Metrics Card */}
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2 group hover:border-blue-500/20 transition-all">
                      <div className="flex items-center justify-between">
                        <h3 className="text-md font-mono font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{activeProject.name}</h3>
                        <span className="text-xs text-indigo-650 font-mono italic">Lead: {activeProject.lead || "Unassigned"}</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed font-sans">{activeProject.description || "No description logged."}</p>
                                        {/* Metric counter grid */}
                      <div className="grid grid-cols-2 gap-4 mt-4 border-t border-slate-200 pt-3 text-xs font-mono">
                        <div className="bg-white p-2 rounded border border-slate-250 flex items-center justify-between">
                          <span className="text-slate-550 uppercase text-[9.5px]">USER STORIES COUNT:</span>
                          <strong className="text-blue-600 text-sm font-bold">{activeProject.userStoriesCount || 0}</strong>
                        </div>
                        <div className="bg-white p-2 rounded border border-slate-250 flex items-center justify-between">
                          <span className="text-slate-550 uppercase text-[9.5px]">BUG/CONFLICT LOGS:</span>
                          <strong className="text-amber-600 text-sm font-bold">{activeProject.bugsCount || 0}</strong>
                        </div>
                      </div>
                    </div>
                                {/* Project Memory Sub Tabs */}
                    <div className="grid grid-cols-3 bg-slate-100 p-1 rounded-xl border border-slate-250 text-center relative z-10 overflow-hidden select-none">
                      <button
                        onClick={() => setProjectDetailTab('stories')}
                        className={`cursor-pointer relative py-2 rounded-lg text-[10px] font-mono font-bold transition-all duration-300 ${projectDetailTab === 'stories' ? 'text-white font-extrabold font-mono' : 'text-slate-500 hover:text-slate-800'}`}
                      >
                        📁 JIRA STORIES
                        {projectDetailTab === 'stories' && (
                          <motion.div 
                            layoutId="activeProjSubTab" 
                            className="absolute inset-0 bg-blue-600 rounded-lg -z-10 shadow-xs"
                            transition={{ type: "spring", stiffness: 420, damping: 30 }}
                          />
                        )}
                      </button>
                      <button
                        onClick={() => setProjectDetailTab('agents')}
                        className={`cursor-pointer relative py-2 rounded-lg text-[10px] font-mono font-bold transition-all duration-300 ${projectDetailTab === 'agents' ? 'text-white font-extrabold font-mono' : 'text-slate-500 hover:text-slate-800'}`}
                      >
                        🤖 TWIN SUB-AGENTS
                        {projectDetailTab === 'agents' && (
                          <motion.div 
                            layoutId="activeProjSubTab" 
                            className="absolute inset-0 bg-blue-600 rounded-lg -z-10 shadow-xs"
                            transition={{ type: "spring", stiffness: 420, damping: 30 }}
                          />
                        )}
                      </button>
                      <button
                        onClick={() => setProjectDetailTab('dmn-model')}
                        className={`cursor-pointer relative py-2 rounded-lg text-[10px] font-mono font-bold transition-all duration-300 ${projectDetailTab === 'dmn-model' ? 'text-white font-extrabold' : 'text-slate-500 hover:text-slate-800'}`}
                      >
                        🧠 COGNITIVE MATRIX
                        {projectDetailTab === 'dmn-model' && (
                          <motion.div 
                            layoutId="activeProjSubTab" 
                            className="absolute inset-0 bg-blue-600 rounded-lg -z-10 shadow-xs"
                            transition={{ type: "spring", stiffness: 420, damping: 30 }}
                          />
                        )}
                      </button>
                    </div>

                    {/* Tab contents */}
                    {projectDetailTab === 'stories' ? (
                      <div className="space-y-4">
                        {/* Synced Jira Backlog / Learned User Stories list */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono tracking-widest text-indigo-650 font-bold block uppercase flex items-center gap-1.5">
                              <CheckSquare className="w-3.5 h-3.5 text-indigo-600" />
                              Learned Jira User Stories ({getSimulatedUserStories(activeProject.key).length})
                            </span>
                            <span className="text-[9px] font-mono text-slate-600 italic bg-slate-100 px-1.5 rounded">
                              Continuous Memory Synced
                            </span>
                          </div>

                          {/* User Stories loop */}
                          <div className="space-y-2.5 max-h-[210px] overflow-y-auto pr-1">
                            {getSimulatedUserStories(activeProject.key).map((story) => (
                              <div 
                                key={story.id}
                                className="bg-slate-50 border border-slate-200 hover:border-blue-200 rounded-xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono transition-all group shadow-3xs"
                              >
                                <div className="space-y-1 text-left flex-grow">
                                  <div className="flex items-center gap-2">
                                    <span className="bg-indigo-55 text-indigo-700 border border-indigo-200 text-[9.5px] px-1.5 rounded font-bold">{story.id}</span>
                                    <span className="text-slate-550 font-normal">Story Points: {story.points}</span>
                                  </div>
                                  <h5 className="text-[11.5px] font-sans text-slate-800 group-hover:text-blue-600 leading-normal line-clamp-1">{story.title}</h5>
                                </div>

                                <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
                                  <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-slate-250 text-[10px]">
                                    <User className="w-3 h-3 text-slate-500" />
                                    <span className="text-slate-650 text-[10.5px] max-w-[80px] truncate">{story.assigneeName}</span>
                                  </div>
                                  <span className={`text-[9.5px] font-bold tracking-wider px-2 py-0.5 rounded select-none ${
                                    story.status === 'Done' ? 'bg-emerald-50 border border-emerald-250 text-emerald-700' :
                                    story.status === 'In Progress' ? 'bg-amber-55 border border-amber-250 text-amber-700' :
                                    'bg-slate-100 border border-slate-200 text-slate-600'
                                  }`}>
                                    {story.status}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Connected team intersections */}
                        <div className="border-t border-slate-150 pt-4 mt-2 flex items-center justify-between gap-4 flex-wrap text-left">
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                            <Users className="w-4 h-4 text-slate-500" />
                            <span>Stakeholders Directory ({activeProject.teamMembers?.length || 0}):</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {activeProject.teamMembers && activeProject.teamMembers.map((email, idx) => (
                              <span key={idx} className="text-[9.5px] font-mono text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-lg shadow-3xs">
                                {email.includes('@') ? email.split('@')[0] : email}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : projectDetailTab === 'agents' ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono tracking-widest text-blue-600 font-bold block uppercase flex items-center gap-1.5">
                            <Cpu className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                            Live Twin Agents (Continuous Stream)
                          </span>
                          <span className="text-[9px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-250 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                            Synchronized with GODMODE
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Agent 1: Jira Story Collector */}
                          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 hover:border-blue-200 transition-all text-left">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <div className="bg-blue-50 p-1.5 rounded text-blue-600 border border-blue-200">
                                  <Database className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                  <h4 className="text-[11px] font-mono font-bold text-slate-800 uppercase tracking-wider">Jira Story Collector</h4>
                                  <p className="text-[8px] font-mono text-slate-500">SYSTEM: @STORY_METRIC_FETCHER</p>
                                </div>
                              </div>
                              <span className="text-[8px] bg-blue-50 text-blue-700 font-mono font-bold border border-blue-200 rounded px-1.5 py-0.5 uppercase animate-pulse">Online</span>
                            </div>

                            <p className="text-[10.5px] text-slate-600 leading-relaxed font-sans">
                              Actively indexes Jira stories, task items, assignee metrics, and story points logs in real-time.
                            </p>

                            <div className="bg-white border border-slate-200 rounded-lg p-2.5 text-[9.5px] font-mono space-y-1.5 text-slate-600 max-h-[140px] overflow-y-auto">
                              <div className="text-blue-600 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                                Completed handshake with Key: {activeProject.key}
                              </div>
                              <div className="flex items-start gap-1">
                                <span className="text-slate-400 mt-0.5 shrink-0">▸</span>
                                <span>Fetched stories: {getSimulatedUserStories(activeProject.key).map(s => s.id).join(", ")}</span>
                              </div>
                              <div className="flex items-start gap-1">
                                <span className="text-slate-400 mt-0.5 shrink-0">▸</span>
                                <span>Story Point Load: {getSimulatedUserStories(activeProject.key).reduce((sum, s) => sum + s.points, 0)} points fully indexed.</span>
                              </div>
                              <div className="text-slate-500 italic">[LIVE]: Feeding fresh user-story variables to corporate DMN memory.</div>
                            </div>
                          </div>

                          {/* Agent 2: Architecture Learner */}
                          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 hover:border-indigo-200 transition-all text-left">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <div className="bg-indigo-50 p-1.5 rounded text-indigo-600 border border-indigo-200 font-bold">
                                  <Layers className="w-4 h-4 text-indigo-600" />
                                </div>
                                <div>
                                  <h4 className="text-[11px] font-mono font-bold text-slate-800 uppercase tracking-wider">Product Flow Learner</h4>
                                  <p className="text-[8px] font-mono text-slate-500">SYSTEM: @ARCHITECTURE_TRACER</p>
                                </div>
                              </div>
                              <span className="text-[8px] bg-indigo-50 text-indigo-700 font-mono font-bold border border-indigo-200 rounded px-1.5 py-0.5 uppercase animate-pulse">Scanned</span>
                            </div>

                            <p className="text-[10.5px] text-slate-600 leading-relaxed font-sans">
                              Scans user journeys, buttons, backend endpoints, and frontend features from JIRA story definitions.
                            </p>

                            <div className="bg-white border border-slate-200 rounded-lg p-2.5 text-[9.5px] font-mono space-y-1.5 text-slate-600 max-h-[140px] overflow-y-auto">
                              <div className="text-indigo-600 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                                Learnt Codebase Footprints:
                              </div>
                              <div className="flex items-start gap-1">
                                <span className="text-slate-400 mt-0.5 shrink-0">▸</span>
                                <span>Mapped 12 active button & click actions</span>
                              </div>
                              <div className="flex items-start gap-1">
                                <span className="text-slate-400 mt-0.5 shrink-0">▸</span>
                                <span>Identified secure express routes (Dev Port: 3000)</span>
                              </div>
                              <div className="flex items-start gap-1 mb-1">
                                <span className="text-slate-400 mt-0.5 shrink-0">▸</span>
                                <span className="text-indigo-700 font-medium">Authenticated login paths cataloged</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Synaptic integration indicator */}
                        <div className="bg-slate-100 border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-left">
                          <div className="space-y-1">
                            <span className="text-[9.5px] font-mono text-blue-600 font-bold block uppercase tracking-wider">
                              Supreme Synergy Gateway
                            </span>
                            <p className="text-xs text-slate-600 leading-relaxed font-sans mt-1">
                              These twin sub-agents run 24/7 inside **{activeProject.name}** and continuously feed cognitive insights into the master **GODMODE** memory cluster!
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              const el = document.getElementById("godmode-synaptic-panel");
                              if (el) el.scrollIntoView({ behavior: "smooth" });
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-mono text-[10px] font-bold px-3 py-2 rounded-lg cursor-pointer transition-all active:scale-95 flex items-center gap-1 shrink-0"
                          >
                            <Brain className="w-3.5 h-3.5" />
                            GODMODE HUB ↓
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                              {!learnState.isLearnt && !learnState.isLearning && (
                                <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center space-y-4">
                                  <div className="w-12 h-12 bg-indigo-50 border border-indigo-200 text-indigo-650 rounded-full flex items-center justify-center mx-auto animate-pulse">
                                    <Brain className="w-6 h-6" />
                                  </div>
                                  <div className="space-y-1">
                                    <h4 className="text-sm font-mono font-bold text-slate-800 uppercase">Cognitive Synthesis Required</h4>
                                    <p className="text-xs text-slate-600 max-w-md mx-auto leading-normal">
                                      The Default Mode Network has loaded this project's Jira metadata but has not yet initiated the deep cognitive studies mapping internal linkages.
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => handleStudyProject(activeProject.id)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-mono font-bold px-6 py-2.5 rounded-lg cursor-pointer transition-colors inline-flex items-center gap-2 shadow-sm"
                                  >
                                    <Sparkles className="w-3.5 h-3.5" />
                                    INITIATE DEEP COGNITIVE STUDY
                                  </button>
                                </div>
                              )}

                              {learnState.isLearning && (
                                <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center space-y-4">
                                  <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                                    <motion.div 
                                      className="absolute inset-0 border border-t-blue-600 border-r-indigo-650 border-b-sky-500 border-l-transparent rounded-full"
                                      animate={{ rotate: 360 }}
                                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                    />
                                    <Brain className="w-6 h-6 text-indigo-600 animate-pulse" />
                                  </div>
                                  <div className="space-y-2">
                                    <h4 className="text-xs font-mono font-bold text-blue-600 uppercase tracking-widest">
                                      Analyzing & Learning Sprint Assets {learnState.progress}%
                                    </h4>
                                    <p className="text-[11px] font-mono text-slate-500 italic">
                                      {learnState.stepText}
                                    </p>
                                  </div>
                                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden border border-slate-300 max-w-xs mx-auto">
                                    <motion.div 
                                      className="h-full bg-gradient-to-r from-blue-600 to-indigo-650" 
                                      style={{ width: `${learnState.progress}%` }}
                                    />
                                  </div>
                                </div>
                              )}

                              {learnState.isLearnt && (
                                <motion.div 
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="space-y-4"
                                >
                                  {/* Sync and Success status bar */}
                                  <div className="bg-emerald-50 border border-emerald-250 rounded-xl p-3 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <ShieldCheck className="w-4 h-4 text-emerald-700 animate-pulse" />
                                      <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase tracking-wider">
                                        DMN Cognitive Analysis Fully Loaded (100%)
                                      </span>
                                    </div>
                                    <span className="text-[9px] font-mono text-slate-600">
                                      Synthesized {getSimulatedUserStories(activeProject.key).length} Stories
                                    </span>
                                  </div>

                                  {/* Executive Summary synthesis */}
                                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                                    <span className="text-[9px] font-mono text-blue-600 font-bold block uppercase tracking-wider">
                                      Synthesized Executive Summary of all User Stories
                                    </span>
                                    <p className="text-xs text-slate-600 leading-relaxed font-sans mt-0.5">
                                      {info.summary}
                                    </p>
                                  </div>

                                  {/* Core Memorized Takeaways bullets */}
                                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                                    <span className="text-[9px] font-mono text-indigo-650 font-bold block uppercase tracking-wider">
                                      Learnt Project Brain-Insights
                                    </span>
                                    <ul className="space-y-1.5 mt-2">
                                      {info.insights.map((ins, i) => (
                                        <li key={i} className="text-xs text-slate-600 font-sans flex items-start gap-2 leading-relaxed">
                                          <CornerDownRight className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                                          <span>{ins}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>

                                  {/* Interactive Q&A chat under the project */}
                                  <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50">
                                    <span className="text-[9px] font-mono text-blue-600 font-bold block uppercase tracking-wider flex items-center gap-1">
                                      <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                                      Prompt DMN Memory: Project Q&A
                                    </span>
                                    <p className="text-[10.5px] text-slate-500 leading-normal font-sans">
                                      Ask me any specific detail, role allocation, or story deliverable in {activeProject.key}. DMN remembers everything listed in all user stories in this project.
                                    </p>

                                    {/* Custom quick click queries */}
                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                      {info.qa.map((item, idx) => (
                                        <button
                                          key={idx}
                                          onClick={() => handleAskProjectDmn(activeProject.id, item.q)}
                                          disabled={projectAiLoading}
                                          className="px-2 py-1 text-[9.5px] font-mono text-left bg-white border border-slate-200 hover:border-blue-300 text-slate-700 rounded hover:bg-slate-50 transition-colors cursor-pointer"
                                        >
                                          "{item.q}"
                                        </button>
                                      ))}
                                    </div>

                                    {/* Answers transcript list */}
                                    {learnState.qaHistory && learnState.qaHistory.length > 0 && (
                                      <div className="space-y-3.5 border-t border-slate-200 pt-3 mt-2 max-h-[160px] overflow-y-auto pr-1">
                                        {learnState.qaHistory.map((h, hIdx) => (
                                          <div key={hIdx} className="space-y-1 font-mono text-xs text-left">
                                            <div className="flex items-center gap-1.5 text-blue-600 text-[10px]">
                                              <User className="w-3 h-3 text-slate-500" />
                                              <span className="font-bold">YOU:</span>
                                              <span className="text-slate-600">{h.q}</span>
                                            </div>
                                            <div className="flex items-start gap-1.5 bg-white border border-slate-200 p-2.5 rounded-lg text-slate-700">
                                              <Brain className="w-3.5 h-3.5 text-indigo-650 shrink-0 mt-0.5" />
                                              <p className="font-sans text-[11px] leading-relaxed select-text">{h.a}</p>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}

                                    {/* Typing input form */}
                                    <form 
                                      onSubmit={(e) => {
                                        e.preventDefault();
                                        handleAskProjectDmn(activeProject.id, projectQuery);
                                      }}
                                      className="flex gap-2 pt-2"
                                    >
                                      <input
                                        type="text"
                                        className="flex-grow bg-white hover:bg-slate-50/50 border border-slate-250 px-3 py-2 rounded-lg text-[11px] font-sans focus:outline-none focus:border-blue-500 text-slate-800 placeholder-slate-400 outline-none"
                                        placeholder="e.g. Ask about Sarah Connor's tasks or high risk issues"
                                        value={projectQuery}
                                        onChange={(e) => setProjectQuery(e.target.value)}
                                        disabled={projectAiLoading}
                                      />
                                      <button
                                        type="submit"
                                        disabled={projectAiLoading || !projectQuery.trim()}
                                        className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-mono font-bold px-3 py-2 rounded-lg cursor-pointer transition-colors flex items-center gap-1 shrink-0 disabled:opacity-50"
                                      >
                                        <Send className="w-3 h-3" />
                                        {projectAiLoading ? "SCANNING..." : "ASK"}
                                      </button>
                                    </form>
                                  </div>
                                </motion.div>
                              )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-12 text-center flex items-center justify-center text-slate-500 font-mono">
                  No active project nodes mapped in space.
                </div>
              )}
            </div>
          </div>
          </motion.div>
        )}

        {/* ===================================== SECTION 2: MEETING MEMORY ===================================== */}
        {activeSection === 'meeting' && (
          <motion.div
            key="meeting-memory"
            initial={{ opacity: 0, scale: 0.99, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.99, y: -10 }}
            transition={{ duration: 0.35 }}
            className="space-y-6"
          >
            {/* Header / Sub-branding */}
            <div className="flex items-center justify-between flex-wrap gap-3 text-left">
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-600 text-[10px] font-mono uppercase font-bold tracking-widest">
                  <Brain className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                  DMN Cognitive Audio Hub
                </span>
                <h3 className="text-lg font-display font-medium text-slate-800 mt-1.5">Meeting Memory Nexus</h3>
                <p className="text-xs text-slate-500">Access historical team sync events, transcribed multilingual dialogues, automated minutes, and action items.</p>
              </div>
            </div>

            {/* Hero Summary Grid - Styled exactly like ProjectDetails.tsx */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="md:col-span-2 space-y-3">
                <div className="flex items-center gap-2.5">
                  <span className="bg-blue-600 border border-blue-500 text-white font-mono text-xs font-bold px-2 py-0.5 rounded">
                    DMN
                  </span>
                  <h2 className="text-2xl font-display font-medium text-slate-800 tracking-tight leading-none">Unified Meeting Memory</h2>
                </div>
                <p className="text-slate-650 text-sm leading-relaxed">
                  This workspace is monitored by the master <strong className="text-slate-800">Prime Meeting Memory Agent</strong>. It synthesizes raw transcript dialogues, detailed action items, regional dialects, and compliance reports received from individual <strong className="text-slate-800">Alive Meeting Agents</strong> representing each recorded sync event.
                </p>
                <div className="pt-2 text-xs text-slate-400 font-mono">
                  <span>Primary Indexer: <strong className="text-slate-600 font-sans">Prime Memory Agent Core</strong></span>
                </div>
              </div>

              {/* Dynamic Metric Blocks - Styled exactly like ProjectDetails.tsx */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-4 text-center flex flex-col justify-center">
                  <Calendar className="w-5 h-5 text-blue-600 mx-auto mb-1.5" />
                  <span className="text-[10.5px] uppercase tracking-wider font-mono font-black text-slate-950">Total Syncs</span>
                  <span className="text-xl font-black text-blue-800 font-mono mt-0.5">{meetings.length}</span>
                </div>
                <div className="bg-rose-50/60 border border-rose-200 rounded-xl p-4 text-center flex flex-col justify-center">
                  <CheckSquare className="w-5 h-5 text-rose-600 mx-auto mb-1.5" />
                  <span className="text-[10.5px] uppercase tracking-wider font-mono font-black text-slate-950">Action Items</span>
                  <span className="text-xl font-black text-rose-800 font-mono mt-0.5">
                    {meetings.reduce((acc, m) => acc + (m.actionItems?.length || 0), 0)}
                  </span>
                </div>
                <div className="bg-slate-100/60 border border-slate-300 rounded-xl p-4 text-center flex flex-col justify-center">
                  <Languages className="w-5 h-5 text-slate-700 mx-auto mb-1.5" />
                  <span className="text-[10.5px] uppercase tracking-wider font-mono font-black text-slate-950">Languages</span>
                  <span className="text-xl font-black text-slate-950 font-mono mt-0.5">
                    {Array.from(new Set(meetings.map(m => m.originalLanguage || "English"))).length}
                  </span>
                </div>
              </div>
            </div>

            {/* Oracle Consult - Styled beautifully like a clean Project Memory card */}
            <div className="bg-white border border-slate-200 p-6 rounded-xl text-left shadow-xs space-y-4">
              <span className="text-[10px] font-mono tracking-widest text-blue-600 font-bold block uppercase flex items-center gap-1.5">
                <Brain className="w-4 h-4 text-blue-600 animate-pulse" />
                PRIME MEETING MEMORY AGENT ORACLE
              </span>
              <p className="text-xs text-slate-600 leading-normal font-sans">
                Ask anything across all configured team sync events. The AI crawler will perform NLU semantic synthesis across all meeting memory archives.
              </p>
              
              <form 
                onSubmit={(e) => { e.preventDefault(); handleConsultOracle(); }}
                className="relative flex gap-2"
              >
                <div className="relative flex-grow">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Search master meeting memory: What you are looking for..."
                    value={oracleQuery}
                    onChange={(e) => setOracleQuery(e.target.value)}
                    className="w-full bg-white hover:bg-slate-50 border border-slate-200 focus:border-blue-500 pl-10 pr-4 py-3 rounded-xl text-xs font-sans focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 transition-all outline-none placeholder-slate-400"
                  />
                </div>
                <button
                  type="submit"
                  disabled={oracleLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-mono font-bold px-5 py-3 rounded-xl cursor-pointer transition-colors shrink-0 flex items-center gap-1.5 shadow-sm border border-transparent disabled:opacity-45"
                >
                  {oracleLoading ? "Searching..." : "Search"}
                </button>
              </form>

              {/* Preset prompt pills with yellow high-contrast style */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider font-mono mr-1">PREBUILT SYNAPSE PROMPTS:</span>
                {[
                  "Malayalam language meeting takeaways",
                  "Security, databases status & corporate sync",
                  "What action items are assigned to David Chen?",
                  "Is there any dependency on crew and timesheet?",
                ].map((presetText) => (
                  <button
                    key={presetText}
                    type="button"
                    onClick={() => handleConsultOracle(presetText)}
                    className="px-2.5 py-1 text-[9.5px] font-mono font-bold text-slate-900 bg-yellow-400 hover:bg-yellow-500 border border-yellow-500/20 rounded-lg transition-colors cursor-pointer shadow-3xs"
                  >
                    <Sparkles className="w-2.5 h-2.5 text-slate-900 shrink-0 inline-block mr-1" />
                    {presetText}
                  </button>
                ))}
              </div>

              {/* Response layout */}
              {(oracleResponse || oracleLoading || oracleError) && (
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3 mt-4 text-left shadow-2xs">
                  <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                    <span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-ping" />
                    <span className="text-[10px] font-mono text-blue-600 font-bold uppercase tracking-widest">PRIME AGENT COGNITIVE MEMORY SYNTHESIS</span>
                  </div>

                  {oracleLoading ? (
                    <div className="py-12 text-center space-y-4">
                      <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                        <motion.div 
                          className="absolute inset-0 border border-t-blue-600 border-r-indigo-650 border-b-sky-500 border-l-transparent rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        />
                        <motion.div 
                          className="absolute w-12 h-12 border border-t-sky-500 border-r-transparent border-b-blue-600 border-l-indigo-650 rounded-full"
                          animate={{ rotate: -360 }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        />
                        <Brain className="w-6 h-6 text-indigo-600 animate-pulse relative z-10" />
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono leading-relaxed">Scanning neural memory grid matrix and fetching multilingual records...</p>
                    </div>
                  ) : oracleError ? (
                    <div className="p-3 bg-rose-50 border border-rose-250 text-rose-700 rounded text-xs font-mono">
                      {oracleError}
                    </div>
                  ) : (
                    <>
                      <div className="max-h-[450px] overflow-y-auto pr-2 bg-white rounded-xl p-5 border border-slate-200 text-slate-800 shadow-sm font-sans leading-relaxed text-sm">
                        {oracleResponse ? parseComplexFormat(oracleResponse) : null}
                      </div>

                      {/* Display Matched Meetings list */}
                      {searchedKeyword && (
                        <div className="mt-6 border-t border-slate-200 pt-5 space-y-4">
                          <h4 className="text-xs font-mono font-bold text-slate-900 tracking-wider flex items-center gap-2">
                            <Search className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                            {oracleMatchedMeetings.length > 0 ? (
                              <>SEMANTIC COGNITIVE ENGINE: "{searchedKeyword.toUpperCase()}" ({oracleMatchedMeetings.length} MEETINGS MATCHED)</>
                            ) : (
                              <>DETAILED KEYWORD MATCHING ENGINE: "{searchedKeyword.toUpperCase()}" ({getMatchedMeetings().length} MEETINGS MATCHED)</>
                            )}
                          </h4>

                          {oracleMatchedMeetings.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-1">
                              {oracleMatchedMeetings.map((item) => {
                                const m = meetings.find(meeting => meeting.id === item.id);
                                if (!m) return null;

                                return (
                                  <div key={m.id} className="bg-white border border-slate-200 hover:border-blue-300 rounded-xl p-4 shadow-sm hover:shadow-md transition-all relative flex flex-col justify-between text-left">
                                    <div>
                                      {/* Meeting header */}
                                      <div className="flex items-start justify-between gap-2 border-b border-slate-150 pb-2 mb-3">
                                        <div>
                                          <h5 className="text-xs font-bold text-slate-900 leading-snug">
                                            {highlightKeyword(m.title, searchedKeyword)}
                                          </h5>
                                          <p className="text-[10px] text-slate-500 mt-1 font-sans">
                                            Project: <span className="font-mono text-indigo-650 font-semibold">{m.projectName}</span> • Host: <span className="font-medium text-slate-700">{m.organizer}</span>
                                          </p>
                                        </div>
                                        <span className="text-[9px] font-mono bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded font-semibold shrink-0">
                                          {m.date}
                                        </span>
                                      </div>

                                      {/* AI Relevance Explanation */}
                                      {item.relevanceReason && (
                                        <div className="mb-3 bg-indigo-50/40 p-2.5 rounded-lg border border-indigo-100/50">
                                          <span className="text-[9px] font-mono uppercase font-bold text-indigo-600 flex items-center gap-1 mb-1">
                                            <Sparkles className="w-2.5 h-2.5 animate-pulse" /> AI Semantic Connection
                                          </span>
                                          <p className="text-[11px] text-indigo-950 font-sans leading-relaxed italic">
                                            "{item.relevanceReason}"
                                          </p>
                                        </div>
                                      )}

                                      {/* Key takeaways / points */}
                                      {item.matchedPoints && item.matchedPoints.length > 0 ? (
                                        <div className="mb-3">
                                          <span className="text-[9px] font-mono uppercase font-bold text-indigo-655 text-indigo-600 block mb-1">Semantically Matched Points</span>
                                          <ul className="space-y-1.5">
                                            {item.matchedPoints.map((pt, i) => (
                                              <li key={`match-${i}`} className="text-[11px] font-sans leading-relaxed text-slate-900 pl-4 relative bg-blue-50/30 p-1 rounded-md border border-blue-100/40">
                                                <span className="absolute left-1.5 top-2 w-1.5 h-1.5 rounded-full bg-blue-500" />
                                                {highlightKeyword(pt, searchedKeyword)}
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      ) : m.mainPoints && m.mainPoints.length > 0 ? (
                                        <div className="mb-3">
                                          <span className="text-[9px] font-mono uppercase font-bold text-slate-400 block mb-1">Key Takeaways & Points</span>
                                          <ul className="space-y-1.5">
                                            {m.mainPoints.map((pt, i) => (
                                              <li key={`other-${i}`} className="text-[11px] font-sans leading-relaxed text-slate-500 pl-4 relative">
                                                <span className="absolute left-1.5 top-2 w-1 h-1 rounded-full bg-slate-300" />
                                                {highlightKeyword(pt, searchedKeyword)}
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      ) : null}

                                      {/* Action items */}
                                      {item.matchedActionItems && item.matchedActionItems.length > 0 ? (
                                        <div className="mb-3">
                                          <span className="text-[9px] font-mono uppercase font-bold text-amber-600 block mb-1">Relevant Action Items</span>
                                          <ul className="space-y-1.5">
                                            {item.matchedActionItems.map((act, i) => (
                                              <li key={`act-match-${i}`} className="text-[11px] font-sans leading-relaxed text-slate-900 pl-4 relative bg-amber-50/50 p-1 rounded-md border border-amber-100/40 font-medium">
                                                <span className="absolute left-1.5 top-2.5 w-1.5 h-1.5 rounded-full bg-amber-500" />
                                                {highlightKeyword(act, searchedKeyword)}
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      ) : m.actionItems && m.actionItems.length > 0 ? (
                                        <div className="mb-3">
                                          <span className="text-[9px] font-mono uppercase font-bold text-amber-650 text-amber-600 block mb-1">Action Items</span>
                                          <ul className="space-y-1.5">
                                            {m.actionItems.map((act, i) => (
                                              <li key={`act-other-${i}`} className="text-[11px] font-sans leading-relaxed text-slate-500 pl-4 relative">
                                                <span className="absolute left-1.5 top-2 w-1 h-1 rounded-full bg-slate-300" />
                                                {highlightKeyword(act, searchedKeyword)}
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      ) : null}
                                    </div>

                                    {/* Action button to jump */}
                                    <div className="border-t border-slate-100 pt-3 mt-2.5 flex justify-end">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setSelectedMeetingId(m.id);
                                          const el = document.getElementById("meeting-details-anchor");
                                          if (el) {
                                            el.scrollIntoView({ behavior: "smooth" });
                                          }
                                        }}
                                        className="text-[10px] font-mono font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg transition-colors"
                                      >
                                        Jump to Active Transcript <ArrowRight className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            getMatchedMeetings().length === 0 ? (
                              <p className="text-[11px] text-slate-500 font-sans italic bg-slate-50 p-4 rounded-xl border border-slate-200 text-left">
                                No precise bullet points or action items containing "{searchedKeyword}" found in meeting transcripts, summaries, takeaways, or action lists. Try another keyword like "Titan", "Kochi", or "Database".
                              </p>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-1">
                                {getMatchedMeetings().map((m) => {
                                  const matchedMainPoints = m.mainPoints?.filter(pt => pt.toLowerCase().includes(searchedKeyword.toLowerCase())) || [];
                                  const otherMainPoints = m.mainPoints?.filter(pt => !pt.toLowerCase().includes(searchedKeyword.toLowerCase())) || [];
                                  const matchedActionItems = m.actionItems?.filter(item => item.toLowerCase().includes(searchedKeyword.toLowerCase())) || [];
                                  const otherActionItems = m.actionItems?.filter(item => !item.toLowerCase().includes(searchedKeyword.toLowerCase())) || [];

                                  return (
                                    <div key={m.id} className="bg-white border border-slate-200 hover:border-blue-300 rounded-xl p-4 shadow-sm hover:shadow-md transition-all relative flex flex-col justify-between text-left">
                                      <div>
                                        {/* Meeting header */}
                                        <div className="flex items-start justify-between gap-2 border-b border-slate-150 pb-2 mb-3">
                                          <div>
                                            <h5 className="text-xs font-bold text-slate-900 leading-snug">
                                              {highlightKeyword(m.title, searchedKeyword)}
                                            </h5>
                                            <p className="text-[10px] text-slate-500 mt-1 font-sans">
                                              Project: <span className="font-mono text-indigo-650 font-semibold">{m.projectName}</span> • Host: <span className="font-medium text-slate-700">{m.organizer}</span>
                                            </p>
                                          </div>
                                          <span className="text-[9px] font-mono bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded font-semibold shrink-0">
                                            {m.date}
                                          </span>
                                        </div>

                                        {/* MoM Summary if present */}
                                        {m.summary && (
                                          <div className="mb-3 bg-slate-50 p-2.5 rounded-lg border border-slate-150">
                                            <span className="text-[9px] font-mono uppercase font-bold text-slate-400 block mb-1">Minutes Summary</span>
                                            <p className="text-[11px] text-slate-600 font-sans leading-relaxed">
                                              {highlightKeyword(m.summary, searchedKeyword)}
                                            </p>
                                          </div>
                                        )}

                                        {/* Key takeaways / points */}
                                        {m.mainPoints && m.mainPoints.length > 0 && (
                                          <div className="mb-3">
                                            <span className="text-[9px] font-mono uppercase font-bold text-indigo-600 block mb-1">Key Takeaways & Points</span>
                                            <ul className="space-y-1.5">
                                              {matchedMainPoints.map((pt, i) => (
                                                <li key={`match-${i}`} className="text-[11px] font-sans leading-relaxed text-slate-900 pl-4 relative bg-yellow-50/40 p-1 rounded-md border border-yellow-100/40">
                                                  <span className="absolute left-1.5 top-2 w-1.5 h-1.5 rounded-full bg-blue-500" />
                                                  {highlightKeyword(pt, searchedKeyword)}
                                                </li>
                                              ))}
                                              {otherMainPoints.map((pt, i) => (
                                                <li key={`other-${i}`} className="text-[11px] font-sans leading-relaxed text-slate-500 pl-4 relative">
                                                  <span className="absolute left-1.5 top-2 w-1 h-1 rounded-full bg-slate-300" />
                                                  {highlightKeyword(pt, searchedKeyword)}
                                                </li>
                                              ))}
                                            </ul>
                                          </div>
                                        )}

                                        {/* Action items */}
                                        {m.actionItems && m.actionItems.length > 0 && (
                                          <div className="mb-3">
                                            <span className="text-[9px] font-mono uppercase font-bold text-amber-600 block mb-1">Action Items</span>
                                            <ul className="space-y-1.5">
                                              {matchedActionItems.map((item, i) => (
                                                <li key={`act-match-${i}`} className="text-[11px] font-sans leading-relaxed text-slate-900 pl-4 relative bg-amber-50/50 p-1 rounded-md border border-amber-100/40 font-medium">
                                                  <span className="absolute left-1.5 top-2.5 w-1.5 h-1.5 rounded-full bg-amber-500" />
                                                  {highlightKeyword(item, searchedKeyword)}
                                                </li>
                                              ))}
                                              {otherActionItems.map((item, i) => (
                                                <li key={`act-other-${i}`} className="text-[11px] font-sans leading-relaxed text-slate-500 pl-4 relative">
                                                  <span className="absolute left-1.5 top-2 w-1 h-1 rounded-full bg-slate-300" />
                                                  {highlightKeyword(item, searchedKeyword)}
                                                </li>
                                              ))}
                                            </ul>
                                          </div>
                                        )}
                                      </div>

                                      {/* Action button to jump */}
                                      <div className="border-t border-slate-100 pt-3 mt-2.5 flex justify-end">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setSelectedMeetingId(m.id);
                                            const el = document.getElementById("meeting-details-anchor");
                                            if (el) {
                                              el.scrollIntoView({ behavior: "smooth" });
                                            }
                                          }}
                                          className="text-[10px] font-mono font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition-colors"
                                        >
                                          Jump to Active Transcript <ArrowRight className="w-3 h-3" />
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Anchor for scroll navigation jumping */}
            <div id="meeting-details-anchor" className="scroll-mt-6" />

            {/* Split layout of Meetings directory & selected meeting info - styled with identical ProjectDetails design token */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch pt-2 text-left">
              
              {/* Left Column: Historical capsules directory */}
              <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between relative min-h-[460px] overflow-hidden shadow-xs">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xs font-mono font-bold text-slate-900 tracking-wider uppercase">
                      MEETING DIRECTORY CAPSULES ({meetings.length})
                    </h3>
                    <p className="text-[11px] text-slate-500 font-sans mt-0.5">Select a capsule to retrieve detailed MoM protocols and dialogue logs.</p>
                  </div>

                  <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                    {meetings.map((m, mIdx) => (
                      <motion.div
                        key={m.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: mIdx * 0.05 }}
                        whileHover={{ scale: 1.015, x: 2, transition: { duration: 0.12 } }}
                        whileTap={{ scale: 0.985 }}
                        onClick={() => setSelectedMeetingId(m.id)}
                        className={`cursor-pointer p-4 border rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all text-xs font-mono relative overflow-hidden group ${selectedMeetingId === m.id ? 'bg-blue-600 border-blue-500 text-white shadow-sm font-bold' : 'bg-slate-50 border-slate-200 text-slate-700'}`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className={`border text-[9px] px-1.5 py-0.2 rounded font-bold font-mono tracking-wide ${selectedMeetingId === m.id ? 'bg-white/20 border-white/30 text-white' : 'bg-blue-50 border-blue-150 text-blue-700'}`}>
                            {m.type}
                          </span>
                          <span className={`text-[9.5px] ${selectedMeetingId === m.id ? 'text-white/80' : 'text-slate-500'}`}>{m.date}</span>
                        </div>
                        <h4 className={`transition-colors line-clamp-1 text-sm font-sans font-bold leading-snug ${selectedMeetingId === m.id ? 'text-white' : 'text-slate-900 group-hover:text-blue-600'}`}>{m.title}</h4>
                        
                        <div className={`flex items-center gap-1.5 text-[10px] pt-1 truncate italic ${selectedMeetingId === m.id ? 'text-white/90' : 'text-slate-500'}`}>
                          <span>By {m.organizer}</span>
                          {m.originalLanguage && m.originalLanguage !== "English" && (
                            <span className={`px-1 rounded not-italic border text-[9px] ${selectedMeetingId === m.id ? 'bg-white/20 border-white/30 text-white' : 'bg-indigo-50 border-indigo-150 text-indigo-700 font-bold'}`}>
                              {m.originalLanguage.split(" ")[0]}
                            </span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="text-[10px] font-mono text-slate-550 bg-slate-50 border border-slate-200 p-3 rounded-lg text-left mt-4 shadow-3xs">
                  💡 <strong>Synapse Translation System:</strong> DMN automatically translates and indexes regional dialects (e.g. Malayalam) to English.
                </div>
              </div>

              {/* Right Column: Complete active meeting detail, MoM, conversational transcript */}
              <div className="lg:col-span-7">
                {activeMeeting ? (
                  <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between relative overflow-hidden min-h-[460px] shadow-xs">
                    <div className="space-y-4">
                      
                      {/* Active header block */}
                      <div className="border-b border-slate-150 pb-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-slate-100 border border-slate-250 text-slate-800 text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase">
                            Project: {activeMeeting.projectName}
                          </span>
                          <span className="text-slate-400 font-mono text-[10.5px]">• Organized by {activeMeeting.organizer}</span>
                        </div>
                        <h3 className="text-base font-sans font-bold text-slate-900 leading-snug">{activeMeeting.title}</h3>
                      </div>

                      {/* Detail vs Conversation switcher - Matching ProjectDetails styled layout switch */}
                      <div className="grid grid-cols-2 bg-slate-100 p-1 rounded-xl border border-slate-200 text-center relative z-10 overflow-hidden select-none">
                        <button
                          type="button"
                          onClick={() => setMeetingTab('mom')}
                          className={`cursor-pointer relative py-2 rounded-lg text-xs font-mono font-bold transition-all duration-300 ${meetingTab === 'mom' ? 'text-white' : 'text-slate-600 hover:text-slate-800'}`}
                        >
                          EXECUTIVE PROTOCOLS (MoM)
                          {meetingTab === 'mom' && (
                            <motion.div 
                              layoutId="activeSubTabHighlight" 
                              className="absolute inset-0 bg-blue-600 rounded-lg -z-10 shadow-3xs"
                              transition={{ type: "spring", stiffness: 420, damping: 30 }}
                            />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setMeetingTab('transcript')}
                          className={`cursor-pointer relative py-2 rounded-lg text-xs font-mono font-bold transition-all duration-300 ${meetingTab === 'transcript' ? 'text-white' : 'text-slate-600 hover:text-slate-800'}`}
                        >
                          RAW DIALOGUE TRANSCRIPT
                          {meetingTab === 'transcript' && (
                            <motion.div 
                              layoutId="activeSubTabHighlight" 
                              className="absolute inset-0 bg-blue-600 rounded-lg -z-10 shadow-3xs"
                              transition={{ type: "spring", stiffness: 420, damping: 30 }}
                            />
                          )}
                        </button>
                      </div>

                      {/* Swipe Panels display scroll zone */}
                      <div className="max-h-[300px] overflow-y-auto pr-1 space-y-4 pt-1 text-slate-700 text-xs text-left">
                        {meetingTab === 'mom' ? (
                          <div className="space-y-4">
                            {/* Summary block */}
                            {activeMeeting.summary && (
                              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 leading-relaxed">
                                <span className="text-[9.5px] font-mono text-blue-600 font-bold block uppercase mb-1.5">INTELLIGENT SUMMARY</span>
                                <p className="font-sans text-[11.5px] text-slate-700">{activeMeeting.summary}</p>
                              </div>
                            )}

                            {/* Bullet Takeaways */}
                            {activeMeeting.mainPoints && activeMeeting.mainPoints.length > 0 && (
                              <div className="space-y-2">
                                <span className="text-[9.5px] font-mono text-indigo-600 font-bold block uppercase">CONSTITUENT DISCUSSION POINTS</span>
                                <div className="space-y-1.5">
                                  {activeMeeting.mainPoints.map((pt, i) => (
                                    <div key={i} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-sans text-slate-650">
                                      <Sparkles className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                                      <span>{pt}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Actions List */}
                            {activeMeeting.actionItems && activeMeeting.actionItems.length > 0 && (
                              <div className="space-y-2">
                                <span className="text-[9.5px] font-mono text-emerald-700 font-bold block uppercase">MITIGATION ACTION ITEMS</span>
                                <div className="space-y-1.5">
                                  {activeMeeting.actionItems.map((act, i) => (
                                    <div key={i} className="flex items-start gap-2 bg-emerald-50 p-2.5 rounded-lg border border-emerald-250 font-mono text-[11px] text-emerald-800 font-medium shadow-3xs">
                                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                      <span>{act}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-3.5">
                            {/* raw dialogue bubble lines */}
                            {activeMeeting.transcript ? (
                              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 font-sans tracking-wide space-y-4 leading-relaxed">
                                <NeuroAudioWaveform />
                                <span className="text-[10px] text-indigo-600 uppercase font-bold border-b border-slate-200 pb-1 block">Indexed Audio stream conversation:</span>
                                <p className="whitespace-pre-wrap text-[11px] text-slate-700 leading-relaxed font-mono">{activeMeeting.transcript}</p>

                                {activeMeeting.transcriptEnglish && activeMeeting.originalLanguage && activeMeeting.originalLanguage !== "English" && (
                                  <div className="border-t border-slate-200 pt-3 mt-3">
                                    <span className="text-[10px] text-indigo-700 uppercase font-bold pb-1 block flex items-center gap-1">
                                      <Languages className="w-3.5 h-3.5" /> Translated English Output Segment:
                                    </span>
                                    <p className="whitespace-pre-wrap text-[11px] text-slate-700 bg-white p-2.5 rounded border border-slate-200 italic font-mono">{activeMeeting.transcriptEnglish}</p>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-center py-12 text-slate-400">
                                <Quote className="w-8 h-8 mx-auto text-slate-300 mb-2 animate-pulse" />
                                <p className="font-mono text-slate-550">Voice records or conversational audio tracks were not provided for this sync channel.</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Attendee stakeholders block footer */}
                    <div className="border-t border-slate-150 pt-4 mt-4 flex items-center justify-between gap-3 flex-wrap text-left">
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-600 font-mono uppercase">
                        <Users className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>ATTENDEES ({activeMeeting.participants?.length || 0}):</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {activeMeeting.participants && activeMeeting.participants.map((email, idx) => (
                          <span key={idx} className="text-[9.5px] font-mono text-slate-750 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-lg whitespace-nowrap shadow-3xs">
                            {email.includes('@') ? email.split('@')[0] : email}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-12 text-center text-slate-500 font-mono h-full flex items-center justify-center">
                    Select a meeting capsule to analyze details.
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

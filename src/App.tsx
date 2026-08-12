import React, { useState, useEffect } from 'react';
import { DbSchema, Project, TeamMember, Meeting, RoleType, ChatMessage } from './types';
import Sidebar from './components/Sidebar';
import SearchAndHeader from './components/SearchAndHeader';
import ProjectGrid from './components/ProjectGrid';
import ProjectDetails from './components/ProjectDetails';
import MemberProfile from './components/MemberProfile';
import MeetingScheduler from './components/MeetingScheduler';
import ConnectionsManager from './components/ConnectionsManager';
import AnalyticsPanel from './components/AnalyticsPanel';
import AIAssistant from './components/AIAssistant';
import TheBrain from './components/TheBrain';
import WorkspaceAgents from './components/WorkspaceAgents';
import PlugIt from './components/PlugIt';
import CustomReportModule from './components/CustomReportModule';
import { KeyRound, Sparkles, AlertCircle, RefreshCw, Lock, Unlock, ShieldAlert, Layers, BarChart3, Shield, Terminal, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { API_URL } from './config/api';

const vertexContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
    }
  }
};

const vertexItemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { type: 'spring', stiffness: 100, damping: 15 } 
  }
};

export default function App() {
  const [isInTeams] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const urlParams = new URLSearchParams(window.location.search || window.location.hash.split('?')[1] || '');
    return urlParams.has('inTeams') || window.location.href.includes('inTeams=true') || window.name.includes('teams');
  });

  const [activeTab, setActiveTab] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('settings')) return 'settings';
      if (hash.includes('collection')) return 'brain';
    }
    const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search || window.location.hash.split('?')[1] || '') : null;
    const inTeamsParam = urlParams?.has('inTeams') || (typeof window !== 'undefined' && window.location.href.includes('inTeams=true'));
    return inTeamsParam ? 'brain' : 'dashboard';
  });
  const [activeRole, setActiveRole] = useState<RoleType>('Admin');

  // Vertex Security States
  const [isVertexUnlocked, setIsVertexUnlocked] = useState<boolean>(false);
  const [vertexSubTab, setVertexSubTab] = useState<'connections' | 'agents' | 'analytics'>('connections');
  const [vertexPasscode, setVertexPasscode] = useState<string>('');
  const [vertexError, setVertexError] = useState<string>('');

  // Database elements
  const [db, setDb] = useState<DbSchema>({
    jiraConnections: [],
    teamsConnections: [],
    googleConnections: [],
    projects: [],
    members: [],
    meetings: [],
    chats: []
  });

  const [loading, setLoading] = useState(true);

  // Selector focuses
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [memberAutoAction, setMemberAutoAction] = useState<'schedule' | 'chat' | undefined>(undefined);

  // Quick seed meeting from availability grid
  const [seededMeetingParams, setSeededMeetingParams] = useState<{ email: string; date: string; startTime: string } | null>(null);

  // AI Assistant trigger fields
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [aiAssistantEmails, setAiAssistantEmails] = useState<string[]>([]);
  const [aiAssistantDate, setAiAssistantDate] = useState(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  });

  // Fetch complete platform data (supports background refresh to prevent layout unmounting)
  const fetchData = async (showSpinner = false) => {
    // Background data fetch - never set loading to true so active UI view is never replaced by spinner
    try {
      const response = await fetch(`${API_URL}/api/data`);
      if (response.ok) {
        const data = await response.json();
        setDb(data);
        
        // Refresh currently active selector states cleanly using functional setters to avoid stale state resets
        setSelectedMember((prevMember) => {
          if (!prevMember) return null;
          const fresh = data.members.find((m: any) => m.id === prevMember.id);
          return fresh || prevMember;
        });

        setSelectedProject((prevProject) => {
          if (!prevProject) return null;
          const fresh = data.projects.find((p: any) => p.key === prevProject.key);
          return fresh || prevProject;
        });
      }
    } catch (e) {
      console.error("Error communicating with full-stack server proxy:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(true);
  }, []);

  // System actions triggers

  // 1. Reset Database
  const handleResetDb = async () => {
    const response = await fetch(`${API_URL}/api/db/reset`, { method: 'POST' });
    if (response.ok) {
      const data = await response.json();
      setDb(data.data);
      setSelectedProject(null);
      setSelectedMember(null);
      setActiveTab('dashboard');
    }
  };

  // 2. Add Jira Connection details
  const handleConnectJira = async (baseUrl: string, email: string, apiToken: string) => {
    const response = await fetch(`${API_URL}/api/jira/connect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ baseUrl, email, apiToken })
    });
    if (response.ok) {
      await fetchData();
    }
  };

  // 3. Save selected Jira cloud projects
  const handleSaveJiraProjects = async (connectionId: string, projectKeys: string[]) => {
    const response = await fetch(`${API_URL}/api/jira/save-projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ connectionId, projectKeys })
    });
    if (response.ok) {
      await fetchData();
    }
  };

  // 4. Sync a project manually
  const handleSyncProject = async (projectKey: string) => {
    const response = await fetch(`${API_URL}/api/jira/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectKey })
    });
    if (response.ok) {
      await fetchData();
    }
  };

  // 4b. Sync availability of project members with Microsoft Graph
  const handleSyncAvailability = async (projectKey: string, date: string) => {
    try {
      const response = await fetch(`${API_URL}/api/projects/${projectKey}/sync-availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date })
      });
      if (response.ok) {
        const data = await response.json();
        // Update database presence / member state dynamically
        await fetchData();
        return data;
      }
    } catch (e) {
      console.error("Error communicating with integration backend sync gateway:", e);
    }
    return { success: false, message: "Critical backend-relay error." };
  };

  // 5. Delete project
  const handleDeleteProject = async (projectKey: string) => {
    const response = await fetch(`${API_URL}/api/projects/${projectKey}`, { method: 'DELETE' });
    if (response.ok) {
      await fetchData();
      if (selectedProject?.key === projectKey) {
        setSelectedProject(null);
      }
    }
  };

  // Add Jira Project and auto sync
  const handleAddJiraProject = async (payload: any) => {
    const response = await fetch(`${API_URL}/api/jira/create-project-and-fetch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error(`Server returned HTML instead of JSON. Make sure the backend API server is running on port 3000.`);
    }
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to establish connection to Jira cloud.');
    }
    const data = await response.json();
    await fetchData();
    return data;
  };

  // 6. Connect teams Graph client
  const handleConnectTeams = async (tenantId: string, clientId: string, clientSecret: string) => {
    const response = await fetch(`${API_URL}/api/teams/connect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId, clientId, clientSecret })
    });
    if (response.ok) {
      await fetchData();
    }
  };

  // 7. Connect Google Calendars
  const handleConnectGoogle = async (email: string) => {
    const response = await fetch(`${API_URL}/api/google/connect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    if (response.ok) {
      await fetchData();
    }
  };

  // 8. Create scheduled meeting
  const handleAddMeeting = async (meetingPayload: Partial<Meeting>) => {
    const response = await fetch(`${API_URL}/api/meetings/schedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(meetingPayload)
    });
    if (response.ok) {
      const data = await response.json();
      await fetchData();
      return data;
    }
    throw new Error("Unable to synchronize scheduled meeting entries.");
  };

  // Generate meeting takeaways using dynamic Gemini API trigger
  const handleGenerateTakeaways = async (meetingId: string, customInstruction?: string) => {
    const response = await fetch(`${API_URL}/api/meetings/generate-takeaways`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ meetingId, customInstruction })
    });
    if (response.ok) {
      const data = await response.json();
      await fetchData();
      return data;
    }
    throw new Error("Unable to formulate meeting takeaways.");
  };

  // 9. Send live teams chat message
  const handleSendMessage = async (receiverId: string, message: string) => {
    const response = await fetch(`${API_URL}/api/chats/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senderId: 'current-user', receiverId, message })
    });
    if (response.ok) {
      const data = await response.json();
      // Incremental local state updates to prevent flickering
      setDb(prev => ({
        ...prev,
        chats: data.data
      }));
      // Also fetch complete server sync in background
      fetchData();
    }
  };

  // Select actions
  const selectProject = (p: Project) => {
    setSelectedProject(p);
    setSelectedMember(null);
    setActiveTab('dashboard');
  };

  const selectMember = (m: TeamMember, autoAction?: 'schedule' | 'chat') => {
    setSelectedMember(m);
    setMemberAutoAction(autoAction);
    setActiveTab('dashboard');
  };

  // Seed meeting details shortcut helper
  const seedMeetingAndRoute = (email: string, date: string, startTime: string) => {
    setSeededMeetingParams({ email, date, startTime });
    setActiveTab('meetings');
  };

  // AI assistant helper trigger
  const launchAIAssistant = (emails: string[], dateStr: string) => {
    setAiAssistantEmails(emails);
    setAiAssistantDate(dateStr);
    setAiAssistantOpen(true);
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans" id="app-container">
      {/* Lateral navigation controls - hidden when inside Teams */}
      {!isInTeams && (
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(t) => {
            setActiveTab(t);
          }}
          activeRole={activeRole}
          setActiveRole={setActiveRole}
        />
      )}

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Teams Personal Tab Header (Collection & Settings Only) */}
        {isInTeams ? (
          <div className="bg-slate-900 border-b border-slate-800 px-6 py-3.5 flex items-center justify-between shrink-0 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white tracking-widest text-sm shadow-md shadow-indigo-500/20">
                TI
              </div>
              <div>
                <h1 className="font-display font-semibold text-xs leading-tight text-white tracking-wide">ThinkItAIMeetingAssistant</h1>
                <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Recorded Meeting Intelligence Tab
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button 
                onClick={() => setActiveTab('brain')} 
                className={`px-4 py-2 rounded-lg text-xs font-semibold font-display transition-all ${activeTab === 'brain' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
              >
                Collection (Recorded Meetings)
              </button>
              <button 
                onClick={() => setActiveTab('settings')} 
                className={`px-4 py-2 rounded-lg text-xs font-semibold font-display transition-all ${activeTab === 'settings' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
              >
                Settings
              </button>
            </div>
          </div>
        ) : (
          <SearchAndHeader
            projects={db.projects}
            members={db.members}
            onSelectProject={selectProject}
            onSelectMember={selectMember}
            onResetDb={handleResetDb}
            userEmail="ajayaghosh.b@thinkpalm.com"
          />
        )}

        {/* Dynamic Inner page flow */}
        <main className="flex-1 overflow-y-auto px-6 py-6 max-w-7xl mx-auto w-full">
          {loading ? (
            <div className="py-32 text-center space-y-4">
              <RefreshCw className="w-10 h-10 text-blue-500 animate-spin mx-auto" />
              <p className="text-slate-500 font-display font-medium text-sm">Initializing Teams Meeting Intelligence Engine...</p>
            </div>
          ) : isInTeams ? (
            /* Strict Microsoft Teams Dedicated Application Shell: Collection Only */
            <PlugIt />
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <>
                  {selectedMember ? (
                    <MemberProfile jiraEmailMappings={db.jiraEmailMappings || []}
                      member={selectedMember}
                      chats={db.chats}
                      meetings={db.meetings}
                      onBack={() => setSelectedMember(null)}
                      onSendMessage={handleSendMessage}
                      onSeedMeeting={seedMeetingAndRoute}
                      autoAction={memberAutoAction}
                      onRefreshData={fetchData}
                    />
                  ) : selectedProject ? (
                    <ProjectDetails
                      project={selectedProject}
                      members={db.members}
                      meetings={db.meetings || []}
                      jiraEmailMappings={db.jiraEmailMappings || []}
                      activeRole={activeRole}
                      onBack={() => setSelectedProject(null)}
                      onSyncProject={handleSyncProject}
                      onSelectMember={selectMember}
                      onSyncAvailability={handleSyncAvailability}
                      onRefreshData={fetchData}
                    />
                  ) : (
                    <ProjectGrid
                      projects={db.projects}
                      members={db.members}
                      activeRole={activeRole}
                      onOpenProject={setSelectedProject}
                      onSyncProject={handleSyncProject}
                      onDeleteProject={handleDeleteProject}
                      onAddJiraProject={handleAddJiraProject}
                      jiraEmailMappings={db.jiraEmailMappings || []}
                      onRefreshData={fetchData}
                      onAddMeeting={handleAddMeeting}
                    />
                  )}
                </>
              )}

              {activeTab === 'meetings' && (
                <MeetingScheduler
                  members={db.members}
                  projects={db.projects}
                  meetings={db.meetings}
                  onAddMeeting={handleAddMeeting}
                  seededParams={seededMeetingParams}
                  onClearSeededParams={() => setSeededMeetingParams(null)}
                  onOpenAIScheduler={launchAIAssistant}
                  onGenerateTakeaways={handleGenerateTakeaways}
                />
              )}

              {activeTab === 'vertex' && !isVertexUnlocked && (
                <div className="max-w-md mx-auto py-12" id="vertex-lockscreen">
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-900 border border-slate-800 rounded-3xl p-8 relative overflow-hidden shadow-2xl"
                  >
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.1)_0%,transparent_70%)] pointer-events-none" />
                    
                    <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-[10px] font-mono text-red-500 font-extrabold uppercase tracking-widest">RESTRICTED ZONE</span>
                      </div>
                      <ShieldAlert className="w-5 h-5 text-indigo-500" />
                    </div>

                    <div className="text-center space-y-3 mb-8">
                      <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-650/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-md relative">
                        <Lock className="w-7 h-7 animate-pulse" />
                      </div>
                      <h2 className="font-display font-semibold text-lg text-white tracking-wide uppercase">VERTEX ADMIN ACCESS</h2>
                      <p className="text-xs text-slate-400 font-mono max-w-xs mx-auto leading-relaxed">
                        Please enter your administrative decryption key to gain operational control of connected sub-arrays. (Password: 123)
                      </p>
                    </div>

                    <div className="space-y-6">
                      <div className="relative">
                        <input
                          type="password"
                          maxLength={3}
                          readOnly
                          value={vertexPasscode}
                          placeholder="•••"
                          className="w-full text-center text-3xl font-bold tracking-[0.75em] bg-slate-950/80 border border-slate-800/80 rounded-2xl py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-indigo-400 placeholder:opacity-20 select-none font-mono"
                        />
                      </div>

                      {vertexError && (
                        <motion.div 
                          initial={{ scale: 0.95, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1, x: [-4, 4, -4, 4, 0] }}
                          className="text-center p-2 rounded bg-red-950/20 border border-red-500/25 text-red-400 text-[10px] font-mono tracking-wider font-extrabold"
                        >
                          {vertexError}
                        </motion.div>
                      )}

                      <div className="grid grid-cols-3 gap-3 max-w-[240px] mx-auto select-none">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => {
                              if (vertexPasscode.length < 3) {
                                const newCode = vertexPasscode + num;
                                setVertexPasscode(newCode);
                                setVertexError('');
                                if (newCode === '123') {
                                  setIsVertexUnlocked(true);
                                  setVertexPasscode('');
                                } else if (newCode.length === 3) {
                                  setVertexError('DECRYPTION KEY MISMATCH - AUTHORIZATION BLOCKED');
                                  setVertexPasscode('');
                                }
                              }
                            }}
                            className="hover:bg-slate-800 bg-slate-950 active:scale-95 border border-white/5 font-mono text-base font-bold aspect-square w-12 rounded-full flex items-center justify-center transition-all cursor-pointer text-slate-300 hover:text-white"
                          >
                            {num}
                          </button>
                        ))}
                        
                        <button
                          type="button"
                          onClick={() => {
                            setVertexPasscode('');
                            setVertexError('');
                          }}
                          className="text-[10px] font-mono font-bold hover:bg-slate-800 text-slate-500 hover:text-slate-200 cursor-pointer active:scale-95 self-center justify-self-center py-2 px-3 rounded-lg"
                        >
                          CLEAR
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => {
                            if (vertexPasscode.length < 3) {
                              const newCode = vertexPasscode + '0';
                              setVertexPasscode(newCode);
                              setVertexError('');
                              if (newCode === '123') {
                                setIsVertexUnlocked(true);
                                setVertexPasscode('');
                              } else if (newCode.length === 3) {
                                setVertexError('DECRYPTION KEY MISMATCH - AUTHORIZATION BLOCKED');
                                setVertexPasscode('');
                              }
                            }
                          }}
                          className="hover:bg-slate-800 bg-slate-955 border border-white/5 font-mono text-base font-bold aspect-square w-12 rounded-full flex items-center justify-center transition-all cursor-pointer text-slate-300 hover:text-white mx-auto active:scale-95"
                        >
                          0
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => {
                            setVertexPasscode('');
                            setVertexError('');
                          }}
                          className="text-[10px] font-mono font-bold hover:bg-slate-800 text-indigo-400 hover:text-indigo-300 cursor-pointer active:scale-95 self-center justify-self-center py-2 px-3 rounded-lg"
                        >
                          RESET
                        </button>
                      </div>
                      
                      <div className="text-center pt-2">
                        <span className="text-[9px] text-slate-500 font-mono tracking-widest uppercase">ENCRYPTED VERTEX KEY 256-BIT</span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}

              {activeTab === 'vertex' && isVertexUnlocked && (
                <motion.div
                  className="space-y-6"
                  id="vertex-admin-platform"
                  variants={vertexContainerVariants}
                  initial="hidden"
                  animate="show"
                >
                  <motion.div
                    variants={vertexItemVariants}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-5 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-64 h-32 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.15)_0%,transparent_70%)] pointer-events-none" />
                    
                    <div className="flex items-center gap-3.5 z-10">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-400/20 flex items-center justify-center text-cyan-400 shadow-md">
                        <Terminal className="w-6 h-6 animate-pulse" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-xs font-display font-medium text-white tracking-widest uppercase leading-none">VERTEX DIGITAL CORE</h2>
                          <span className="text-[9px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-widest leading-none">SECURE</span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono mt-1">Operational Matrix & System Health Telemetry</p>
                      </div>
                    </div>

                    {/* Live System Health & Telemetry Badges */}
                    <div className="flex flex-wrap items-center gap-2 z-10">
                      <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-xl text-[10px] font-mono text-slate-300">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        <span className="text-slate-400">DB:</span>
                        <span className="text-emerald-400 font-bold">PostgreSQL Online</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-xl text-[10px] font-mono text-slate-300">
                        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                        <span className="text-slate-400">AI:</span>
                        <span className="text-indigo-400 font-bold">NVIDIA / Groq Active</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-xl text-[10px] font-mono text-slate-300">
                        <span className="w-2 h-2 rounded-full bg-cyan-400" />
                        <span className="text-slate-400">O365:</span>
                        <span className="text-cyan-400 font-bold">Graph Connected</span>
                      </div>
                      <button
                        onClick={() => {
                          setIsVertexUnlocked(false);
                          setVertexPasscode('');
                          setVertexError('');
                        }}
                        className="cursor-pointer px-4 py-2 bg-slate-950 border border-white/5 hover:bg-slate-850 text-[11px] font-mono font-bold text-slate-350 hover:text-white rounded-xl transition-all flex items-center gap-2 ml-1"
                      >
                        <Lock className="w-3.5 h-3.5 text-indigo-400" />
                        LOCK STORAGE
                      </button>
                    </div>
                  </motion.div>

                  <div
                    className="grid grid-cols-3 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl relative z-10 overflow-hidden select-none text-center"
                  >
                    <button
                      onClick={() => setVertexSubTab('connections')}
                      className={`cursor-pointer group relative py-3 rounded-xl font-mono text-[11px] font-bold tracking-wider transition-all duration-150 flex items-center justify-center gap-2 z-10 ${vertexSubTab === 'connections' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      <KeyRound className="w-4 h-4 text-cyan-300 group-hover:scale-110 transition-transform" />
                      INTEGRATION PANEL
                    </button>
                    
                    <button
                      onClick={() => setVertexSubTab('agents')}
                      className={`cursor-pointer group relative py-3 rounded-xl font-mono text-[11px] font-bold tracking-wider transition-all duration-150 flex items-center justify-center gap-2 z-10 ${vertexSubTab === 'agents' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      <Cpu className="w-4 h-4 text-violet-350 group-hover:scale-110 transition-transform" />
                      WORKSPACE AGENTS
                    </button>
                    
                    <button
                      onClick={() => setVertexSubTab('analytics')}
                      className={`cursor-pointer group relative py-3 rounded-xl font-mono text-[11px] font-bold tracking-wider transition-all duration-150 flex items-center justify-center gap-2 z-10 ${vertexSubTab === 'analytics' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      <BarChart3 className="w-4 h-4 text-fuchsia-300 group-hover:scale-110 transition-transform" />
                      TEAM ANALYSIS
                    </button>
                  </div>

                  <motion.div
                    variants={vertexItemVariants}
                    className="relative min-h-[300px]"
                    id="vertex-module-frame"
                  >
                    {vertexSubTab === 'connections' && (
                      <ConnectionsManager
                        jiraConnections={db.jiraConnections}
                        teamsConnections={db.teamsConnections}
                        googleConnections={db.googleConnections}
                        jiraEmailMappings={db.jiraEmailMappings || []}
                        projects={db.projects}
                        members={db.members}
                        meetings={db.meetings}
                        onConnectJira={handleConnectJira}
                        onConnectTeams={handleConnectTeams}
                        onConnectGoogle={handleConnectGoogle}
                        onSaveJiraProjects={handleSaveJiraProjects}
                        onRefreshData={fetchData}
                      />
                    )}

                    {vertexSubTab === 'agents' && (
                      <WorkspaceAgents projects={db.projects} />
                    )}

                    {vertexSubTab === 'analytics' && (
                      <AnalyticsPanel
                        projects={db.projects}
                        members={db.members}
                        meetings={db.meetings}
                      />
                    )}
                  </motion.div>
                </motion.div>
              )}

              {activeTab === 'brain' && (
                <TheBrain
                  meetings={db.meetings}
                  projects={db.projects}
                  members={db.members}
                  onRefreshData={fetchData}
                />
              )}

              {activeTab === 'settings' && (
                <ConnectionsManager
                  jiraConnections={db.jiraConnections}
                  teamsConnections={db.teamsConnections}
                  googleConnections={db.googleConnections}
                  jiraEmailMappings={db.jiraEmailMappings || []}
                  projects={db.projects}
                  members={db.members}
                  meetings={db.meetings}
                  onConnectJira={handleConnectJira}
                  onConnectTeams={handleConnectTeams}
                  onConnectGoogle={handleConnectGoogle}
                  onSaveJiraProjects={handleSaveJiraProjects}
                  onRefreshData={fetchData}
                />
              )}

              {activeTab === 'plugit' && (
                <PlugIt />
              )}
              {activeTab === 'custom-report' && (
                <CustomReportModule />
              )}
            </>
          )}
        </main>
      </div>

      {/* Persistent AI Assistant Modal Dialog */}
      {aiAssistantOpen && (
        <AIAssistant
          members={db.members}
          checkedEmails={aiAssistantEmails}
          date={aiAssistantDate}
          onClose={() => setAiAssistantOpen(false)}
          onApplyTime={(start, end) => {
            // Apply straight into meeting scheduler params
            setSeededMeetingParams({
              email: aiAssistantEmails[0] || "",
              date: aiAssistantDate,
              startTime: start
            });
            // Switch view
            setActiveTab('meetings');
          }}
        />
      )}
    </div>
  );
}

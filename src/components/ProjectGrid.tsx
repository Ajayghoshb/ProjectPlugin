import React, { useState } from 'react';
import { BookOpen, Bug, ClipboardList, RefreshCw, FolderPlus, Trash2, ArrowRight, ArrowLeft, KeyRound, Check, Users, Clock, CheckCircle, AlertCircle, Mail } from 'lucide-react';
import { Project, RoleType, TeamMember } from '../types';
import { API_URL } from '../config/api';

interface ProjectGridProps {
  projects: Project[];
  members: TeamMember[];
  activeRole: RoleType;
  onOpenProject: (p: Project) => void;
  onSyncProject: (projectKey: string) => void;
  onDeleteProject: (projectKey: string) => void;
  onAddJiraProject: (payload: any) => Promise<any>;
  jiraEmailMappings?: any[];
  onRefreshData?: () => Promise<void>;
  onAddMeeting?: (payload: any) => Promise<any>;
}

interface WeOwnItWorkspaceProps {
  key?: string;
  jiraEmailMappings: any[];
  activeRole: RoleType;
  onOpenProject: (p: Project) => void;
}

function WeOwnItWorkspace({
  jiraEmailMappings = [],
  activeRole,
  onOpenProject
}: WeOwnItWorkspaceProps) {
  const woiProject: Project = {
    id: "we-own-it-cockpit-id",
    key: "WOI",
    name: "We Own It Operations",
    description: "Direct connection to Outlook & MS Exchange calendar gateways, corporate directory synchronization tunnels, and identities translation map.",
    lead: "Azure AD Hub",
    userStoriesCount: jiraEmailMappings.length,
    bugsCount: 0,
    teamMembers: []
  };

  return (
    <div className="bg-white border border-slate-200 hover:border-slate-350 rounded-xl p-5 shadow-xs flex flex-col h-full min-h-[300px] text-slate-800 overflow-hidden font-sans col-span-1 relative group transition-all duration-300">
      <div className="flex items-start justify-between gap-4 z-10">
        <div>
          <span className="inline-block bg-blue-600 border border-blue-500 text-white font-mono text-[9px] font-bold px-2.5 py-0.5 rounded mb-2 shadow-2xs uppercase tracking-wider">
            WOI
          </span>
          <h3 className="font-display font-medium text-base text-slate-800 group-hover:text-blue-600 transition-colors">
            "We Own It" Operations
          </h3>
          <p className="text-slate-500 text-[10px] font-mono mt-0.5">Lead: Azure AD Hub</p>
        </div>
      </div>
      <p className="text-slate-650 text-slate-650 text-xs mt-3 flex-1 leading-relaxed line-clamp-2">
        Direct connection to Outlook & MS Exchange calendar gateways, corporate directory synchronization tunnels, and identities translation map.
      </p>
      <div className="grid grid-cols-3 gap-2 mt-4 bg-slate-50 rounded-lg p-2 text-center border border-slate-150 z-10">
        <div>
          <span className="text-[8px] uppercase font-mono tracking-wider font-bold text-slate-500 block">Mappings</span>
          <span className="text-xs font-semibold text-slate-800 font-mono mt-0.5 block">{jiraEmailMappings.length}</span>
        </div>
        <div>
          <span className="text-[8px] uppercase font-mono tracking-wider font-bold text-slate-500 block">Status</span>
          <span className="text-xs font-semibold text-emerald-600 font-mono mt-0.5 block">Online</span>
        </div>
        <div>
          <span className="text-[8px] uppercase font-mono tracking-wider font-bold text-slate-500 block">Gateway</span>
          <span className="text-xs font-semibold text-slate-800 font-mono mt-0.5 block">Graph</span>
        </div>
      </div>
      <div className="flex items-center border-t border-slate-100 pt-4 mt-4 z-10">
        <button
          onClick={() => onOpenProject(woiProject)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-3 rounded-lg cursor-pointer transition-colors"
          id="project-card-phn"
        >
          <span>Open Details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export default function ProjectGrid({
  projects,
  members,
  activeRole,
  onOpenProject,
  onSyncProject,
  onDeleteProject,
  onAddJiraProject,
  jiraEmailMappings = [],
  onRefreshData = async () => {},
  onAddMeeting = async () => ({})
}: ProjectGridProps) {
  const [syncingKey, setSyncingKey] = useState<string | null>(null);
  const [syncProgress, setSyncProgress] = useState<Record<string, number>>({});
  
  // Dashboard Wizard State
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1); // 1 = connect & list, 2 = select & import
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wizardSuccessData, setWizardSuccessData] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Wizard fields
  const [wizardProjName, setWizardProjName] = useState("");
  const [wizardManagerName, setWizardManagerName] = useState("Sarah Connor");
  const [wizardBaseUrl, setWizardBaseUrl] = useState("jira.company.atlassian.net");
  const [wizardEmail, setWizardEmail] = useState("ajayaghosh.b@thinkpalm.com");
  const [wizardApiToken, setWizardApiToken] = useState("••••••••••••••••••••••••");

  // Discovered projects
  const [discoveredProjects, setDiscoveredProjects] = useState<any[]>([]);
  const [selectedProjectKey, setSelectedProjectKey] = useState<string>("");

  const handleSync = async (key: string) => {
    setSyncingKey(key);
    setSyncProgress(prev => ({ ...prev, [key]: 0 }));
    
    const interval = setInterval(() => {
      setSyncProgress(prev => {
        const current = prev[key] ?? 0;
        if (current >= 95) {
          clearInterval(interval);
          return prev;
        }
        const increment = current < 40 ? 15 : current < 75 ? 8 : current < 90 ? 3 : 1;
        return { ...prev, [key]: Math.min(95, current + increment) };
      });
    }, 120);

    try {
      await onSyncProject(key);
    } catch (e) {
      console.error(e);
    } finally {
      clearInterval(interval);
      setSyncProgress(prev => ({ ...prev, [key]: 100 }));
      
      setTimeout(() => {
        setSyncingKey(null);
        setSyncProgress(prev => {
          const updated = { ...prev };
          delete updated[key];
          return updated;
        });
      }, 750);
    }
  };

  const handleDiscoverProjectsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wizardBaseUrl || !wizardEmail || !wizardApiToken) {
      setErrorMsg("Please fill out all credentials fields to search Jira database.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const response = await fetch(`${API_URL}/api/jira/list-projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baseUrl: wizardBaseUrl,
          email: wizardEmail,
          apiToken: wizardApiToken
        })
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Server returned HTML instead of JSON. Make sure the backend server (Node.js) is running on port 3000.`);
      }

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to authenticate and retrieve Projects list from Jira host.');
      }

      const data = await response.json();
      setDiscoveredProjects(data.projects || []);
      if (data.projects && data.projects.length > 0) {
        setSelectedProjectKey(data.projects[0].key);
        setWizardProjName(data.projects[0].name);
      }
      setWizardStep(2);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Verification failed. Please double-check your connection tokens.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateProjectWizardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectKey) {
      setErrorMsg("Please select an active project to continue.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const chosenProj = discoveredProjects.find(p => p.key === selectedProjectKey);
      const payload = {
        projectKey: selectedProjectKey,
        projectName: wizardProjName || (chosenProj ? chosenProj.name : selectedProjectKey),
        managerName: wizardManagerName,
        baseUrl: wizardBaseUrl,
        email: wizardEmail,
        apiToken: wizardApiToken
      };

      const result = await onAddJiraProject(payload);
      setWizardSuccessData(result);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to link selected project with live workspace.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetWizardState = () => {
    setShowWizard(false);
    setWizardSuccessData(null);
    setWizardProjName("");
    setWizardStep(1);
    setDiscoveredProjects([]);
    setSelectedProjectKey("");
    setErrorMsg(null);
  };

  if (showWizard) {
    return (
      <div className="space-y-6 animate-fadeIn font-sans">
        <div className="flex items-center gap-3">
          <button
            onClick={resetWizardState}
            className="p-2 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h2 className="text-xl font-display font-bold text-slate-800">Configure & Import Jira Repository</h2>
            <p className="text-slate-500 text-xs font-sans">Establish high-fidelity API connections to pull live project information and developer directory profiles.</p>
          </div>
        </div>

        {wizardSuccessData ? (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6 max-w-2xl mx-auto">
            <div className="text-center space-y-2 font-sans">
              <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center rounded-full mx-auto">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-display font-bold text-slate-800">Workspace Connected Successfully</h3>
              <p className="text-slate-505 text-slate-500 text-xs leading-relaxed">{wizardSuccessData.message}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 border-y border-slate-150 py-4 text-center font-sans">
              <div>
                <span className="text-[10px] font-mono tracking-wider uppercase text-slate-400 block">Jira Project key code</span>
                <span className="text-lg font-bold text-slate-700 font-mono">
                  {wizardSuccessData.projectKey || selectedProjectKey || "PRJ"}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono tracking-wider uppercase text-slate-400 block">Synced Team Profiles</span>
                <span className="text-lg font-bold text-slate-750 font-mono">
                  {(wizardSuccessData.activeUsers && wizardSuccessData.activeUsers.length) || 1} Accounts
                </span>
              </div>
            </div>

            <div className="space-y-2.5 font-sans">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block flex items-center gap-1">
                <Users className="w-3.5 h-3.5" /> Discovered team resources under {wizardBaseUrl}
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-40 overflow-y-auto">
                {wizardSuccessData.activeUsers && wizardSuccessData.activeUsers.length > 0 ? (
                  wizardSuccessData.activeUsers.map((u: any, idx: number) => (
                    <div key={u.id || idx} className="bg-slate-50 border border-slate-150 p-2.5 rounded-lg flex items-center gap-2.5">
                      <img 
                        src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=random`} 
                        alt={u.name} 
                        className="w-6 h-6 rounded-full object-cover shrink-0" 
                        referrerPolicy="no-referrer" 
                      />
                      <div className="overflow-hidden min-w-0 flex-1">
                        <span className="text-[11px] font-bold text-slate-805 text-slate-800 block leading-tight truncate">{u.name}</span>
                        <span className="text-[9.5px] font-mono text-slate-400 block leading-normal break-all">{u.email}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-slate-50 border border-slate-150 p-3 rounded-lg text-center col-span-2 text-xs text-slate-500">
                    No active developer items returned from the API yet.
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={resetWizardState}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 rounded-lg cursor-pointer text-center block transition-colors"
            >
              Return to Active Dashboard Grid
            </button>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs max-w-xl mx-auto space-y-4 font-sans">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-550 text-blue-600 font-bold block flex items-center gap-1">
                <KeyRound className="w-3.5 h-3.5" /> 
                {wizardStep === 1 ? "Step 1: Configure Credentials" : "Step 2: Select & Link Project"}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-500 font-bold">
                Step {wizardStep} of 2
              </span>
            </div>

            {wizardStep === 1 ? (
              <form onSubmit={handleDiscoverProjectsSubmit} className="space-y-4 text-xs font-sans">
                <div className="space-y-3">
                  <p className="text-slate-500 text-xs">Enter your Jira Cloud details to discover all registered projects under that instance.</p>
                  
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Jira Instance Host URL</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. company-jira.atlassian.net"
                      value={wizardBaseUrl}
                      onChange={(e) => setWizardBaseUrl(e.target.value)}
                      className="w-full border border-slate-250 px-3.5 py-2.5 bg-slate-50 rounded-lg text-xs focus:bg-white text-slate-805 text-slate-800 focus:outline-none font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Authorized Email Identity</label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. manager@atlassian.com"
                        value={wizardEmail}
                        onChange={(e) => setWizardEmail(e.target.value)}
                        className="w-full border border-slate-250 px-3.5 py-2.5 bg-slate-50 rounded-lg text-xs focus:bg-white text-slate-805 text-slate-800 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-705 text-slate-700 block">Jira Cloud API Token</label>
                      <input
                        type="password"
                        required
                        placeholder="API Access Token key..."
                        value={wizardApiToken}
                        onChange={(e) => setWizardApiToken(e.target.value)}
                        className="w-full border border-slate-250 px-3.5 py-2.5 bg-slate-50 rounded-lg text-xs focus:bg-white text-slate-805 text-slate-800 focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-3 bg-red-50 border border-red-150 text-red-700 text-xs rounded-lg flex items-center gap-1.5 leading-snug">
                    <span>{errorMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase tracking-wider py-3 px-4 rounded-xl shadow-md cursor-pointer transition-colors text-center disabled:bg-slate-100 disabled:text-slate-400 block border-none"
                >
                  {isSubmitting ? "Connecting to Atlassian Cloud..." : "Connect & Fetch Projects List"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleCreateProjectWizardSubmit} className="space-y-4 text-xs font-sans">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 block">Select a Project ({discoveredProjects.length} found)</label>
                    <button 
                      type="button"
                      onClick={() => setWizardStep(1)}
                      className="text-blue-600 hover:underline text-[11px] font-medium transition-colors"
                    >
                      Change Host Credentials
                    </button>
                  </div>

                  <p className="text-slate-500 text-xs">Jira found the following projects. Select exactly one project to import into your workspace.</p>

                  <div className="space-y-2 max-h-48 overflow-y-auto border border-slate-150 rounded-lg p-2 bg-slate-50/50">
                    {discoveredProjects.map((proj) => {
                      const isSelected = selectedProjectKey === proj.key;
                      return (
                        <div 
                          key={proj.key}
                          onClick={() => {
                            setSelectedProjectKey(proj.key);
                            setWizardProjName(proj.name);
                          }}
                          className={`p-3 rounded-lg border transition-all cursor-pointer flex items-start gap-3 text-left ${isSelected ? 'bg-blue-50/55 border-blue-400 ring-1 ring-blue-400' : 'bg-white border-slate-200 hover:border-slate-350'}`}
                        >
                          <input 
                            type="radio" 
                            name="selectedProject" 
                            checked={isSelected}
                            onChange={() => {
                              setSelectedProjectKey(proj.key);
                              setWizardProjName(proj.name);
                            }}
                            className="mt-0.5" 
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center gap-2">
                              <span className="font-bold text-slate-800 truncate text-[12px]">{proj.name}</span>
                              <span className="bg-slate-105 bg-slate-100 border border-slate-200 text-slate-700 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded leading-none shrink-0">{proj.key}</span>
                            </div>
                            <p className="text-slate-500 text-[10.5px] mt-0.5 line-clamp-1 leading-snug">{proj.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-150">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Display Name in System</label>
                      <input
                        type="text"
                        required
                        placeholder="Custom project name"
                        value={wizardProjName}
                        onChange={(e) => setWizardProjName(e.target.value)}
                        className="w-full border border-slate-250 px-3 py-2 bg-white rounded-lg text-xs text-slate-805 text-slate-800 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Project Lead / Manager</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Sarah Connor"
                        value={wizardManagerName}
                        onChange={(e) => setWizardManagerName(e.target.value)}
                        className="w-full border border-slate-250 px-3 py-2 bg-white rounded-lg text-xs text-slate-805 text-slate-800 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-3 bg-red-50 border border-red-150 text-red-700 text-xs rounded-lg flex items-center gap-1.5 leading-snug">
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setWizardStep(1)}
                    className="flex-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs py-3 rounded-xl cursor-pointer text-center transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase tracking-wider py-3 px-4 rounded-xl shadow-md cursor-pointer transition-colors text-center disabled:bg-slate-100 disabled:text-slate-400 border-none"
                  >
                    {isSubmitting ? "Linking selected items..." : "Import selected project"}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-medium text-slate-800 tracking-tight">Project Hub</h2>
        </div>

        {activeRole === 'Admin' && (
          <button
            onClick={() => setShowWizard(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2.5 px-4 rounded-xl shadow-md shadow-blue-500/10 cursor-pointer transition-all border-none"
            id="btn-add-project"
          >
            <FolderPlus className="w-4 h-4" />
            <span>Connect New Project</span>
          </button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center max-w-xl mx-auto">
          <ClipboardList className="w-12 h-12 text-slate-350 mx-auto mb-3" />
          <h3 className="font-display font-semibold text-slate-700 text-md">No Connected Projects</h3>
          <p className="text-slate-500 text-xs mt-1 leading-snug">Configure your integrations or use the Admin panel to connect active Jira instances.</p>
          {activeRole === 'Admin' && (
            <button
              onClick={() => setShowWizard(true)}
              className="mt-4 inline-flex items-center gap-1.5 bg-blue-600 text-white text-xs font-medium py-2 px-4 rounded-md hover:bg-blue-700 cursor-pointer transition-colors border-none"
            >
              Connect Now
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 font-sans">
          {projects.map((proj, idx) => {
            const projectMembers = members.filter(m => m.projects.includes(proj.key));
            const memberCount = projectMembers.length;

            if (idx === 0) {
              return (
                <WeOwnItWorkspace
                  key="we-own-it-cockpit"
                  jiraEmailMappings={jiraEmailMappings}
                  activeRole={activeRole}
                  onOpenProject={onOpenProject}
                />
              );
            }

            return (
              <div
                key={proj.id}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-5 shadow-xs transition-all relative flex flex-col group"
                id={`project-card-${proj.key.toLowerCase()}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="inline-block bg-blue-600 border border-blue-500 text-white font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-md mb-2 shadow-2xs uppercase tracking-wider">
                      {proj.key}
                    </span>
                    <h3 className="font-display font-bold text-base text-slate-808 text-slate-800 line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {proj.name}
                    </h3>
                    <p className="text-slate-500 text-[10.5px] font-mono mt-0.5">Lead: {proj.lead}</p>
                  </div>

                  <div className="flex items-center gap-1.5 animate-fadeIn">
                    {activeRole === 'Admin' && (
                      <button
                        onClick={() => onDeleteProject(proj.key)}
                        className="text-slate-400 hover:text-rose-650 hover:text-rose-600 p-1 rounded-md hover:bg-slate-50 transition-colors cursor-pointer border-none"
                        title="Remove Project from Platform"
                        id={`btn-delete-${proj.key}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-slate-500 text-xs mt-3 flex-1 line-clamp-2 leading-relaxed font-sans">
                  {proj.description}
                </p>

                {syncingKey === proj.key && (
                  <div className="mt-3.5 space-y-1.5 animate-fadeIn bg-slate-50/50 border border-slate-100 p-2.5 rounded-lg">
                    <div className="flex justify-between items-center text-[10px] font-mono text-blue-600 font-bold">
                      <span className="flex items-center gap-1.5">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-500" />
                        {syncProgress[proj.key] === 100 ? "Sync Completed!" : "Live Jira API Synching..."}
                      </span>
                      <span>{syncProgress[proj.key] || 0}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${syncProgress[proj.key] || 0}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-2.5 mt-5 bg-slate-50 rounded-lg p-2.5 text-center border border-slate-100">
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400 block">Stories</span>
                    <span className="text-sm font-semibold text-slate-800 font-mono mt-0.5 block">{proj.userStoriesCount}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400 block">Bugs</span>
                    <span className="text-sm font-semibold text-rose-600 font-mono mt-0.5 block">{proj.bugsCount}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400 block">Team</span>
                    <span className="text-sm font-semibold text-slate-800 font-mono mt-0.5 block">{memberCount}</span>
                  </div>
                </div>

                {projectMembers.length > 0 && (
                  <div className="flex items-center gap-1 mt-4">
                    <span className="text-[10px] font-mono text-slate-400 mr-1.5">Active resource:</span>
                    <div className="flex -space-x-1.5 overflow-hidden">
                      {projectMembers.map((m) => (
                        <img
                          key={m.id}
                          className="inline-block h-5.5 w-5.5 rounded-full ring-2 ring-white object-cover"
                          src={m.avatar}
                          alt={m.name}
                          title={`${m.name} (${m.role})`}
                          referrerPolicy="no-referrer"
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2.5 border-t border-slate-150 pt-4 mt-5">
                  <button
                    onClick={() => onOpenProject(proj)}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-xs py-2.5 px-5 rounded-xl cursor-pointer transition-all shadow-sm shadow-blue-500/20"
                  >
                    <span>Open Details</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  {activeRole !== 'Member' && (
                    <button
                      onClick={() => handleSync(proj.key)}
                      disabled={syncingKey === proj.key}
                      className="w-10 h-10 inline-flex items-center justify-center bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold rounded-xl cursor-pointer disabled:bg-slate-100 disabled:text-slate-400 transition-all shrink-0 shadow-xs active:scale-95"
                      title="Sync Project with Server Jira Endpoint"
                      id={`btn-sync-${proj.key.toLowerCase()}`}
                    >
                      <RefreshCw className={`w-4 h-4 text-slate-950 font-bold ${syncingKey === proj.key ? 'animate-spin' : ''}`} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Layers, Bug, Users, Calendar, MessageSquare, Sparkles } from 'lucide-react';
import { Project, TeamMember, RoleType, Meeting, JiraEmailMapping } from '../types';

interface ProjectDetailsProps {
  project: Project;
  members: TeamMember[];
  meetings: Meeting[];
  jiraEmailMappings: JiraEmailMapping[];
  activeRole: RoleType;
  onBack: () => void;
  onSyncProject: (key: string) => void;
  onSelectMember: (m: TeamMember, autoAction?: 'schedule' | 'chat') => void;
  onSyncAvailability?: (key: string, date: string) => Promise<any>;
  onRefreshData?: () => void;
}

export default function ProjectDetails({
  project,
  members,
  meetings = [],
  jiraEmailMappings = [],
  activeRole,
  onBack,
  onSyncProject,
  onSelectMember,
  onSyncAvailability,
  onRefreshData
}: ProjectDetailsProps) {
  const [syncing, setSyncing] = useState(false);
  const [syncingPresence, setSyncingPresence] = useState(false);

  const isMockEmail = (email: string): boolean => {
    if (!email) return true;
    const lower = email.toLowerCase().trim();
    return (
      lower.endsWith("@project.io") ||
      lower.endsWith(".local") ||
      lower.includes("atlassian.net") ||
      lower === "user@gmail.com" ||
      lower.includes("simulated") ||
      lower.includes("mock")
    );
  };

  // Filter team members tied to this project key
  const projectMembers = project.key === "WOI"
    ? members
    : members.filter(m => m.projects.includes(project.key));

  const getTodayDateString = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const handleSyncTeamsPresence = async () => {
    if (!onSyncAvailability) return;
    setSyncingPresence(true);
    try {
      await onSyncAvailability(project.key, getTodayDateString());
    } catch (err) {
      console.error("Failed to sync Teams presence", err);
    } finally {
      setSyncingPresence(false);
    }
  };

  // Manual sync button trigger available via handleSyncTeamsPresence

  const handleSyncClick = async () => {
    setSyncing(true);
    await onSyncProject(project.key);
    setTimeout(() => setSyncing(false), 800);
  };

  const getMemberStatusInfo = (m: TeamMember) => {
    const isInvalid = isMockEmail(m.email);
    if (isInvalid) {
      return {
        label: "Recheck",
        pipClass: "bg-amber-450 bg-amber-500 animate-pulse",
        badgeClass: "text-amber-950 bg-amber-50/85 border border-amber-300 font-extrabold"
      };
    }

    // Valid user presence status mapping
    switch (m.presence) {
      case 'Available':
        return {
          label: "ONLINE",
          pipClass: "bg-emerald-550 bg-emerald-600 animate-pulse",
          badgeClass: "text-emerald-950 bg-emerald-50/85 border border-emerald-300 font-extrabold"
        };
      case 'Busy':
        return {
          label: "BUSY",
          pipClass: "bg-rose-500",
          badgeClass: "text-rose-950 bg-rose-50/85 border border-rose-300 font-extrabold"
        };
      case 'Away':
        return {
          label: "AWAY",
          pipClass: "bg-amber-500",
          badgeClass: "text-amber-950 bg-amber-50/85 border border-amber-300 font-extrabold"
        };
      case 'Offline':
      default:
        return {
          label: "OFFLINE",
          pipClass: "bg-slate-500",
          badgeClass: "text-slate-950 bg-slate-50/85 border border-slate-350 font-extrabold"
        };
    }
  };

  const getPresenceStyles = (presence: string) => {
    switch (presence) {
      case 'Available':
        return { bg: 'bg-emerald-500', text: 'text-emerald-700', border: 'border-emerald-200', bgSubtle: 'bg-emerald-50' };
      case 'Busy':
        return { bg: 'bg-rose-500', text: 'text-rose-700', border: 'border-rose-200', bgSubtle: 'bg-rose-50' };
      case 'Away':
        return { bg: 'bg-amber-500', text: 'text-amber-700', border: 'border-amber-200', bgSubtle: 'bg-amber-50' };
      default:
        return { bg: 'bg-slate-400', text: 'text-slate-600', border: 'border-slate-200', bgSubtle: 'bg-slate-50' };
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Navigation Options */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-xs font-semibold py-1 px-2.5 rounded-lg border border-slate-200 bg-white shadow-xs cursor-pointer transition-colors"
          id="btn-back-to-projects"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Projects</span>
        </button>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleSyncTeamsPresence}
            disabled={syncingPresence}
            className="inline-flex items-center gap-1.5 text-xs text-slate-700 hover:text-indigo-600 border border-slate-200 bg-white py-1.5 px-3.5 rounded-lg cursor-pointer font-bold transition-colors shadow-2xs"
            id="btn-sync-teams-presence"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-indigo-500 ${syncingPresence ? 'animate-spin' : ''}`} />
            <span>Check Live Teams Status</span>
          </button>

          {activeRole !== 'Member' && (
            <button
              onClick={handleSyncClick}
              disabled={syncing}
              className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-blue-600 border border-slate-200 bg-white py-1.5 px-3.5 rounded-lg cursor-pointer font-semibold transition-colors"
              id="btn-sync-project"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin text-blue-500' : ''}`} />
              <span>Re-Sync Jira Metrics</span>
            </button>
          )}
        </div>
      </div>

      {/* Hero Summary Grid */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-center gap-2.5">
            <span className="bg-slate-100 border border-slate-200 text-slate-700 font-mono text-xs font-bold px-2 py-0.5 rounded">
              {project.key}
            </span>
            <h2 className="text-2xl font-display font-medium text-slate-800 tracking-tight leading-none">{project.name}</h2>
          </div>
          <p className="text-slate-600 text-sm leading-relaxed">{project.description}</p>
          <div className="pt-2 text-xs text-slate-400 font-mono">
            <span>Project Lead: <strong className="text-slate-600 font-sans">{project.lead}</strong></span>
          </div>
        </div>

        {/* Dynamic Metric Blocks */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-4 text-center flex flex-col justify-center">
            <Layers className="w-5 h-5 text-blue-650 text-blue-600 mx-auto mb-1.5" />
            <span className="text-[10.5px] uppercase tracking-wider font-mono font-black text-slate-950">Stories</span>
            <span className="text-xl font-black text-blue-800 font-mono mt-0.5">{project.userStoriesCount}</span>
          </div>
          <div className="bg-rose-50/60 border border-rose-200 rounded-xl p-4 text-center flex flex-col justify-center">
            <Bug className="w-5 h-5 text-rose-650 text-rose-600 mx-auto mb-1.5" />
            <span className="text-[10.5px] uppercase tracking-wider font-mono font-black text-slate-950">Bugs</span>
            <span className="text-xl font-black text-rose-800 font-mono mt-0.5">{project.bugsCount}</span>
          </div>
          <div className="bg-slate-100/60 border border-slate-300 rounded-xl p-4 text-center flex flex-col justify-center">
            <Users className="w-5 h-5 text-slate-700 mx-auto mb-1.5" />
            <span className="text-[10.5px] uppercase tracking-wider font-mono font-black text-slate-950">Members</span>
            <span className="text-xl font-black text-slate-950 font-mono mt-0.5">{projectMembers.length}</span>
          </div>
        </div>
      </div>

      {/* Crew List / Members Section */}
      <div className="space-y-4 pt-4">
        <div>
          <h3 className="text-lg font-display font-medium text-slate-800">Assigned Team Members</h3>
          <p className="text-xs text-slate-500">Real-time status synchronized with Teams Presence and availability matrix.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projectMembers.map((m) => {
            const statusInfo = getMemberStatusInfo(m);
            return (
              <div
                key={m.id}
                className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-350 transition-all flex flex-col group relative"
                id={`member-grid-${m.id}`}
              >
                {/* Profile row */}
                <div className="flex items-start gap-3.5">
                  <div className="relative shrink-0">
                    <img
                      src={m.avatar}
                      alt={m.name}
                      referrerPolicy="no-referrer"
                      className="w-13 h-13 rounded-full object-cover ring-2 ring-slate-100"
                    />
                    {/* Teams dynamic presence pip */}
                    <span
                      className={`absolute bottom-0 right-0 block h-3.5 w-3.5 rounded-full ring-2 ring-white ${statusInfo.pipClass}`}
                      title={`Teams Presence: ${statusInfo.label}`}
                    ></span>
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <h4 className="font-display font-bold text-sm text-slate-950 group-hover:text-blue-600 transition-colors truncate">
                      {m.name}
                    </h4>
                    <span className="inline-block px-2 py-0.5 rounded bg-slate-50 border border-slate-250 text-slate-850 text-slate-800 font-mono text-[10px] uppercase font-extrabold">
                      {m.role}
                    </span>
                    <p className="text-slate-900 font-bold text-[10.5px] font-mono leading-normal break-all">{m.email}</p>
                  </div>
                </div>

                {/* Meta details footer */}
                <div className="mt-4 pt-3.5 border-t border-slate-105 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-950 font-black">Microsoft Teams Status:</span>
                  <span className={`px-2 py-0.5 border rounded-full text-[10px] font-bold ${statusInfo.badgeClass}`}>
                    ● {statusInfo.label}
                  </span>
                </div>

                {/* Dynamic scheduling interactions */}
                <div className="grid grid-cols-3 bg-slate-50 rounded-lg p-1 text-center font-medium border border-slate-150 mt-4.5 gap-1 shadow-xs">
                  <button
                    onClick={() => onSelectMember(m)}
                    className="py-1.5 px-2 rounded-md hover:bg-white text-[11px] text-slate-700 hover:text-blue-600 transition-all cursor-pointer flex flex-col items-center gap-0.5"
                    title="View Profile Details"
                  >
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    <span className="font-sans font-medium text-[10px]">Details</span>
                  </button>

                  <button
                    onClick={() => onSelectMember(m, 'schedule')}
                    className="py-1.5 px-2 rounded-md hover:bg-white text-[11px] text-slate-700 hover:text-blue-600 transition-all cursor-pointer flex flex-col items-center gap-0.5"
                    title="Schedule Instant Meeting"
                  >
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span className="font-sans font-medium text-[10px]">Meeting</span>
                  </button>

                  <button
                    onClick={() => onSelectMember(m, 'chat')}
                    className="py-1.5 px-2 rounded-md hover:bg-white text-[11px] text-slate-700 hover:text-blue-600 transition-all cursor-pointer flex flex-col items-center gap-0.5"
                    title="Start Chats Messaging"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                    <span className="font-sans font-medium text-[10px]">Chat-Graph</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { AreaChart, Users, HelpCircle, Activity, BarChart2, ShieldCheck, Bug, Layers, HelpCircle as Help } from 'lucide-react';
import { Project, TeamMember, Meeting } from '../types';

interface AnalyticsPanelProps {
  projects: Project[];
  members: TeamMember[];
  meetings: Meeting[];
}

export default function AnalyticsPanel({ projects, members, meetings }: AnalyticsPanelProps) {
  const [selectedProjKey, setSelectedProjKey] = React.useState<string>("");

  const selectedProj = selectedProjKey ? projects.find(p => p.key === selectedProjKey) : null;

  // Filter metrics based on selected project scope
  const filteredMeetings = selectedProj
    ? meetings.filter(m => {
        const matchesName = m.projectName?.toLowerCase() === selectedProj.name?.toLowerCase();
        const matchesKey = m.projectName?.toUpperCase() === selectedProj.key?.toUpperCase();
        return matchesName || matchesKey;
      })
    : meetings;

  const filteredMembers = selectedProj
    ? members.filter(m => m.projects.includes(selectedProj.key))
    : members;

  // Aggregate stats
  const totalMeetings = filteredMeetings.length;
  const activeMembersCount = filteredMembers.filter(m => m.active).length;

  // Sprint Velocity Metrics
  const totalStories = selectedProj
    ? selectedProj.userStoriesCount
    : projects.reduce((acc, p) => acc + p.userStoriesCount, 0);

  const totalBugs = selectedProj
    ? selectedProj.bugsCount
    : projects.reduce((acc, p) => acc + p.bugsCount, 0);

  // Simulated Team Availability Index
  const availabilityRate = "72%";
  const utilizationRate = "84%";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-medium text-slate-800 font-semibold tracking-tight">Operational Analytics Dashboard</h2>
          <p className="text-slate-500 text-sm mt-0.5">Statistical metrics tracking meeting volume, team scheduling load, and sprint health ratios.</p>
        </div>

        {/* Scope Context Filter drop down */}
        <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-2 rounded-xl shrink-0 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 font-mono">Scope:</span>
          <select
            value={selectedProjKey}
            onChange={(e) => setSelectedProjKey(e.target.value)}
            className="text-xs font-semibold text-slate-700 bg-transparent border-none outline-none cursor-pointer focus:ring-0"
            id="analytics-project-scope-select"
          >
            <option value="">All Connected Projects</option>
            {projects.map((p) => (
              <option key={p.key} value={p.key}>{p.name} ({p.key})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Aggregate Metric Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Meetings */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400 block">Total Meetings</span>
            <span className="text-2xl font-bold text-slate-800 font-mono mt-0.5 block">{totalMeetings}</span>
            <span className="text-[10px] text-emerald-600 font-mono">+12% from last sprint</span>
          </div>
          <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold text-lg shadow-xs shrink-0">
            <BarChart2 className="w-5 h-5" />
          </div>
        </div>

        {/* Utilization Rate */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400 block">Utilization Score</span>
            <span className="text-2xl font-bold text-indigo-700 font-mono mt-0.5 block">{utilizationRate}</span>
            <span className="text-[10px] text-slate-400 font-mono">Sprint velocity balance rate</span>
          </div>
          <div className="w-11 h-11 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold text-lg shadow-xs shrink-0">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Availability Block */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400 block">Open Slots Index</span>
            <span className="text-2xl font-bold text-emerald-600 font-mono mt-0.5 block">{availabilityRate}</span>
            <span className="text-[10px] text-emerald-600 font-mono">Perfect meeting matches</span>
          </div>
          <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-bold text-lg shadow-xs shrink-0">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        {/* Total Active Resources */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400 block">Active Developers</span>
            <span className="text-2xl font-bold text-slate-800 font-mono mt-0.5 block">{activeMembersCount}</span>
            <span className="text-[10px] text-indigo-600 font-mono">100% Teams Sync active</span>
          </div>
          <div className="w-11 h-11 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center font-bold text-lg shadow-xs shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Visual Charts section (D3 / SVG optimized rendering) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Weekly Resource Availability Load chart */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div>
            <h3 className="font-display font-semibold text-slate-800 text-base">Weekly Scheduling Peak Density</h3>
            <p className="text-xs text-slate-400 mt-1">Simulated chart representing days of week and average active busy hours.</p>
          </div>

          <div className="pt-4 h-48 flex items-end justify-between px-3 relative border-b border-l border-slate-150">
            {/* Guide gridlines */}
            <div className="absolute left-0 right-0 top-1/4 border-t border-slate-100 border-dashed w-full"></div>
            <div className="absolute left-0 right-0 top-2/4 border-t border-slate-100 border-dashed w-full"></div>
            <div className="absolute left-0 right-0 top-3/4 border-t border-slate-100 border-dashed w-full"></div>
            
            {/* Monday bar */}
            <div className="flex flex-col items-center gap-1.5 w-[14%] shrink-0 relative group">
              <div className="w-full bg-slate-100 hover:bg-slate-200 rounded-t-md h-24 transition-all relative">
                <div className="absolute bottom-0 left-0 right-0 h-[60%] bg-blue-500 rounded-t-md group-hover:bg-blue-600"></div>
                <span className="absolute -top-6 text-[10px] font-mono text-slate-500 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-slate-900 text-white py-0.5 px-1.5 rounded">60%</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">Mon</span>
            </div>

            {/* Tuesday bar */}
            <div className="flex flex-col items-center gap-1.5 w-[14%] shrink-0 relative group">
              <div className="w-full bg-slate-100 hover:bg-slate-200 rounded-t-md h-32 transition-all relative">
                <div className="absolute bottom-0 left-0 right-0 h-[85%] bg-blue-500 rounded-t-md group-hover:bg-blue-600"></div>
                <span className="absolute -top-6 text-[10px] font-mono text-slate-500 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-slate-900 text-white py-0.5 px-1.5 rounded">85%</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">Tue</span>
            </div>

            {/* Wednesday bar */}
            <div className="flex flex-col items-center gap-1.5 w-[14%] shrink-0 relative group">
              <div className="w-full bg-slate-100 hover:bg-slate-200 rounded-t-md h-40 transition-all relative">
                <div className="absolute bottom-0 left-0 right-0 h-[92%] bg-indigo-500 rounded-t-md group-hover:bg-indigo-600 text-center"></div>
                <span className="absolute -top-6 text-[10px] font-mono text-indigo-500 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-slate-900 text-white py-0.5 px-1.5 rounded">92%</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">Wed</span>
            </div>

            {/* Thursday bar */}
            <div className="flex flex-col items-center gap-1.5 w-[14%] shrink-0 relative group">
              <div className="w-full bg-slate-100 hover:bg-slate-200 rounded-t-md h-28 transition-all relative">
                <div className="absolute bottom-0 left-0 right-0 h-[70%] bg-blue-500 rounded-t-md group-hover:bg-blue-600"></div>
                <span className="absolute -top-6 text-[10px] font-mono text-slate-500 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-slate-900 text-white py-0.5 px-1.5 rounded">70%</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">Thu</span>
            </div>

            {/* Friday bar */}
            <div className="flex flex-col items-center gap-1.5 w-[14%] shrink-0 relative group">
              <div className="w-full bg-slate-100 hover:bg-slate-200 rounded-t-md h-20 transition-all relative">
                <div className="absolute bottom-0 left-0 right-0 h-[45%] bg-blue-500 rounded-t-md group-hover:bg-blue-600"></div>
                <span className="absolute -top-6 text-[10px] font-mono text-slate-500 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-slate-900 text-white py-0.5 px-1.5 rounded">45%</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">Fri</span>
            </div>
          </div>
        </div>

        {/* Jira Sprint Health Ratios chart */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div>
            <h3 className="font-display font-semibold text-slate-800 text-base">Project Hub Sprint Backlog Ratio</h3>
            <p className="text-xs text-slate-400 mt-1">Comparison charts tracking user stories vs active bugs per connected project key.</p>
          </div>

          <div className="space-y-4">
            {projects
              .filter((p) => !selectedProjKey || p.key === selectedProjKey)
              .map((proj) => {
                const ratio = proj.userStoriesCount + proj.bugsCount > 0 
                  ? Math.round((proj.bugsCount / (proj.userStoriesCount + proj.bugsCount)) * 100)
                  : 0;
                return (
                  <div key={proj.id} className="space-y-1.5" id={`analytics-project-ratio-${proj.key.toLowerCase()}`}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 font-display">{proj.name} ({proj.key})</span>
                    <span className="text-slate-500 font-mono">Stories: <strong>{proj.userStoriesCount}</strong> • Bugs: <strong className="text-rose-500">{proj.bugsCount}</strong></span>
                  </div>
                  
                  {/* Progress bars indicator split */}
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-xs border border-slate-100">
                    <div
                      className="bg-blue-500 hover:bg-blue-600 transition-all"
                      style={{ width: `${100 - ratio}%` }}
                      title="Stories Share"
                    />
                    <div
                      className="bg-rose-500 hover:bg-rose-600 transition-all"
                      style={{ width: `${ratio}%` }}
                      title="Bugs Share"
                    />
                  </div>

                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                    <span>{100 - ratio}% Code Integrity</span>
                    <span>{ratio}% Bug Density Ratio</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

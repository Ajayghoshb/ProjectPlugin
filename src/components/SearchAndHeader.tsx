import React, { useState, useRef, useEffect } from 'react';
import { Search, RotateCcw, AlertCircle, X, CheckCircle } from 'lucide-react';
import { Project, TeamMember } from '../types';

interface SearchAndHeaderProps {
  projects: Project[];
  members: TeamMember[];
  onSelectProject: (p: Project) => void;
  onSelectMember: (m: TeamMember) => void;
  onResetDb: () => void;
  userEmail: string;
}

export default function SearchAndHeader({
  projects,
  members,
  onSelectProject,
  onSelectMember,
  onResetDb,
  userEmail
}: SearchAndHeaderProps) {
  const [query, setQuery] = useState('');
  const [resultsOpen, setResultsOpen] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [liveTime, setLiveTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter matching elements across Projects & Team Members
  const searchResults = () => {
    if (!query.trim()) return { projects: [], members: [] };
    const q = query.toLowerCase();

    const matchedProjects = projects.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.key.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.lead.toLowerCase().includes(q)
    );

    const matchedMembers = members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q)
    );

    return { projects: matchedProjects, members: matchedMembers };
  };

  const { projects: matchProjects, members: matchMembers } = searchResults();
  const hasResults = matchProjects.length > 0 || matchMembers.length > 0;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (resultsRef.current && !resultsRef.current.contains(event.target as Node)) {
        setResultsOpen(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleReset = async () => {
    try {
      await onResetDb();
      setResetMessage("Successfully re-initialized platform to base standards.");
      setTimeout(() => setResetMessage(null), 4000);
    } catch (e) {
      setResetMessage("Error resetting database.");
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 px-5 py-2.5 flex items-center justify-between gap-5" id="app-header">
      {/* Global Search Interface */}
      <div className="relative flex-1 max-w-[240px]" ref={resultsRef}>
        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none font-sans">
          <Search className="h-3.5 w-3.5 text-slate-400" />
        </div>
        <input
          type="text"
          placeholder="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setResultsOpen(true);
          }}
          onFocus={() => setResultsOpen(true)}
          className="w-full pl-7.5 pr-7 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all text-slate-800 font-sans"
          id="global-search-input"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-2 inset-y-0 text-slate-400 hover:text-slate-600 flex items-center pr-1"
          >
            <X className="w-3 h-3" />
          </button>
        )}

        {/* Search Results Dropdown */}
        {resultsOpen && query.trim() && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden max-h-96">
            <div className="p-2.5 bg-slate-50 border-b border-slate-100 text-[10px] font-mono uppercase tracking-wider text-slate-400 flex justify-between">
              <span>Search Results</span>
              <span>Hit select to view</span>
            </div>
            
            <div className="overflow-y-auto max-h-80 divide-y divide-slate-100">
              {/* Matched Projects */}
              {matchProjects.length > 0 && (
                <div className="p-1.5">
                  <span className="block px-2.5 py-1 text-[11px] font-semibold text-blue-600 bg-blue-50/50 rounded-md mb-1 font-sans">
                    Projects ({matchProjects.length})
                  </span>
                  {matchProjects.map((proj) => (
                    <button
                      key={proj.id}
                      onClick={() => {
                        onSelectProject(proj);
                        setResultsOpen(false);
                        setQuery('');
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-50 transition-colors flex items-center justify-between group"
                    >
                      <div>
                        <span className="font-semibold text-slate-800 font-display group-hover:text-blue-600">
                          {proj.name}
                        </span>
                        <span className="text-slate-400 text-[10px] font-mono ml-2">[{proj.key}]</span>
                        <p className="text-slate-500 truncate max-w-sm mt-0.5 text-[11px]">
                          Lead: {proj.lead} • {proj.description}
                        </p>
                      </div>
                      <span className="text-[10px] text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                        Open Project
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Matched Developers/Members */}
              {matchMembers.length > 0 && (
                <div className="p-1.5">
                  <span className="block px-2.5 py-1 text-[11px] font-semibold text-indigo-600 bg-indigo-50/50 rounded-md mb-1 font-sans">
                    Team Members ({matchMembers.length})
                  </span>
                  {matchMembers.map((member) => (
                    <button
                      key={member.id}
                      onClick={() => {
                        onSelectMember(member);
                        setResultsOpen(false);
                        setQuery('');
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-50 transition-colors flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          referrerPolicy="no-referrer"
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <div>
                          <span className="font-semibold text-slate-800 group-hover:text-indigo-600">
                            {member.name}
                          </span>
                          <span className="text-slate-400 text-[10px] font-mono ml-2">({member.role})</span>
                          <p className="text-slate-500 truncate max-w-sm text-[11px] font-mono">
                            {member.email}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                        View Schedule & Chat
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {!hasResults && (
                <div className="px-4 py-8 text-center">
                  <AlertCircle className="w-5 h-5 text-slate-400 mx-auto mb-1.5" />
                  <p className="text-xs font-medium text-slate-600">No matching projects or resources found</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Try searching 'titan', 'developer', or 'sarah@project.io'</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Database state reset and Info */}
      <div className="flex items-center gap-4">
        {resetMessage && (
          <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs py-1.5 px-3 rounded-lg animate-fade-in font-medium">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{resetMessage}</span>
          </div>
        )}

        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 border border-slate-200 hover:border-slate-300 py-1.5 px-3 rounded-lg bg-white shadow-xs transition-colors cursor-pointer font-medium"
          title="Reset back to standard demo state"
          id="btn-database-reset"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Base Data</span>
        </button>

        {/* User context badge (now showing details on click) */}
        <div className="relative shrink-0" ref={dropdownRef} id="user-profile-dropdown-container">
          <button
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="w-8 h-8 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-full flex items-center justify-center font-bold text-xs uppercase font-mono cursor-pointer transition-all border border-blue-500 shadow-sm"
            title="Click to view user profiles and email details"
            id="btn-user-avatar-toggle"
          >
            {userEmail?.charAt(0) || 'A'}
          </button>
          
          {showProfileDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl p-4 z-50 animate-fade-in text-left">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-2.5 mb-2.5">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs uppercase font-mono shrink-0">
                  {userEmail?.charAt(0) || 'A'}
                </div>
                <div className="leading-tight overflow-hidden">
                  <span className="text-[10px] text-slate-400 block font-mono uppercase tracking-wider">Signed In As</span>
                  <span className="text-slate-800 font-bold text-[12px] block truncate" title={userEmail || 'ajayaghosh.b@thinkpalm.com'}>
                    {userEmail || 'ajayaghosh.b@thinkpalm.com'}
                  </span>
                </div>
              </div>
              <div className="text-[11px] text-slate-500 font-sans leading-normal">
                Active Member of <span className="font-semibold text-slate-700">Think It Workspace</span> with <span className="text-emerald-600 font-semibold">Active Teams Proxy</span>.
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

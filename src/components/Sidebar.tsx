import React from 'react';
import { LayoutDashboard, CalendarDays, Shield, Brain, Zap, FileText } from 'lucide-react';
import { RoleType } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeRole: RoleType;
  setActiveRole: (role: RoleType) => void;
}

export default function Sidebar({ activeTab, setActiveTab, activeRole, setActiveRole }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Project Hub', icon: LayoutDashboard, roles: ['Admin', 'Manager', 'Member'] },
    { id: 'custom-report', label: 'Custom Report', icon: FileText, roles: ['Admin', 'Manager', 'Member'] },
    { id: 'meetings', label: 'Scheduler', icon: CalendarDays, roles: ['Admin', 'Manager', 'Member'] },
    { id: 'brain', label: 'the Memory', icon: Brain, roles: ['Admin', 'Manager', 'Member'] },
    { id: 'plugit', label: 'PLUGIT', icon: Zap, roles: ['Admin', 'Manager', 'Member'] },
    { id: 'vertex', label: 'Vertex Admin', icon: Shield, roles: ['Admin', 'Manager', 'Member'] }
  ];

  const allowedItems = menuItems.filter(item => item.roles.includes(activeRole));

  return (
    <aside className="w-56 bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 shrink-0 h-screen sticky top-0" id="app-sidebar">
      {/* Brand Header */}
      <div className="p-4.5 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white tracking-widest text-base shadow-md shadow-blue-500/20">
            TI
          </div>
          <div>
            <h1 className="font-display font-semibold text-xs leading-tight text-white tracking-wide">Think It</h1>
            <span className="text-[10px] text-slate-400 font-mono">Resource & Calendar</span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="text-[9px] uppercase tracking-widest font-bold text-slate-500 px-2.5 mb-1.5 font-mono">
          Main Workspace
        </div>
        {allowedItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs font-medium transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-blue-600/10 text-blue-400 border-l-4 border-blue-500 font-semibold'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40 border-l-4 border-transparent'
              }`}
              id={`nav-${item.id}`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Platform Footer */}
      <div className="p-3.5 border-t border-slate-800 bg-slate-950/40 text-[10px] text-slate-500 font-mono flex flex-col gap-1">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Teams Proxy Active</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-400">
          <span>Google Calendar Auth</span>
          <span className="text-[8px] bg-slate-800 px-1 py-0.5 rounded text-slate-400 uppercase">OK</span>
        </div>
      </div>
    </aside>
  );
}

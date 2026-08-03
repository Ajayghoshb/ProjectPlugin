import React, { ReactNode } from 'react';
import { useTeamsContext } from '../hooks/useTeamsContext';

interface TeamsLayoutProps {
  children?: ReactNode;
}

export function TeamsLayout({ children }: TeamsLayoutProps) {
  const { runtime, capabilities } = useTeamsContext();

  return (
    <div className={`teams-layout-container flex flex-col min-h-screen font-sans transition-colors ${
      runtime.theme === 'dark' ? 'bg-slate-950 text-slate-100' :
      runtime.theme === 'highContrast' ? 'bg-black text-yellow-300' :
      'bg-slate-50 text-slate-800'
    }`}>
      {/* Development-only Teams Runtime Telemetry Bar */}
      {runtime.isDevelopment && (
        <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 text-[11px] font-mono text-slate-300 flex items-center justify-between gap-4 flex-wrap select-none">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${runtime.isInTeams ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <strong className="text-white">{runtime.isInTeams ? 'Inside Teams Client' : 'Browser Standalone Mode'}</strong>
            </span>
            <span>•</span>
            <span>Host: <strong className="text-indigo-300">{runtime.host.name}</strong></span>
            <span>•</span>
            <span>Theme: <strong className="text-purple-300 uppercase">{runtime.theme}</strong></span>
            <span>•</span>
            <span>Locale: <strong className="text-slate-200">{runtime.locale}</strong></span>
          </div>

          <div className="flex items-center gap-3 text-[10px]">
            <span className="bg-indigo-950 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded font-bold">
              SDK Init: {runtime.initializationTime ? `${runtime.initializationTime}ms` : 'Ready'}
            </span>
            <span className="bg-emerald-950 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-bold">
              Capabilities: 14/14 Active
            </span>
          </div>
        </div>
      )}

      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6">
        {children}
      </main>
    </div>
  );
}

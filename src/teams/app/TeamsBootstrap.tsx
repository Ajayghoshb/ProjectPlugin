import React, { ReactNode } from 'react';
import { useTeamsContext } from '../hooks/useTeamsContext';
import { TeamsLogger } from '../services/TeamsLogger';

interface TeamsBootstrapProps {
  children: ReactNode;
}

export function TeamsBootstrap({ children }: TeamsBootstrapProps) {
  const { runtime, loading, error } = useTeamsContext();

  if (loading || !runtime.isInitialized) {
    TeamsLogger.init('Teams Bootstrap awaiting SDK initialization lifecycle completion...');
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-500 font-sans text-xs space-y-2">
        <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <span>Initializing Microsoft Teams Runtime Foundation...</span>
      </div>
    );
  }

  if (error) {
    TeamsLogger.warn('Teams Bootstrap initialized with runtime error warning:', error);
  }

  return <>{children}</>;
}

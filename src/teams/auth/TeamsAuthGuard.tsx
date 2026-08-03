import React, { ReactNode } from 'react';
import { useTeamsAuth } from './useTeamsAuth';

interface TeamsAuthGuardProps {
  children: ReactNode;
}

export function TeamsAuthGuard({ children }: TeamsAuthGuardProps) {
  const { isAuthenticated, isAuthenticating, error, login } = useTeamsAuth();

  if (isAuthenticating) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-500 font-sans text-xs space-y-2">
        <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <span>Authenticating with Microsoft Entra ID SSO...</span>
      </div>
    );
  }

  if (error || !isAuthenticated) {
    return (
      <div className="p-8 max-w-md mx-auto my-12 bg-white border border-slate-200 rounded-2xl shadow-lg text-center space-y-4 font-sans text-slate-800">
        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto font-bold text-lg">
          🔒
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-base text-slate-900">Microsoft Entra ID Authentication Required</h3>
          <p className="text-xs text-slate-500">Sign in with your Microsoft 365 work account to access AI Meeting Intelligence.</p>
        </div>

        {error && <div className="p-2 bg-red-50 text-red-700 rounded-lg text-xs font-mono">{error}</div>}

        <button
          onClick={() => login()}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-sm transition-all cursor-pointer"
        >
          Sign In with Microsoft SSO
        </button>
      </div>
    );
  }

  return <>{children}</>;
}

import React, { useState, useEffect, ReactNode } from 'react';
import { TeamsAuthContext } from './TeamsAuthContext';
import { TeamsAuthState, AuthUser, TeamsAuthContextContract } from './TeamsAuthTypes';
import { TeamsAuthService } from './TeamsAuthService';
import { TeamsLogger } from '../services/TeamsLogger';

interface TeamsAuthProviderProps {
  children: ReactNode;
}

export function TeamsAuthProvider({ children }: TeamsAuthProviderProps) {
  const [authState, setAuthState] = useState<TeamsAuthState>({
    isAuthenticated: false,
    isAuthenticating: true,
    user: null,
    token: null,
    error: null
  });

  const handleLogin = async () => {
    TeamsLogger.info('Initiating Microsoft Entra ID SSO login sequence...');
    setAuthState(prev => ({ ...prev, isAuthenticating: true, error: null }));

    try {
      const idToken = await TeamsAuthService.acquireTeamsSSOToken();
      if (!idToken) {
        throw new Error('Failed to acquire Teams SSO id_token');
      }

      const tokenRes = await TeamsAuthService.exchangeTokenOBO(idToken);
      const userProfile = await TeamsAuthService.resolveUserProfile(tokenRes?.accessToken || idToken);

      const activeToken = tokenRes?.accessToken || idToken;
      setAuthState({
        isAuthenticated: true,
        isAuthenticating: false,
        user: userProfile,
        token: activeToken,
        error: null
      });
      TeamsLogger.info('[TEAMS_SSO_SUCCESS] Entra ID SSO Login successfully completed for UPN:', userProfile.userPrincipalName);

      // Trigger user-centric calendar subscription for authenticated user A
      TeamsAuthService.triggerCalendarSubscription(activeToken).catch(subErr => {
        TeamsLogger.warn('Background calendar subscription trigger warning:', subErr);
      });
    } catch (err: any) {
      TeamsLogger.error('Teams SSO Login Exception:', err);
      setAuthState({
        isAuthenticated: false,
        isAuthenticating: false,
        user: null,
        token: null,
        error: err?.message || 'Authentication failed'
      });
    }
  };

  const handleLogout = () => {
    TeamsLogger.info('Logging out user from Teams context...');
    setAuthState({
      isAuthenticated: false,
      isAuthenticating: false,
      user: null,
      token: null,
      error: null
    });
  };

  const getAccessToken = async (): Promise<string | null> => {
    if (authState.token) return authState.token;
    const token = await TeamsAuthService.acquireTeamsSSOToken();
    return token;
  };

  useEffect(() => {
    handleLogin();
  }, []);

  const value: TeamsAuthContextContract = {
    ...authState,
    login: handleLogin,
    logout: handleLogout,
    getAccessToken
  };

  return (
    <TeamsAuthContext.Provider value={value}>
      {children}
    </TeamsAuthContext.Provider>
  );
}

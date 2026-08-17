import * as teamsjs from '@microsoft/teams-js';
import { TeamsAuthState, AuthUser, AuthTokenResponse } from './TeamsAuthTypes';
import { TeamsLogger } from '../services/TeamsLogger';
import { TeamsConfiguration } from '../services/TeamsConfiguration';
import { TeamsEnvironment } from '../services/TeamsEnvironment';
import { API_URL } from '../../config/api';

export class TeamsAuthService {
  private static cachedToken: AuthTokenResponse | null = null;

  public static async acquireTeamsSSOToken(): Promise<string | null> {
    const isInTeams = TeamsEnvironment.isTeamsEnvironment();

    if (!isInTeams) {
      TeamsLogger.info('[TEAMS_SSO_STARTED] Running in browser standalone fallback mode. Utilizing local developer authentication token.');
      return 'mock-dev-access-token-zylozin-enterprise';
    }

    try {
      TeamsLogger.info('[TEAMS_SSO_STARTED] Executing native Teams SSO app.getAuthToken()...');
      const authToken = await teamsjs.authentication.getAuthToken({
        resources: [TeamsConfiguration.get().azureClientId || 'eec115d2-8418-4d66-8e18-b4283ffca2b1'],
        silent: true
      });

      TeamsLogger.info('[TEAMS_SSO_SUCCESS] Successfully acquired native Teams SSO id_token.');
      return authToken;
    } catch (err: any) {
      TeamsLogger.warn('[TEAMS_SSO_FAILED] Native Teams SSO getAuthToken() silent acquisition failed:', err?.message || err);
      return null;
    }
  }

  public static async exchangeTokenOBO(teamsIdToken: string): Promise<AuthTokenResponse | null> {
    try {
      TeamsLogger.info('Exchanging Teams id_token via backend On-Behalf-Of (OBO) endpoint (/api/teams/auth/token)...');
      const res = await fetch(`${API_URL}/api/teams/auth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: teamsIdToken })
      });

      if (!res.ok) {
        throw new Error(`OBO HTTP Exception: ${res.statusText}`);
      }

      const data = await res.json();
      TeamsAuthService.cachedToken = {
        accessToken: data.accessToken || teamsIdToken,
        expiresOn: Date.now() + 3600 * 1000,
        scopes: data.scopes || ['User.Read', 'OnlineMeetings.ReadWrite']
      };

      return TeamsAuthService.cachedToken;
    } catch (err: any) {
      TeamsLogger.error('Failed to exchange token via OBO backend endpoint:', err);
      return {
        accessToken: teamsIdToken,
        expiresOn: Date.now() + 3600 * 1000,
        scopes: ['User.Read', 'OnlineMeetings.ReadWrite', 'Calendars.Read']
      };
    }
  }

  public static async resolveUserProfile(token: string): Promise<AuthUser> {
    const config = TeamsConfiguration.get();

    // Attempt to decode Entra JWT token claims if valid 3-part JWT
    try {
      if (token && token.includes('.')) {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
          const payloadJson = atob(payloadBase64);
          const claims = JSON.parse(payloadJson);

          const email = (claims.preferred_username || claims.upn || claims.email || 'ajayaghosh.b@thinkpalm.com').toLowerCase().trim();
          const userId = claims.oid || claims.sub || 'u-teams-enterprise-admin';
          const tenantId = claims.tid || config.azureTenantId || '8ec8a471-4328-4e8f-8c69-e64abdf2725e';
          const displayName = claims.name || (claims.given_name ? `${claims.given_name} ${claims.family_name || ''}`.trim() : 'ThinkIt User');

          const userProfile: AuthUser = {
            id: userId,
            displayName,
            email,
            userPrincipalName: email,
            tenantId,
            jobTitle: claims.jobTitle || 'Enterprise Solutions Architect',
            avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
          };

          TeamsLogger.info(`[TEAMS_USER_CONTEXT] Resolved authenticated identity: userId=${userId}, userEmail=${email}, tenantId=${tenantId}`);
          return userProfile;
        }
      }
    } catch (err: any) {
      TeamsLogger.warn('JWT claim extraction failed. Utilizing configured fallback identity:', err?.message || err);
    }

    const defaultUser: AuthUser = {
      id: 'u-teams-enterprise-admin',
      displayName: 'Ajayaghosh B',
      email: 'ajayaghosh.b@thinkpalm.com',
      userPrincipalName: 'ajayaghosh.b@thinkpalm.com',
      tenantId: config.azureTenantId || '8ec8a471-4328-4e8f-8c69-e64abdf2725e',
      jobTitle: 'Principal Enterprise Solutions Architect',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
    };

    TeamsLogger.info(`[TEAMS_USER_CONTEXT] Utilizing default identity: userId=${defaultUser.id}, userEmail=${defaultUser.email}`);
    return defaultUser;
  }

  public static async triggerCalendarSubscription(bearerToken: string): Promise<boolean> {
    try {
      TeamsLogger.info('[CALENDAR_USER_SUBSCRIPTION_TRIGGERED] Triggering user-centric calendar subscription via POST /api/teams/subscribe-calendars...');
      const res = await fetch(`${API_URL}/api/teams/subscribe-calendars`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${bearerToken}`
        }
      });

      if (res.ok) {
        TeamsLogger.info('[CALENDAR_USER_SUBSCRIPTION_CREATED] User-centric calendar subscription confirmed active by backend.');
        return true;
      } else {
        const errText = await res.text();
        TeamsLogger.warn(`[CALENDAR_USER_SUBSCRIPTION_FAILED] Backend returned HTTP ${res.status}: ${errText}`);
        return false;
      }
    } catch (err: any) {
      TeamsLogger.error('Failed to trigger user calendar subscription:', err?.message || err);
      return false;
    }
  }
}

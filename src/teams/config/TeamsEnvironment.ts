import { TeamsConfig } from '../types/teams.types';

export class TeamsEnvironment {
  public static getConfig(): TeamsConfig {
    const metaEnv = (import.meta as any).env || {};
    const procEnv = typeof process !== 'undefined' ? process.env || {} : {};

    return {
      azureTenantId: metaEnv.VITE_MICROSOFT_APP_TENANT_ID || procEnv.MICROSOFT_APP_TENANT_ID || metaEnv.VITE_AZURE_TENANT_ID || procEnv.AZURE_TENANT_ID || 'eec115d2-8418-4d66-8e18-b4283ffca2b',
      azureClientId: metaEnv.VITE_MICROSOFT_APP_ID || procEnv.MICROSOFT_APP_ID || metaEnv.VITE_AZURE_CLIENT_ID || procEnv.AZURE_CLIENT_ID || '8ec8a471-4328-4e8f-8c69-e64abdf2725',
      teamsAppId: metaEnv.VITE_MICROSOFT_APP_ID || procEnv.MICROSOFT_APP_ID || metaEnv.VITE_TEAMS_APP_ID || procEnv.TEAMS_APP_ID || '8ec8a471-4328-4e8f-8c69-e64abdf2725',
      teamsBotId: metaEnv.VITE_MICROSOFT_APP_ID || procEnv.MICROSOFT_APP_ID || metaEnv.VITE_TEAMS_BOT_ID || procEnv.TEAMS_BOT_ID || '8ec8a471-4328-4e8f-8c69-e64abdf2725',
      graphBaseUrl: metaEnv.VITE_GRAPH_BASE_URL || procEnv.GRAPH_BASE_URL || 'https://graph.microsoft.com/v1.0',
      teamsDomain: metaEnv.VITE_TEAMS_DOMAIN || procEnv.TEAMS_DOMAIN || 'project-plugin.vercel.app',
      appBaseUrl: metaEnv.VITE_APP_BASE_URL || procEnv.APP_BASE_URL || 'https://project-plugin.vercel.app'
    };
  }

  public static isTeamsEnvironment(): boolean {
    if (typeof window === 'undefined') return false;
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.has('inTeams') || window.name.includes('teams') || window.location.href.includes('teams');
  }
}

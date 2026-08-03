import { TeamsConfig } from '../types/teams.types';

export class TeamsEnvironment {
  public static getConfig(): TeamsConfig {
    const metaEnv = (import.meta as any).env || {};
    const procEnv = typeof process !== 'undefined' ? process.env || {} : {};

    return {
      azureTenantId: metaEnv.VITE_AZURE_TENANT_ID || procEnv.AZURE_TENANT_ID || '',
      azureClientId: metaEnv.VITE_AZURE_CLIENT_ID || procEnv.AZURE_CLIENT_ID || '',
      teamsAppId: metaEnv.VITE_TEAMS_APP_ID || procEnv.TEAMS_APP_ID || '',
      teamsBotId: metaEnv.VITE_TEAMS_BOT_ID || procEnv.TEAMS_BOT_ID || '',
      graphBaseUrl: metaEnv.VITE_GRAPH_BASE_URL || procEnv.GRAPH_BASE_URL || 'https://graph.microsoft.com/v1.0',
      teamsDomain: metaEnv.VITE_TEAMS_DOMAIN || procEnv.TEAMS_DOMAIN || '',
      appBaseUrl: metaEnv.VITE_APP_BASE_URL || procEnv.APP_BASE_URL || ''
    };
  }

  public static isTeamsEnvironment(): boolean {
    if (typeof window === 'undefined') return false;
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.has('inTeams') || window.name.includes('teams') || window.location.href.includes('teams');
  }
}

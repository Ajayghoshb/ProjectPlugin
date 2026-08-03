export type TeamsTheme = 'default' | 'dark' | 'highContrast';
export type HostClient = 'desktop' | 'web' | 'mobile' | 'browser_standalone';

export interface TeamsHostInfo {
  name: string;
  clientType: HostClient;
  version?: string;
}

export interface TeamsSessionInfo {
  sessionId?: string;
  userPrincipalName?: string;
  tenantId?: string;
  loginHint?: string;
}

export interface TeamsCapabilities {
  supportsSSO: boolean;
  supportsGraph: boolean;
  supportsMeetingContext: boolean;
  supportsNotifications: boolean;
  supportsChat: boolean;
  supportsCalendar: boolean;
  supportsFiles: boolean;
  supportsTabs: boolean;
  supportsBot: boolean;
  supportsAdaptiveCards: boolean;
  supportsMedia: boolean;
  supportsRecording: boolean;
  supportsTranslation: boolean;
  supportsAI: boolean;
}

export interface TeamsRuntime {
  isInitialized: boolean;
  isInTeams: boolean;
  isDevelopment: boolean;
  initializationTime: number | null;
  host: TeamsHostInfo;
  session: TeamsSessionInfo;
  theme: TeamsTheme;
  locale: string;
  region: string;
  frameContext: string;
  appVersion: string;
}

export interface TeamsAppContext {
  runtime: TeamsRuntime;
  capabilities: TeamsCapabilities;
  loading: boolean;
  error: string | null;
}

export interface TeamsConfig {
  azureTenantId?: string;
  azureClientId?: string;
  teamsAppId?: string;
  teamsBotId?: string;
  graphBaseUrl?: string;
  teamsDomain?: string;
  appBaseUrl?: string;
}

export type TeamsEventType = 
  | 'themeChanged'
  | 'hostChanged'
  | 'localeChanged'
  | 'windowFocus'
  | 'appResume'
  | 'appSuspend';

export type TeamsEventCallback = (payload: any) => void;

import { createContext } from 'react';
import { TeamsAppContext, TeamsRuntime } from '../types/teams.types';
import { TeamsCapabilitiesService } from '../services/TeamsCapabilitiesService';
import { TeamsEnvironment } from '../services/TeamsEnvironment';

export const initialTeamsRuntime: TeamsRuntime = {
  isInitialized: false,
  isInTeams: false,
  isDevelopment: TeamsEnvironment.isDevelopment(),
  initializationTime: null,
  host: {
    name: 'Standalone Browser',
    clientType: 'browser_standalone',
    version: '1.0.0'
  },
  session: {
    sessionId: undefined,
    userPrincipalName: undefined,
    tenantId: undefined
  },
  theme: 'default',
  locale: 'en-US',
  region: 'US',
  frameContext: 'content',
  appVersion: '1.15.0'
};

export const initialTeamsAppContext: TeamsAppContext = {
  runtime: initialTeamsRuntime,
  capabilities: TeamsCapabilitiesService.getCapabilities(),
  loading: true,
  error: null
};

export const TeamsContext = createContext<TeamsAppContext>(initialTeamsAppContext);

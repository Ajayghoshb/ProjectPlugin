import React, { useState, useEffect, ReactNode } from 'react';
import * as teamsjs from '@microsoft/teams-js';
import { TeamsContext, initialTeamsRuntime } from './TeamsContext';
import { TeamsAppContext, TeamsRuntime, TeamsTheme } from '../types/teams.types';
import { TeamsEnvironment } from '../services/TeamsEnvironment';
import { TeamsCapabilitiesService } from '../services/TeamsCapabilitiesService';
import { TeamsEventsService } from '../services/TeamsEventsService';
import { TeamsLogger } from '../services/TeamsLogger';

interface TeamsProviderProps {
  children: ReactNode;
}

export function TeamsProvider({ children }: TeamsProviderProps) {
  const [appContext, setAppContext] = useState<TeamsAppContext>({
    runtime: initialTeamsRuntime,
    capabilities: TeamsCapabilitiesService.getCapabilities(),
    loading: true,
    error: null
  });

  useEffect(() => {
    let isMounted = true;

    const initializeSDK = async () => {
      TeamsLogger.init('Starting @microsoft/teams-js SDK initialization sequence...');
      const startTime = Date.now();

      const isInTeams = TeamsEnvironment.isTeamsEnvironment();
      const isDev = TeamsEnvironment.isDevelopment();
      const hostClient = TeamsEnvironment.getHostClient();

      if (!isInTeams) {
        TeamsLogger.init('Running outside native Microsoft Teams client. Hydrating fallback browser runtime context.');
        if (isMounted) {
          setAppContext({
            runtime: {
              ...initialTeamsRuntime,
              isInitialized: true,
              isInTeams: false,
              isDevelopment: isDev,
              initializationTime: Date.now() - startTime,
              host: {
                name: 'Browser Standalone',
                clientType: hostClient,
                version: '1.0.0'
              },
              locale: TeamsEnvironment.getCurrentLocale()
            },
            capabilities: TeamsCapabilitiesService.getCapabilities(),
            loading: false,
            error: null
          });
        }
        return;
      }

      try {
        // Initialize @microsoft/teams-js SDK safely
        await teamsjs.app.initialize();
        TeamsLogger.init('@microsoft/teams-js SDK successfully initialized!');

        const context = await teamsjs.app.getContext();
        TeamsLogger.init('Successfully retrieved Teams SDK context:', context);

        const currentTheme: TeamsTheme = (context.app?.theme as TeamsTheme) || 'default';
        const currentLocale = context.app?.locale || TeamsEnvironment.getCurrentLocale();

        // Register theme change listener
        teamsjs.app.registerOnThemeChangeHandler((newTheme: string) => {
          TeamsLogger.event(`Teams SDK native theme change event received: ${newTheme}`);
          const parsedTheme: TeamsTheme = (newTheme as TeamsTheme) || 'default';

          if (isMounted) {
            setAppContext(prev => ({
              ...prev,
              runtime: {
                ...prev.runtime,
                theme: parsedTheme
              }
            }));
          }
          TeamsEventsService.notify('themeChanged', parsedTheme);
        });

        if (isMounted) {
          setAppContext({
            runtime: {
              isInitialized: true,
              isInTeams: true,
              isDevelopment: isDev,
              initializationTime: Date.now() - startTime,
              host: {
                name: context.app?.host?.name || 'Microsoft Teams',
                clientType: hostClient,
                version: context.app?.host?.clientType || '2.0.0'
              },
              session: {
                sessionId: (context as any).telemetry?.sessionId || (context as any).sessionId,
                userPrincipalName: context.user?.userPrincipalName,
                tenantId: context.user?.tenant?.id,
                loginHint: context.user?.loginHint
              },
              theme: currentTheme,
              locale: currentLocale,
              region: 'US',
              frameContext: context.page?.frameContext || 'content',
              appVersion: '1.15.0'
            },
            capabilities: TeamsCapabilitiesService.getCapabilities(),
            loading: false,
            error: null
          });
        }
      } catch (err: any) {
        TeamsLogger.error('Failed to initialize @microsoft/teams-js SDK. Hydrating error fallback context:', err);
        if (isMounted) {
          setAppContext({
            runtime: {
              ...initialTeamsRuntime,
              isInitialized: true,
              isInTeams: false,
              isDevelopment: isDev,
              initializationTime: Date.now() - startTime,
              host: {
                name: 'Browser Fallback (SDK Error)',
                clientType: 'browser_standalone',
                version: '1.0.0'
              }
            },
            capabilities: TeamsCapabilitiesService.getCapabilities(),
            loading: false,
            error: err?.message || 'Teams SDK Initialization Exception'
          });
        }
      }
    };

    initializeSDK();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <TeamsContext.Provider value={appContext}>
      {children}
    </TeamsContext.Provider>
  );
}

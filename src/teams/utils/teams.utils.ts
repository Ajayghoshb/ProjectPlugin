import { TeamsEnvironment } from '../services/TeamsEnvironment';
import { TeamsTheme, HostClient } from '../types/teams.types';

export function isRunningInsideTeams(): boolean {
  return TeamsEnvironment.isTeamsEnvironment();
}

export function isDevelopment(): boolean {
  return TeamsEnvironment.isDevelopment();
}

export function isBrowser(): boolean {
  return TeamsEnvironment.isBrowser();
}

export function isDesktop(): boolean {
  return TeamsEnvironment.isDesktop();
}

export function isWeb(): boolean {
  return TeamsEnvironment.isWeb();
}

export function isMobile(): boolean {
  return TeamsEnvironment.isMobile();
}

export function getHostName(): string {
  if (isDesktop()) return 'Microsoft Teams Desktop';
  if (isMobile()) return 'Microsoft Teams Mobile';
  if (isRunningInsideTeams()) return 'Microsoft Teams Web';
  return 'Browser Standalone';
}

export function getCurrentLocale(): string {
  return TeamsEnvironment.getCurrentLocale();
}

export function isRunningInTeamsIframe(): boolean {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
}

export function formatTeamsUserDisplayName(firstName?: string, lastName?: string): string {
  if (!firstName && !lastName) return 'Teams User';
  return `${firstName || ''} ${lastName || ''}`.trim();
}

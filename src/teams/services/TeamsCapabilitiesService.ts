import { TeamsCapabilities } from '../types/teams.types';

export class TeamsCapabilitiesService {
  public static getCapabilities(): TeamsCapabilities {
    return {
      supportsSSO: true,
      supportsGraph: true,
      supportsMeetingContext: true,
      supportsNotifications: true,
      supportsChat: true,
      supportsCalendar: true,
      supportsFiles: true,
      supportsTabs: true,
      supportsBot: true,
      supportsAdaptiveCards: true,
      supportsMedia: true,
      supportsRecording: true,
      supportsTranslation: true,
      supportsAI: true
    };
  }
}

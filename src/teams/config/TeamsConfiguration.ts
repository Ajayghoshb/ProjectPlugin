import { TeamsConfig } from '../types/teams.types';
import { TeamsEnvironment } from './TeamsEnvironment';

export class TeamsConfiguration {
  private static instance: TeamsConfig;

  public static get(): TeamsConfig {
    if (!TeamsConfiguration.instance) {
      TeamsConfiguration.instance = TeamsEnvironment.getConfig();
    }
    return TeamsConfiguration.instance;
  }
}

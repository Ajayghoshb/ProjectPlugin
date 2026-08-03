import { useTeamsContext } from './useTeamsContext';
import { TeamsTheme } from '../types/teams.types';

export function useTeamsTheme(): TeamsTheme {
  const { runtime } = useTeamsContext();
  return runtime?.theme || 'default';
}

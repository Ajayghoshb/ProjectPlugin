import { useContext } from 'react';
import { TeamsContext } from '../providers/TeamsContext';
import { TeamsAppContext } from '../types/teams.types';

export function useTeamsContext(): TeamsAppContext {
  return useContext(TeamsContext);
}

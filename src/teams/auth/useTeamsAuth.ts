import { useContext } from 'react';
import { TeamsAuthContext } from './TeamsAuthContext';
import { TeamsAuthContextContract } from './TeamsAuthTypes';

export function useTeamsAuth(): TeamsAuthContextContract {
  return useContext(TeamsAuthContext);
}

import { createContext } from 'react';
import { TeamsAuthContextContract } from './TeamsAuthTypes';

export const initialTeamsAuthState: TeamsAuthContextContract = {
  isAuthenticated: false,
  isAuthenticating: false,
  user: null,
  token: null,
  error: null,
  login: async () => {},
  logout: () => {},
  getAccessToken: async () => null
};

export const TeamsAuthContext = createContext<TeamsAuthContextContract>(initialTeamsAuthState);

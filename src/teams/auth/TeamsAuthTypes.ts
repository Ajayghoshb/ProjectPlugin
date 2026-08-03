export interface AuthUser {
  id: string;
  displayName: string;
  email: string;
  userPrincipalName: string;
  tenantId: string;
  jobTitle?: string;
  avatarUrl?: string;
}

export interface AuthTokenResponse {
  accessToken: string;
  expiresOn: number;
  scopes: string[];
  tokenType?: string;
}

export interface TeamsAuthState {
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  user: AuthUser | null;
  token: string | null;
  error: string | null;
}

export interface TeamsAuthContextContract extends TeamsAuthState {
  login: () => Promise<void>;
  logout: () => void;
  getAccessToken: () => Promise<string | null>;
}

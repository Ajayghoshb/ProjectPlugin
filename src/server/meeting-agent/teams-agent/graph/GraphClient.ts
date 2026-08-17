import dotenv from 'dotenv';
dotenv.config();

export interface GraphCallJoinRequest {
  joinWebUrl: string;
  meetingId?: string;
  tenantId?: string;
  organizerId?: string;
}

export interface GraphTokenDiagnosticResult {
  success: boolean;
  token?: string;
  httpStatus?: number;
  error?: string;
  errorDescription?: string;
  errorCode?: string;
  traceId?: string;
  correlationId?: string;
  tenantIdDiag?: {
    length: number;
    isUuidFormat: boolean;
    prefix: string;
    suffix: string;
    sourceVariable: string;
  };
  secretSource?: string;
  appIdSource?: string;
}

/**
 * Strips accidental surrounding quotes, single quotes, carriage returns, and whitespace from environment values
 */
function sanitizeEnvString(val: string | undefined): string {
  if (!val) return '';
  return val.replace(/['"\s\r\n]/g, '').trim();
}

export class RealMicrosoftGraphClient {
  private graphEndpoint: string = 'https://graph.microsoft.com/v1.0';

  /**
   * Dynamically resolve Graph App Credentials with deterministic fallback, quote sanitization & placeholder filtering
   */
  public getCredentials(): {
    appId: string;
    tenantId: string;
    appSecret: string;
    appIdSource: string;
    tenantIdSource: string;
    secretSource: string;
    tenantIdDiag: {
      length: number;
      isUuidFormat: boolean;
      prefix: string;
      suffix: string;
      sourceVariable: string;
    };
  } {
    let appId = '';
    let appIdSource = 'DEFAULT_FALLBACK';
    if (process.env.MICROSOFT_GRAPH_CLIENT_ID) {
      appId = sanitizeEnvString(process.env.MICROSOFT_GRAPH_CLIENT_ID);
      appIdSource = 'MICROSOFT_GRAPH_CLIENT_ID';
    } else if (process.env.MICROSOFT_APP_ID) {
      appId = sanitizeEnvString(process.env.MICROSOFT_APP_ID);
      appIdSource = 'MICROSOFT_APP_ID';
    } else if (process.env.AZURE_CLIENT_ID) {
      appId = sanitizeEnvString(process.env.AZURE_CLIENT_ID);
      appIdSource = 'AZURE_CLIENT_ID';
    } else {
      appId = '8ec8a471-4328-4e8f-8c69-e64abdf2725e';
    }

    let tenantId = '';
    let tenantIdSource = 'DEFAULT_FALLBACK';
    if (process.env.MICROSOFT_APP_TENANT_ID) {
      tenantId = sanitizeEnvString(process.env.MICROSOFT_APP_TENANT_ID);
      tenantIdSource = 'MICROSOFT_APP_TENANT_ID';
    } else if (process.env.MICROSOFT_GRAPH_TENANT_ID) {
      tenantId = sanitizeEnvString(process.env.MICROSOFT_GRAPH_TENANT_ID);
      tenantIdSource = 'MICROSOFT_GRAPH_TENANT_ID';
    } else if (process.env.AZURE_TENANT_ID) {
      tenantId = sanitizeEnvString(process.env.AZURE_TENANT_ID);
      tenantIdSource = 'AZURE_TENANT_ID';
    } else {
      tenantId = 'eec115d2-8418-4d66-8e18-b4283ffca2b1';
    }

    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    const isUuidFormat = uuidRegex.test(tenantId);
    const tenantIdDiag = {
      length: tenantId.length,
      isUuidFormat,
      prefix: tenantId.length >= 4 ? tenantId.substring(0, 4) : tenantId,
      suffix: tenantId.length >= 4 ? tenantId.substring(tenantId.length - 4) : tenantId,
      sourceVariable: tenantIdSource
    };

    let appSecret = '';
    let secretSource = 'NONE';
    const secretCandidates = [
      { name: 'MICROSOFT_GRAPH_CLIENT_SECRET', val: process.env.MICROSOFT_GRAPH_CLIENT_SECRET },
      { name: 'MICROSOFT_APP_PASSWORD', val: process.env.MICROSOFT_APP_PASSWORD },
      { name: 'AZURE_CLIENT_SECRET', val: process.env.AZURE_CLIENT_SECRET }
    ];

    for (const candidate of secretCandidates) {
      const sanitized = sanitizeEnvString(candidate.val);
      if (
        sanitized !== '' &&
        sanitized !== 'YOUR_TEAMS_BOT_PASSWORD' &&
        sanitized !== 'YOUR_AZURE_CLIENT_SECRET' &&
        sanitized !== 'YOUR_MICROSOFT_GRAPH_CLIENT_SECRET'
      ) {
        appSecret = sanitized;
        secretSource = candidate.name;
        break;
      }
    }

    return { appId, tenantId, appSecret, appIdSource, tenantIdSource, secretSource, tenantIdDiag };
  }

  /**
   * Acquire Service-to-Service Access Token with Safe Diagnostic Details
   */
  async getAppAccessTokenDiagnostic(): Promise<GraphTokenDiagnosticResult> {
    const creds = this.getCredentials();

    if (!creds.appSecret) {
      return {
        success: false,
        error: 'MISSING_OR_PLACEHOLDER_SECRET',
        errorDescription: 'No valid secret found in MICROSOFT_GRAPH_CLIENT_SECRET, MICROSOFT_APP_PASSWORD, or AZURE_CLIENT_SECRET.',
        tenantIdDiag: creds.tenantIdDiag,
        secretSource: creds.secretSource,
        appIdSource: creds.appIdSource
      };
    }

    try {
      console.log(`[GRAPH] Token acquisition started using App ID Source '${creds.appIdSource}', Tenant Source '${creds.tenantIdSource}' (Length: ${creds.tenantIdDiag.length}, UUID: ${creds.tenantIdDiag.isUuidFormat}, Prefix: ${creds.tenantIdDiag.prefix}..., Suffix: ...${creds.tenantIdDiag.suffix}), Secret Source '${creds.secretSource}'...`);
      
      const tokenUrl = `https://login.microsoftonline.com/${creds.tenantId}/oauth2/v2.0/token`;
      const body = new URLSearchParams({
        client_id: creds.appId,
        client_secret: creds.appSecret,
        grant_type: 'client_credentials',
        scope: 'https://graph.microsoft.com/.default'
      });

      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString()
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        const httpStatus = response.status;
        const error = errJson.error || 'unauthorized_client';
        const errorDescription = errJson.error_description || response.statusText;
        const errorCode = errJson.error_codes ? errJson.error_codes.join(',') : undefined;
        const traceId = errJson.trace_id;
        const correlationId = errJson.correlation_id;

        console.error(`[GRAPH] ❌ Token acquisition FAILED (HTTP ${httpStatus} [${error}]): ${errorDescription}`);

        return {
          success: false,
          httpStatus,
          error,
          errorDescription,
          errorCode,
          traceId,
          correlationId,
          tenantIdDiag: creds.tenantIdDiag,
          secretSource: creds.secretSource,
          appIdSource: creds.appIdSource
        };
      }

      const data = await response.json();
      console.log('[GRAPH] ✅ Token acquisition SUCCESS. Microsoft Graph OAuth2 app token acquired.');
      return {
        success: true,
        token: data.access_token,
        httpStatus: 200,
        tenantIdDiag: creds.tenantIdDiag,
        secretSource: creds.secretSource,
        appIdSource: creds.appIdSource
      };
    } catch (err: any) {
      console.error('[GRAPH] ❌ Token acquisition network exception:', err.message || err);
      return {
        success: false,
        error: 'NETWORK_EXCEPTION',
        errorDescription: err.message || 'Network exception calling Entra ID OAuth2 endpoint',
        tenantIdDiag: creds.tenantIdDiag,
        secretSource: creds.secretSource,
        appIdSource: creds.appIdSource
      };
    }
  }

  /**
   * Acquire Access Token String (Convenience Helper)
   */
  async getAppAccessToken(): Promise<string | null> {
    const diag = await this.getAppAccessTokenDiagnostic();
    return diag.success && diag.token ? diag.token : null;
  }

  /**
   * Helper to resolve Entra User Object ID GUID from Email Address via Microsoft Graph API
   */
  async resolveUserObjectId(emailOrId: string | undefined, token: string): Promise<string> {
    if (!emailOrId) return '8ec8a471-4328-4e8f-8c69-e64abdf2725e';
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    if (uuidRegex.test(emailOrId)) return emailOrId;

    if (emailOrId.includes('@')) {
      try {
        const res = await fetch(`${this.graphEndpoint}/users/${encodeURIComponent(emailOrId)}?$select=id`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.id) {
            console.log(`[GRAPH] Resolved organizer email '${emailOrId}' to Entra Object ID GUID '${data.id}'`);
            return data.id;
          }
        }
      } catch (err: any) {
        console.warn(`[GRAPH] ⚠️ Failed to resolve user object ID for '${emailOrId}':`, err.message || err);
      }
    }
    return emailOrId;
  }

  /**
   * Issue Real Microsoft Graph Cloud Communications Call Join Request
   * Endpoint: POST /v1.0/communications/calls
   */
  async joinCall(request: GraphCallJoinRequest): Promise<{ success: boolean; callId?: string; error?: string; httpStatus?: number }> {
    const rawJoinUrl = request.joinWebUrl;
    if (!rawJoinUrl || typeof rawJoinUrl !== 'string' || !rawJoinUrl.startsWith('http') || rawJoinUrl.includes('m-default') || rawJoinUrl.trim().length < 15) {
      console.warn(`[MEETING_JOIN_URL_UNAVAILABLE] Invalid or missing joinWebUrl for organizer '${request.organizerId || 'UNKNOWN'}'. Provided: '${rawJoinUrl}'`);
      return {
        success: false,
        error: 'MEETING_JOIN_URL_UNAVAILABLE'
      };
    }

    const diag = await this.getAppAccessTokenDiagnostic();
    if (!diag.success || !diag.token) {
      return {
        success: false,
        error: `GRAPH_AUTHENTICATION_FAILED [${diag.error || 'MISSING_TOKEN'}]: ${diag.errorDescription || 'Unable to acquire Graph access token'}`
      };
    }

    const callbackUri = process.env.BOT_ENDPOINT ? process.env.BOT_ENDPOINT.replace('/api/messages', '/api/calling') : 'https://projectplugin-api.onrender.com/api/calling';
    const resolvedOrganizerId = await this.resolveUserObjectId(request.organizerId, diag.token);

    console.log(`[GRAPH_JOIN_REQUEST]`, JSON.stringify({
      joinWebUrlPresent: true,
      joinWebUrlPrefix: rawJoinUrl.substring(0, 45) + '...',
      organizerIdPresent: !!request.organizerId,
      resolvedOrganizerId,
      callbackUri,
      timestamp: new Date().toISOString()
    }));

    const callPayload = {
      '@odata.type': '#microsoft.graph.call',
      callbackUri,
      targets: [
        {
          '@odata.type': '#microsoft.graph.invitationParticipantInfo',
          identity: {
            '@odata.type': '#microsoft.graph.identitySet',
            user: {
              id: resolvedOrganizerId,
              displayName: 'Organizer'
            }
          }
        }
      ],
      requestedModalities: ['audio'],
      mediaConfig: {
        '@odata.type': '#microsoft.graph.serviceHostedMediaConfig'
      },
      meetingInfo: {
        '@odata.type': '#microsoft.graph.organizerMeetingInfo',
        organizer: {
          '@odata.type': '#microsoft.graph.identitySet',
          user: { id: resolvedOrganizerId }
        },
        allowConversationWithoutOrganizer: true
      }
    };

    try {
      const response = await fetch(`${this.graphEndpoint}/communications/calls`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${diag.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(callPayload)
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        const errCode = errJson.error?.code || response.statusText;
        const errMsg = errJson.error?.message || 'Graph API join call rejected';
        console.error(`[GRAPH_JOIN_FAILED] HTTP ${response.status} [${errCode}]: ${errMsg} (Organizer: ${resolvedOrganizerId})`);
        return { success: false, httpStatus: response.status, error: `GRAPH_JOIN_FAILED [${response.status} ${errCode}]: ${errMsg}` };
      }

      const data = await response.json();
      console.log(`[GRAPH_JOIN_ACCEPTED] ✅ Microsoft Graph accepted call join! Call ID: '${data.id}', State: '${data.state}'`);
      return { success: true, callId: data.id, httpStatus: response.status };
    } catch (err: any) {
      console.error('[GRAPH_JOIN_FAILED] ❌ Call join network exception:', err.message || err);
      return { success: false, error: err.message || 'Network exception joining call' };
    }
  }

  /**
   * Fetch Real Meeting Transcript Content from Microsoft Graph API
   * Endpoint: GET /v1.0/users/{userId}/onlineMeetings/{meetingId}/transcripts/{transcriptId}/content
   */
  async fetchMeetingTranscriptContent(userId: string, meetingId: string, transcriptId: string): Promise<string | null> {
    const token = await this.getAppAccessToken();
    if (!token) return null;

    try {
      console.log(`[TRANSCRIPT] Transcript requested for meeting '${meetingId}', transcript '${transcriptId}'...`);
      const url = `${this.graphEndpoint}/users/${userId}/onlineMeetings/${meetingId}/transcripts/${transcriptId}/content?$format=text/vtt`;
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        console.warn(`[TRANSCRIPT] ⚠️ Transcript request returned HTTP ${response.status}`);
        return null;
      }

      const vttContent = await response.text();
      console.log(`[TRANSCRIPT] Transcript received (${vttContent.length} bytes).`);
      return vttContent;
    } catch (err: any) {
      console.error('[TRANSCRIPT] ❌ Error fetching transcript content:', err);
      return null;
    }
  }
}

export const realGraphClient = new RealMicrosoftGraphClient();

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
}

export class RealMicrosoftGraphClient {
  private graphEndpoint: string = 'https://graph.microsoft.com/v1.0';

  /**
   * Dynamically resolve Graph App Credentials with deterministic fallback & placeholder filtering
   */
  public getCredentials(): { appId: string; tenantId: string; appSecret: string } {
    const appId = (
      process.env.MICROSOFT_GRAPH_CLIENT_ID ||
      process.env.MICROSOFT_APP_ID ||
      process.env.AZURE_CLIENT_ID ||
      '8ec8a471-4328-4e8f-8c69-e64abdf2725e'
    ).trim();

    const tenantId = (
      process.env.MICROSOFT_APP_TENANT_ID ||
      process.env.MICROSOFT_GRAPH_TENANT_ID ||
      process.env.AZURE_TENANT_ID ||
      'eec115d2-8418-4d66-8e18-b4283ffca2b1'
    ).trim();

    const secretCandidates = [
      process.env.MICROSOFT_GRAPH_CLIENT_SECRET,
      process.env.MICROSOFT_APP_PASSWORD,
      process.env.AZURE_CLIENT_SECRET
    ];

    let appSecret = '';
    for (const candidate of secretCandidates) {
      if (
        candidate &&
        candidate.trim() !== '' &&
        candidate.trim() !== 'YOUR_TEAMS_BOT_PASSWORD' &&
        candidate.trim() !== 'YOUR_AZURE_CLIENT_SECRET' &&
        candidate.trim() !== 'YOUR_MICROSOFT_GRAPH_CLIENT_SECRET'
      ) {
        appSecret = candidate.trim();
        break;
      }
    }

    return { appId, tenantId, appSecret };
  }

  /**
   * Acquire Service-to-Service Access Token with Safe Diagnostic Details
   */
  async getAppAccessTokenDiagnostic(): Promise<GraphTokenDiagnosticResult> {
    const { appId, tenantId, appSecret } = this.getCredentials();

    if (!appSecret) {
      return {
        success: false,
        error: 'MISSING_OR_PLACEHOLDER_SECRET',
        errorDescription: 'No valid secret found in MICROSOFT_GRAPH_CLIENT_SECRET, MICROSOFT_APP_PASSWORD, or AZURE_CLIENT_SECRET.'
      };
    }

    try {
      console.log(`[GRAPH] Token acquisition started for App ID '${appId}' on Entra tenant '${tenantId}'...`);
      const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
      const body = new URLSearchParams({
        client_id: appId,
        client_secret: appSecret,
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
          correlationId
        };
      }

      const data = await response.json();
      console.log('[GRAPH] ✅ Token acquisition SUCCESS. Microsoft Graph OAuth2 app token acquired.');
      return {
        success: true,
        token: data.access_token,
        httpStatus: 200
      };
    } catch (err: any) {
      console.error('[GRAPH] ❌ Token acquisition network exception:', err.message || err);
      return {
        success: false,
        error: 'NETWORK_EXCEPTION',
        errorDescription: err.message || 'Network exception calling Entra ID OAuth2 endpoint'
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
   * Issue Real Microsoft Graph Cloud Communications Call Join Request
   * Endpoint: POST /v1.0/communications/calls
   */
  async joinCall(request: GraphCallJoinRequest): Promise<{ success: boolean; callId?: string; error?: string; httpStatus?: number }> {
    const diag = await this.getAppAccessTokenDiagnostic();
    if (!diag.success || !diag.token) {
      return {
        success: false,
        error: `AUTHENTICATION_FAILED [${diag.error || 'MISSING_TOKEN'}]: ${diag.errorDescription || 'Unable to acquire Graph access token'}`
      };
    }

    const callbackUri = process.env.BOT_ENDPOINT ? process.env.BOT_ENDPOINT.replace('/api/messages', '/api/calling') : 'https://projectplugin-api.onrender.com/api/calling';
    console.log(`[GRAPH] Call join request started for joinWebUrl '${request.joinWebUrl.substring(0, 50)}...' (Callback: ${callbackUri})`);

    const callPayload = {
      '@odata.type': '#microsoft.graph.call',
      callbackUri,
      targets: [
        {
          '@odata.type': '#microsoft.graph.invitationParticipantInfo',
          identity: {
            '@odata.type': '#microsoft.graph.identitySet',
            user: {
              id: request.organizerId || 'organizer-id',
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
          user: { id: request.organizerId || 'organizer-id' }
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
        console.error(`[GRAPH] ❌ Call join FAILED HTTP ${response.status} [${errCode}]: ${errMsg}`);
        return { success: false, httpStatus: response.status, error: `GRAPH_API_ERROR [${response.status} ${errCode}]: ${errMsg}` };
      }

      const data = await response.json();
      console.log(`[GRAPH] ✅ Call join SUCCESS. Accepted by Microsoft Graph. Call ID: '${data.id}', State: '${data.state}'`);
      return { success: true, callId: data.id, httpStatus: response.status };
    } catch (err: any) {
      console.error('[GRAPH] ❌ Call join network exception:', err.message || err);
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

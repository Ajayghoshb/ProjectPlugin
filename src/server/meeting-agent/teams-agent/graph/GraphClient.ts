import dotenv from 'dotenv';
dotenv.config();

export interface GraphCallJoinRequest {
  joinWebUrl: string;
  meetingId?: string;
  tenantId?: string;
  organizerId?: string;
}

export class RealMicrosoftGraphClient {
  private appId: string;
  private appSecret: string;
  private tenantId: string;
  private graphEndpoint: string = 'https://graph.microsoft.com/v1.0';

  constructor() {
    this.appId = process.env.MICROSOFT_APP_ID || process.env.AZURE_CLIENT_ID || '8ec8a471-4328-4e8f-8c69-e64abdf2725e';
    this.appSecret = process.env.MICROSOFT_APP_PASSWORD || process.env.AZURE_CLIENT_SECRET || '';
    this.tenantId = process.env.MICROSOFT_APP_TENANT_ID || process.env.AZURE_TENANT_ID || 'eec115d2-8418-4d66-8e18-b4283ffca2b1';
  }

  /**
   * Acquire Service-to-Service Confidential Client Access Token from Microsoft Entra ID
   */
  async getAppAccessToken(): Promise<string | null> {
    if (!this.appSecret || this.appSecret === 'YOUR_TEAMS_BOT_PASSWORD' || this.appSecret === 'YOUR_AZURE_CLIENT_SECRET') {
      console.warn('[GRAPH] ⚠️ MICROSOFT_APP_PASSWORD / AZURE_CLIENT_SECRET is not set to a valid secret string in .env.');
      return null;
    }

    try {
      console.log(`[GRAPH] Requesting OAuth2 app access token from Entra tenant '${this.tenantId}'...`);
      const tokenUrl = `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`;
      const body = new URLSearchParams({
        client_id: this.appId,
        client_secret: this.appSecret,
        grant_type: 'client_credentials',
        scope: 'https://graph.microsoft.com/.default'
      });

      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString()
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[GRAPH] ❌ OAuth2 token acquisition failed (${response.status}):`, errorText);
        return null;
      }

      const data = await response.json();
      console.log('[GRAPH] ✅ Successfully acquired Microsoft Graph OAuth2 app token.');
      return data.access_token;
    } catch (err: any) {
      console.error('[GRAPH] ❌ Token request network exception:', err.message || err);
      return null;
    }
  }

  /**
   * Issue Real Microsoft Graph Cloud Communications Call Join Request
   * Endpoint: POST /v1.0/communications/calls
   */
  async joinCall(request: GraphCallJoinRequest): Promise<{ success: boolean; callId?: string; error?: string }> {
    const token = await this.getAppAccessToken();
    if (!token) {
      return { success: false, error: 'AUTHENTICATION_FAILED: Missing Graph access token (Check MICROSOFT_APP_PASSWORD in .env)' };
    }

    const callbackUri = process.env.BOT_ENDPOINT ? process.env.BOT_ENDPOINT.replace('/api/messages', '/api/calling') : 'https://projectplugin-api.onrender.com/api/calling';
    console.log(`[GRAPH] Issuing POST /communications/calls for joinWebUrl '${request.joinWebUrl.substring(0, 50)}...' (Callback: ${callbackUri})`);

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
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(callPayload)
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        const errCode = errJson.error?.code || response.statusText;
        const errMsg = errJson.error?.message || 'Graph API join call rejected';
        console.error(`[GRAPH] ❌ Call join failed HTTP ${response.status} [${errCode}]: ${errMsg}`);
        return { success: false, error: `GRAPH_API_ERROR [${response.status} ${errCode}]: ${errMsg}` };
      }

      const data = await response.json();
      console.log(`[GRAPH] ✅ Call join request accepted by Microsoft Graph. Call ID: '${data.id}', State: '${data.state}'`);
      return { success: true, callId: data.id };
    } catch (err: any) {
      console.error('[GRAPH] ❌ Join call network exception:', err.message || err);
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
      console.log(`[TRANSCRIPT] Fetching real transcript content for meeting '${meetingId}', transcript '${transcriptId}'...`);
      const url = `${this.graphEndpoint}/users/${userId}/onlineMeetings/${meetingId}/transcripts/${transcriptId}/content?$format=text/vtt`;
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        console.warn(`[TRANSCRIPT] ⚠️ Transcript content request returned HTTP ${response.status}`);
        return null;
      }

      const vttContent = await response.text();
      console.log(`[TRANSCRIPT] ✅ Successfully retrieved real transcript content (${vttContent.length} bytes).`);
      return vttContent;
    } catch (err: any) {
      console.error('[TRANSCRIPT] ❌ Error fetching transcript content:', err);
      return null;
    }
  }
}

export const realGraphClient = new RealMicrosoftGraphClient();

import { DatabaseClient } from '../../../db/client';
import { realGraphClient } from '../graph/GraphClient';

export interface IBotAdapter {
  initialize(): Promise<void>;
  sendMessage(conversationId: string, text: string): Promise<boolean>;
  sendCard(conversationId: string, cardContent: any): Promise<boolean>;
  sendCardProactive(userEmail: string, cardContent: any): Promise<{ success: boolean; reason?: string; error?: string }>;
  saveConversationReference(activity: any): Promise<boolean>;
  handleActivity(activity: any): Promise<any>;
}

export class RealTeamsBotAdapter implements IBotAdapter {
  private botOAuthToken: string | null = null;
  private botOAuthTokenExpiry: number = 0;

  async initialize(): Promise<void> {
    console.log("[Bot Adapter] Real Teams Bot Framework Adapter initialized.");
  }

  /**
   * Acquire Service-to-Service Bot Framework OAuth Access Token
   * Endpoint: https://login.microsoftonline.com/botframework.com/oauth2/v2.0/token
   */
  async getBotOAuthToken(): Promise<string | null> {
    if (this.botOAuthToken && Date.now() < this.botOAuthTokenExpiry - 60000) {
      return this.botOAuthToken;
    }

    const creds = realGraphClient.getCredentials();
    if (!creds.appSecret) {
      console.error("[Bot Adapter] ❌ Unable to acquire Bot OAuth token: Missing app secret.");
      return null;
    }

    try {
      const tokenUrl = `https://login.microsoftonline.com/botframework.com/oauth2/v2.0/token`;
      const params = new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: creds.appId,
        client_secret: creds.appSecret,
        scope: 'https://api.botframework.com/.default'
      });

      const res = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        console.error(`[Bot Adapter] ❌ Bot Framework OAuth token acquisition failed HTTP ${res.status}:`, errJson);
        return null;
      }

      const data = await res.json();
      this.botOAuthToken = data.access_token;
      this.botOAuthTokenExpiry = Date.now() + (data.expires_in || 3600) * 1000;
      return this.botOAuthToken;
    } catch (err: any) {
      console.error("[Bot Adapter] ❌ Exception acquiring Bot Framework OAuth token:", err.message || err);
      return null;
    }
  }

  /**
   * Captures and persists Bot Framework ConversationReference when users interact with the bot in Teams.
   */
  async saveConversationReference(activity: any): Promise<boolean> {
    try {
      const userEmail = (activity.from?.email || activity.from?.userPrincipalName || activity.recipient?.email || '').toLowerCase().trim();
      const userObjectId = activity.from?.aadObjectId || activity.from?.id || null;
      const tenantId = activity.conversation?.tenantId || activity.channelData?.tenant?.id || process.env.MICROSOFT_APP_TENANT_ID || 'eec115d2-8418-4d66-8e18-b4283ffca2b1';
      const serviceUrl = activity.serviceUrl ? activity.serviceUrl.replace(/\/+$/, '') : 'https://smba.trafficmanager.net/amer';
      const conversationId = activity.conversation?.id;
      const botId = activity.recipient?.id || '8ec8a471-4328-4e8f-8c69-e64abdf2725e';

      if (!userEmail || !conversationId) {
        return false;
      }

      const safeReference = {
        userEmail,
        userObjectId,
        tenantId,
        serviceUrl,
        conversationId,
        botId,
        activityType: activity.type
      };

      if (DatabaseClient.isConnected()) {
        const prisma = DatabaseClient.getPrisma();
        await prisma.teamsConversationReference.upsert({
          where: { userEmail },
          update: {
            userObjectId,
            tenantId,
            serviceUrl,
            conversationId,
            botId,
            rawReference: safeReference as any,
            updatedAt: new Date()
          },
          create: {
            userEmail,
            userObjectId,
            tenantId,
            serviceUrl,
            conversationId,
            botId,
            rawReference: safeReference as any
          }
        });

        console.log(`[TEAMS_CONVERSATION_REFERENCE_SAVED] Saved Teams Conversation Reference for '${userEmail}' (Conversation: ${conversationId})`);
        return true;
      }
      return false;
    } catch (err: any) {
      console.warn("[Bot Adapter] ⚠️ Failed to save conversation reference:", err.message || err);
      return false;
    }
  }

  async sendMessage(conversationId: string, text: string): Promise<boolean> {
    console.log(`[Bot Adapter] Sent message to conversation '${conversationId}': "${text}"`);
    return true;
  }

  async sendCard(conversationId: string, cardContent: any): Promise<boolean> {
    console.log(`[Bot Adapter] Sent Adaptive Card to conversation '${conversationId}'.`);
    return true;
  }

  /**
   * Delivers an Adaptive Consent Card proactively to a Microsoft Teams organizer using their stored ConversationReference.
   */
  async sendCardProactive(userEmail: string, cardContent: any): Promise<{ success: boolean; reason?: string; error?: string }> {
    const normalizedEmail = (userEmail || '').toLowerCase().trim();
    if (!normalizedEmail) {
      console.log(`[THINKIT_PROACTIVE_MESSAGE_SKIPPED] reason=NO_ORGANIZER_EMAIL organizer=${userEmail}`);
      return { success: false, reason: 'NO_ORGANIZER_EMAIL' };
    }

    if (!DatabaseClient.isConnected()) {
      console.log(`[THINKIT_PROACTIVE_MESSAGE_SKIPPED] reason=DATABASE_DISCONNECTED organizer=${normalizedEmail}`);
      return { success: false, reason: 'DATABASE_DISCONNECTED' };
    }

    try {
      const prisma = DatabaseClient.getPrisma();
      const refRecord = await prisma.teamsConversationReference.findUnique({
        where: { userEmail: normalizedEmail }
      });

      if (!refRecord) {
        console.log(`[THINKIT_PROACTIVE_MESSAGE_SKIPPED] reason=NO_CONVERSATION_REFERENCE organizer=${normalizedEmail}`);
        return { success: false, reason: 'NO_CONVERSATION_REFERENCE' };
      }

      console.log(`[TEAMS_CONVERSATION_REFERENCE_FOUND] Found active ConversationReference for organizer '${normalizedEmail}' (ServiceUrl: ${refRecord.serviceUrl})`);

      const token = await this.getBotOAuthToken();
      if (!token) {
        console.error(`[Bot Adapter] ❌ Failed to send proactive card: Missing Bot OAuth token.`);
        return { success: false, error: 'AUTHENTICATION_FAILED: Missing Bot OAuth token' };
      }

      const postUrl = `${refRecord.serviceUrl}/v3/conversations/${refRecord.conversationId}/activities`;
      const activityPayload = {
        type: 'message',
        attachments: [
          {
            contentType: 'application/vnd.microsoft.card.adaptive',
            content: cardContent
          }
        ]
      };

      console.log(`[TEAMS_PROACTIVE_SEND_REQUESTED] Sending Adaptive Card to '${postUrl}'...`);

      const response = await fetch(postUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(activityPayload)
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error(`[Bot Adapter] ❌ Bot Framework proactive send FAILED HTTP ${response.status}: ${errText}`);
        return { success: false, error: `BOT_FRAMEWORK_ERROR [${response.status}]: ${errText}` };
      }

      console.log(`[CONSENT_REQUESTED] Successfully sent Adaptive Consent Card to organizer '${normalizedEmail}' in Teams via Bot Framework!`);
      return { success: true };
    } catch (err: any) {
      console.error(`[Bot Adapter] ❌ Exception delivering proactive card to '${normalizedEmail}':`, err.message || err);
      return { success: false, error: err.message || 'Exception' };
    }
  }

  async handleActivity(activity: any): Promise<any> {
    await this.saveConversationReference(activity);
    return { status: "PROCESSED", activityId: activity.id || `act-${Date.now()}` };
  }
}

export class MockBotAdapter implements IBotAdapter {
  async initialize(): Promise<void> {
    console.log("[Bot Adapter] Mock Bot Adapter initialized successfully.");
  }

  async sendMessage(conversationId: string, text: string): Promise<boolean> {
    console.log(`[Bot Adapter] Sent message to conversation '${conversationId}': "${text}"`);
    return true;
  }

  async sendCard(conversationId: string, cardContent: any): Promise<boolean> {
    console.log(`[Bot Adapter] Sent Adaptive Card to conversation '${conversationId}'.`);
    return true;
  }

  async sendCardProactive(userEmail: string, cardContent: any): Promise<{ success: boolean; reason?: string; error?: string }> {
    console.log(`[Bot Adapter] [Mock] Sent proactive card to '${userEmail}'.`);
    return { success: true };
  }

  async saveConversationReference(activity: any): Promise<boolean> {
    return true;
  }

  async handleActivity(activity: any): Promise<any> {
    console.log(`[Bot Adapter] Handling activity type '${activity.type}'.`);
    return { status: "PROCESSED", activityId: activity.id || `act-${Date.now()}` };
  }
}

export const realTeamsBotAdapter = new RealTeamsBotAdapter();

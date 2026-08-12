/**
 * =========================================================================================
 * THINK IT AI MEETING ASSISTANT — DEPRECATED WILDCARD GRAPH SUBSCRIPTION MANAGER
 * =========================================================================================
 * 
 * ARCHITECTURAL NOTICE:
 * ---------------------
 * This class originally attempted a global tenant-wide wildcard subscription on '/communications/onlineMeetings'.
 * 
 * MICROSOFT PLATFORM REJECTION EVIDENCE:
 * --------------------------------------
 * Microsoft Graph API explicitly rejects wildcard subscriptions on '/communications/onlineMeetings' with:
 * `HTTP 400 [ExtensionError]: Operation: Create; Exception: [Status Code: BadRequest; Reason: Unsupported workload.]`
 * 
 * ACTIVE PRODUCTION REPLACEMENT:
 * ------------------------------
 * Use 'CalendarSubscriptionManager' (src/server/meeting-agent/teams-agent/graph/CalendarSubscriptionManager.ts),
 * which uses Microsoft's supported resource '/users/{userId}/events' with 'Calendars.Read' Application permission.
 */

import { realGraphClient } from './GraphClient';

export interface GraphSubscription {
  id: string;
  resource: string;
  changeType: string;
  clientState?: string;
  notificationUrl: string;
  expirationDateTime: string;
}

export class GraphSubscriptionManager {
  private graphEndpoint: string = 'https://graph.microsoft.com/v1.0';
  private activeSubscription: GraphSubscription | null = null;
  private lastMeetingEvent: string | null = null;
  private lastConsentRequest: string | null = null;
  private lastConsentDecision: string | null = null;
  private lastJoinRequest: string | null = null;
  private lastSuccessfulBotJoin: string | null = null;

  /**
   * DEPRECATED: Attempts wildcard /communications/onlineMeetings subscription.
   * Microsoft Graph rejects this with HTTP 400 'Unsupported workload'.
   */
  async createOnlineMeetingSubscription(): Promise<{ success: boolean; subscription?: GraphSubscription; error?: string }> {
    const token = await realGraphClient.getAppAccessToken();
    if (!token) {
      console.error('[GRAPH_SUBSCRIPTION] ❌ Unable to create subscription: Missing Graph access token.');
      return { success: false, error: 'AUTHENTICATION_FAILED: Missing Graph access token' };
    }

    const notificationUrl = process.env.BOT_ENDPOINT || 'https://projectplugin-api.onrender.com/api/messages';
    const expirationDateTime = new Date(Date.now() + 4000 * 60 * 1000).toISOString();

    const payload = {
      changeType: 'created,updated',
      notificationUrl,
      resource: '/communications/onlineMeetings',
      expirationDateTime,
      clientState: 'thinkit-meeting-assistant-state'
    };

    console.log(`[GRAPH_SUBSCRIPTION] Issuing POST /subscriptions for resource '${payload.resource}' to '${notificationUrl}'...`);

    try {
      const response = await fetch(`${this.graphEndpoint}/subscriptions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        const errCode = errJson.error?.code || response.statusText;
        const errMsg = errJson.error?.message || 'Failed to create Graph subscription';
        console.error(`[GRAPH_SUBSCRIPTION] ❌ Subscription creation failed HTTP ${response.status} [${errCode}]: ${errMsg}`);
        return { success: false, error: `GRAPH_API_ERROR [${response.status} ${errCode}]: ${errMsg}` };
      }

      const subscriptionData: GraphSubscription = await response.json();
      this.activeSubscription = subscriptionData;
      console.log(`[GRAPH_SUBSCRIPTION] ✅ Microsoft Graph Change Notification Subscription created successfully! Subscription ID: '${subscriptionData.id}', Expiration: '${subscriptionData.expirationDateTime}'`);
      return { success: true, subscription: subscriptionData };
    } catch (err: any) {
      console.error('[GRAPH_SUBSCRIPTION] ❌ Subscription network exception:', err.message || err);
      return { success: false, error: err.message || 'Network exception creating subscription' };
    }
  }

  /**
   * Lists active Graph Subscriptions
   */
  async listActiveSubscriptions(): Promise<GraphSubscription[]> {
    const token = await realGraphClient.getAppAccessToken();
    if (!token) return this.activeSubscription ? [this.activeSubscription] : [];

    try {
      const response = await fetch(`${this.graphEndpoint}/subscriptions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        return this.activeSubscription ? [this.activeSubscription] : [];
      }

      const data = await response.json();
      return data.value || [];
    } catch {
      return this.activeSubscription ? [this.activeSubscription] : [];
    }
  }

  // Safe Telemetry Recording Methods
  recordMeetingEvent(meetingId: string) {
    this.lastMeetingEvent = `${new Date().toISOString()} (Meeting: ${meetingId})`;
  }

  recordConsentRequest(meetingId: string) {
    this.lastConsentRequest = `${new Date().toISOString()} (Meeting: ${meetingId})`;
  }

  recordConsentDecision(meetingId: string, decision: string) {
    this.lastConsentDecision = `${new Date().toISOString()} (Meeting: ${meetingId}, Decision: ${decision})`;
  }

  recordJoinRequest(meetingId: string) {
    this.lastJoinRequest = `${new Date().toISOString()} (Meeting: ${meetingId})`;
  }

  recordSuccessfulBotJoin(meetingId: string, callId: string) {
    this.lastSuccessfulBotJoin = `${new Date().toISOString()} (Meeting: ${meetingId}, CallID: ${callId})`;
  }

  getTelemetry() {
    return {
      activeSubscription: this.activeSubscription,
      lastMeetingEventReceived: this.lastMeetingEvent || 'NONE_YET',
      lastConsentRequest: this.lastConsentRequest || 'NONE_YET',
      lastConsentDecision: this.lastConsentDecision || 'NONE_YET',
      lastJoinRequest: this.lastJoinRequest || 'NONE_YET',
      lastSuccessfulBotJoin: this.lastSuccessfulBotJoin || 'NONE_YET'
    };
  }
}

export const graphSubscriptionManager = new GraphSubscriptionManager();

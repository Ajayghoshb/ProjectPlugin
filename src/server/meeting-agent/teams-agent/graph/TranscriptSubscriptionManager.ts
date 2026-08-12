import { realGraphClient } from './GraphClient';

export interface TranscriptSubscription {
  id: string;
  resource: string;
  changeType: string;
  notificationUrl: string;
  expirationDateTime: string;
}

export class TranscriptSubscriptionManager {
  private graphEndpoint: string = 'https://graph.microsoft.com/v1.0';
  private activeSubscription: TranscriptSubscription | null = null;
  private lastTranscriptNotification: string | null = null;
  private lastTranscriptReceived: string | null = null;

  /**
   * Subscribe to Tenant Meeting Transcript Availability Change Notifications
   * Target Resource: /communications/onlineMeetings/getAllTranscripts
   */
  async createTranscriptSubscription(): Promise<{ success: boolean; subscription?: TranscriptSubscription; error?: string }> {
    const token = await realGraphClient.getAppAccessToken();
    if (!token) {
      console.error('[TRANSCRIPT_SUBSCRIPTION] ❌ Missing Graph access token.');
      return { success: false, error: 'AUTHENTICATION_FAILED: Missing Graph access token' };
    }

    const notificationUrl = process.env.BOT_ENDPOINT || 'https://projectplugin-api.onrender.com/api/graph/notifications';
    // Max expiration for transcript change notifications is 4230 minutes (~70.5 hours)
    const expirationDateTime = new Date(Date.now() + 4000 * 60 * 1000).toISOString();

    const payload = {
      changeType: 'created',
      notificationUrl,
      resource: '/communications/onlineMeetings/getAllTranscripts',
      expirationDateTime,
      clientState: 'thinkit-transcript-subscription-state'
    };

    console.log(`[TRANSCRIPT_SUBSCRIPTION] Issuing POST /subscriptions for resource '${payload.resource}'...`);

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
        const errMsg = errJson.error?.message || response.statusText;
        console.warn(`[TRANSCRIPT_SUBSCRIPTION] ⚠️ Could not create transcript subscription: ${errMsg}`);
        return { success: false, error: errMsg };
      }

      const subData: any = await response.json();
      this.activeSubscription = {
        id: subData.id,
        resource: subData.resource,
        changeType: subData.changeType,
        notificationUrl: subData.notificationUrl,
        expirationDateTime: subData.expirationDateTime
      };

      console.log(`[TRANSCRIPT_SUBSCRIPTION] ✅ Transcript subscription active! Subscription ID: '${subData.id}'`);
      return { success: true, subscription: this.activeSubscription };
    } catch (err: any) {
      console.error('[TRANSCRIPT_SUBSCRIPTION] ❌ Exception creating transcript subscription:', err.message || err);
      return { success: false, error: err.message || 'Exception' };
    }
  }

  /**
   * Process incoming transcript change notification payload
   */
  async processTranscriptNotification(notification: any): Promise<{ success: boolean; transcriptText?: string; error?: string }> {
    this.lastTranscriptNotification = new Date().toISOString();
    console.log(`[TRANSCRIPT_NOTIFICATION_RECEIVED] Resource: '${notification.resource}'`);

    const userId = notification.resourceData?.userId || 'organizer-user-id';
    const meetingId = notification.resourceData?.meetingId || notification.meetingId || 'mtg-default';
    const transcriptId = notification.resourceData?.id || notification.transcriptId || 'transcript-default';

    console.log(`[TRANSCRIPT_REQUESTED] Fetching real VTT transcript from Graph for user '${userId}', meeting '${meetingId}', TranscriptID '${transcriptId}'...`);

    // Fetch official VTT transcript via GraphClient (positional args: userId, meetingId, transcriptId)
    const vttContent = await realGraphClient.fetchMeetingTranscriptContent(userId, meetingId, transcriptId);

    if (vttContent) {
      this.lastTranscriptReceived = new Date().toISOString();
      console.log(`[TRANSCRIPT_RECEIVED] ✅ Real VTT transcript retrieved (${vttContent.length} bytes). Preserving speaker attribution and timestamps.`);
      return { success: true, transcriptText: vttContent };
    }

    console.warn(`[TRANSCRIPT_FAILED] ⚠️ Could not retrieve transcript for meeting '${meetingId}'.`);
    return { success: false, error: 'Failed to retrieve transcript content' };
  }

  getTelemetry() {
    return {
      activeSubscription: this.activeSubscription,
      lastTranscriptNotification: this.lastTranscriptNotification || 'NONE_YET',
      lastTranscriptReceived: this.lastTranscriptReceived || 'NONE_YET'
    };
  }
}

export const transcriptSubscriptionManager = new TranscriptSubscriptionManager();

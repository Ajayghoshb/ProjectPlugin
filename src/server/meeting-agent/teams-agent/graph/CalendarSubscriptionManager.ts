import { realGraphClient } from './GraphClient';

export interface CalendarSubscription {
  id: string;
  userId: string;
  userEmail: string;
  resource: string;
  changeType: string;
  clientState?: string;
  notificationUrl: string;
  expirationDateTime: string;
}

export class CalendarSubscriptionManager {
  private graphEndpoint: string = 'https://graph.microsoft.com/v1.0';
  private activeCalendarSubscriptions: Map<string, CalendarSubscription> = new Map();
  private processedMeetingIds: Set<string> = new Set();
  
  private lastCalendarEventReceived: string | null = null;
  private lastTeamsMeetingDetected: string | null = null;
  private lastConsentRequested: string | null = null;
  private lastConsentDecision: string | null = null;
  private lastJoinRequested: string | null = null;
  private lastSuccessfulBotJoin: string | null = null;

  /**
   * Discover Tenant Organization Users and Subscribe to Calendar Events (/users/{userId}/events)
   */
  async subscribeOrgUserCalendars(): Promise<{ success: boolean; activeSubscriptionsCount: number; subscriptions: CalendarSubscription[]; errors: string[] }> {
    const token = await realGraphClient.getAppAccessToken();
    if (!token) {
      console.error('[CALENDAR_SUBSCRIPTION] ❌ Missing Graph access token.');
      return { success: false, activeSubscriptionsCount: 0, subscriptions: [], errors: ['AUTHENTICATION_FAILED: Missing Graph access token'] };
    }

    const notificationUrl = process.env.BOT_ENDPOINT || 'https://projectplugin-api.onrender.com/api/messages';
    // Maximum allowed expiration for Outlook /users/{id}/events is 4230 minutes (~70.5 hours)
    const expirationDateTime = new Date(Date.now() + 4000 * 60 * 1000).toISOString();
    const errors: string[] = [];
    const createdSubs: CalendarSubscription[] = [];

    try {
      // 1. Fetch organization users via Graph API
      console.log(`[CALENDAR_SUBSCRIPTION] Discovering organization users via GET /users...`);
      const usersRes = await fetch(`${this.graphEndpoint}/users?$select=id,userPrincipalName,mail&$top=50`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!usersRes.ok) {
        const errText = await usersRes.text();
        console.error(`[CALENDAR_SUBSCRIPTION] ❌ GET /users failed HTTP ${usersRes.status}: ${errText}`);
        errors.push(`GET /users HTTP ${usersRes.status}: ${errText}`);
        return { success: false, activeSubscriptionsCount: 0, subscriptions: [], errors };
      }

      const usersData = await usersRes.json();
      const users: any[] = usersData.value || [];
      console.log(`[CALENDAR_SUBSCRIPTION] Discovered ${users.length} organization user mailboxes.`);

      // 2. Subscribe each user's calendar events
      for (const user of users) {
        const userId = user.id;
        const userEmail = user.mail || user.userPrincipalName;
        const resource = `/users/${userId}/events`;

        const payload = {
          changeType: 'created,updated',
          notificationUrl,
          resource,
          expirationDateTime,
          clientState: 'thinkit-calendar-subscription-state'
        };

        console.log(`[CALENDAR_SUBSCRIPTION] Subscribing '${userEmail}' calendar (${resource})...`);

        const subRes = await fetch(`${this.graphEndpoint}/subscriptions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (!subRes.ok) {
          const errJson = await subRes.json().catch(() => ({}));
          const errMsg = errJson.error?.message || subRes.statusText;
          console.warn(`[CALENDAR_SUBSCRIPTION] ⚠️ Could not subscribe mailbox '${userEmail}': ${errMsg}`);
          errors.push(`User ${userEmail}: ${errMsg}`);
          continue;
        }

        const subData: any = await subRes.json();
        const subRecord: CalendarSubscription = {
          id: subData.id,
          userId,
          userEmail,
          resource,
          changeType: subData.changeType,
          clientState: subData.clientState,
          notificationUrl: subData.notificationUrl,
          expirationDateTime: subData.expirationDateTime
        };

        this.activeCalendarSubscriptions.set(subData.id, subRecord);
        createdSubs.push(subRecord);
        console.log(`[CALENDAR_SUBSCRIPTION] ✅ Calendar Subscription created for '${userEmail}'! ID: '${subData.id}'`);
      }

      return {
        success: createdSubs.length > 0,
        activeSubscriptionsCount: this.activeCalendarSubscriptions.size,
        subscriptions: Array.from(this.activeCalendarSubscriptions.values()),
        errors
      };
    } catch (err: any) {
      console.error('[CALENDAR_SUBSCRIPTION] ❌ Exception during calendar subscription creation:', err.message || err);
      return { success: false, activeSubscriptionsCount: this.activeCalendarSubscriptions.size, subscriptions: [], errors: [err.message || 'Exception'] };
    }
  }

  /**
   * Inspect incoming Calendar Event change notification and resolve Teams meeting details
   */
  async processCalendarEventChangeNotification(notification: any): Promise<{ isTeamsMeeting: boolean; meetingDetails?: any }> {
    const resource = notification.resource;
    this.lastCalendarEventReceived = new Date().toISOString();
    console.log(`[CALENDAR_EVENT_NOTIFICATION] Received calendar change notification for resource '${resource}'`);

    const token = await realGraphClient.getAppAccessToken();
    if (!token) return { isTeamsMeeting: false };

    try {
      // Fetch full event details from Graph
      const eventRes = await fetch(`${this.graphEndpoint}/${resource}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!eventRes.ok) {
        console.error(`[CALENDAR_EVENT_NOTIFICATION] ❌ Failed to fetch event '${resource}' HTTP ${eventRes.status}`);
        return { isTeamsMeeting: false };
      }

      const eventData = await eventRes.json();
      const isOnlineMeeting = eventData.isOnlineMeeting || !!eventData.onlineMeeting?.joinUrl;
      const joinUrl = eventData.onlineMeeting?.joinUrl || eventData.location?.displayName;
      const organizerEmail = eventData.organizer?.emailAddress?.address || 'organizer@company.com';
      const subject = eventData.subject || 'Teams Scheduled Meeting';
      const meetingId = eventData.id || `mtg-${Date.now()}`;

      if (!isOnlineMeeting) {
        console.log(`[CALENDAR_EVENT_NOTIFICATION] Event '${subject}' is not a Teams online meeting. Skipping.`);
        return { isTeamsMeeting: false };
      }

      console.log(`[TEAMS_MEETING_RESOLVED] ✅ Teams Meeting Detected! Subject: '${subject}', Organizer: '${organizerEmail}', JoinURL: '${joinUrl}'`);
      this.lastTeamsMeetingDetected = `${new Date().toISOString()} (${subject})`;

      // Check duplicate consent requests
      if (this.processedMeetingIds.has(meetingId)) {
        console.log(`[TEAMS_MEETING_RESOLVED] Consent request already sent for meeting '${meetingId}'. Skipping duplicate.`);
        return { isTeamsMeeting: true, meetingDetails: { meetingId, subject, organizerEmail, joinUrl, duplicate: true } };
      }

      this.processedMeetingIds.add(meetingId);
      this.lastConsentRequested = `${new Date().toISOString()} (${subject})`;

      return {
        isTeamsMeeting: true,
        meetingDetails: {
          meetingId,
          subject,
          organizerEmail,
          joinUrl,
          duplicate: false
        }
      };
    } catch (err: any) {
      console.error('[CALENDAR_EVENT_NOTIFICATION] ❌ Exception parsing calendar event:', err.message || err);
      return { isTeamsMeeting: false };
    }
  }

  recordConsentDecision(meetingId: string, decision: string) {
    this.lastConsentDecision = `${new Date().toISOString()} (Meeting: ${meetingId}, Decision: ${decision})`;
  }

  recordJoinRequest(meetingId: string) {
    this.lastJoinRequested = `${new Date().toISOString()} (Meeting: ${meetingId})`;
  }

  recordSuccessfulBotJoin(meetingId: string, callId: string) {
    this.lastSuccessfulBotJoin = `${new Date().toISOString()} (Meeting: ${meetingId}, CallID: ${callId})`;
  }

  getTelemetry() {
    return {
      activeSubscriptionsCount: this.activeCalendarSubscriptions.size,
      activeSubscriptions: Array.from(this.activeCalendarSubscriptions.values()),
      lastCalendarEventReceived: this.lastCalendarEventReceived || 'NONE_YET',
      lastTeamsMeetingDetected: this.lastTeamsMeetingDetected || 'NONE_YET',
      lastConsentRequested: this.lastConsentRequested || 'NONE_YET',
      lastConsentDecision: this.lastConsentDecision || 'NONE_YET',
      lastJoinRequested: this.lastJoinRequested || 'NONE_YET',
      lastSuccessfulBotJoin: this.lastSuccessfulBotJoin || 'NONE_YET'
    };
  }
}

export const calendarSubscriptionManager = new CalendarSubscriptionManager();

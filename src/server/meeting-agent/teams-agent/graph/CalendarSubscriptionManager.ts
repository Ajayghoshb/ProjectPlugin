/**
 * =========================================================================================
 * THINK IT AI MEETING ASSISTANT — USER-CENTRIC CALENDAR SUBSCRIPTION MANAGER
 * =========================================================================================
 * 
 * ARCHITECTURAL PURPOSE:
 * ----------------------
 * Manages user-centric Microsoft Graph Change Notifications for authenticated Think It users
 * on resource '/users/{userIdOrEmail}/events' using the Entra Application permission 'Calendars.Read'.
 * 
 * USER-CENTRIC MODEL:
 * -------------------
 * Subscribes ONLY to the calendar of an authenticated Think It user (User A).
 * Eliminates organization-wide tenant discovery (`GET /v1.0/users`), avoiding HTTP 403 Authorization_RequestDenied.
 */

import { realGraphClient } from './GraphClient';

export interface UserCalendarContext {
  userEmail: string;
  userObjectId?: string;
  tenantId?: string;
}

export interface CalendarSubscription {
  id: string;
  userId: string;
  userEmail: string;
  resource: string;
  changeType: string;
  clientState?: string;
  notificationUrl: string;
  expirationDateTime: string;
  ownerUserId?: string;
  ownerUserEmail?: string;
}

export class CalendarSubscriptionManager {
  private graphEndpoint: string = 'https://graph.microsoft.com/v1.0';
  private activeCalendarSubscriptions: Map<string, CalendarSubscription> = new Map();
  private processedMeetingIds: Set<string> = new Set();
  
  // Structured Observability Telemetry Timestamps
  private lastCalendarEventReceived: string | null = null;
  private lastTeamsMeetingDetected: string | null = null;
  private lastConsentRequested: string | null = null;
  private lastConsentDecision: string | null = null;
  private lastJoinRequested: string | null = null;
  private lastSuccessfulBotJoin: string | null = null;

  /**
   * Subscribes to the calendar of a specific authenticated Think It user (/users/{userIdentifier}/events).
   * Idempotent: Reconciles unexpired subscriptions before creating a new Graph subscription.
   */
  async subscribeUserCalendar(userContext: UserCalendarContext): Promise<{ success: boolean; subscription?: CalendarSubscription; error?: string }> {
    const rawEmail = userContext.userEmail;
    if (!rawEmail) {
      console.warn(`[CALENDAR_USER_SUBSCRIPTION] ⚠️ Missing userEmail in userContext.`);
      return { success: false, error: 'MISSING_USER_EMAIL' };
    }

    const normalizedEmail = rawEmail.toLowerCase().trim();
    const userIdentifier = userContext.userObjectId || encodeURIComponent(normalizedEmail);
    const resource = `/users/${userIdentifier}/events`;

    console.log(`[CALENDAR_USER_SUBSCRIPTION] userId=${userContext.userObjectId || 'NONE'} userEmail=${normalizedEmail}`);

    const token = await realGraphClient.getAppAccessToken();
    if (!token) {
      console.error('[CALENDAR_USER_SUBSCRIPTION] ❌ Missing Graph access token.');
      return { success: false, error: 'AUTHENTICATION_FAILED: Missing Graph access token' };
    }

    const notificationUrl = process.env.BOT_ENDPOINT || 'https://projectplugin-api.onrender.com/api/graph/notifications';
    const expirationDateTime = new Date(Date.now() + 4000 * 60 * 1000).toISOString();

    try {
      // Reconcile against existing active Graph subscriptions to prevent duplicate creation
      const existingRes = await fetch(`${this.graphEndpoint}/subscriptions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (existingRes.ok) {
        const existingData = await existingRes.json();
        for (const sub of (existingData.value || [])) {
          if (sub.resource && (sub.resource === resource || sub.resource.toLowerCase().includes(normalizedEmail))) {
            const subRecord: CalendarSubscription = {
              id: sub.id,
              userId: userContext.userObjectId || normalizedEmail,
              userEmail: normalizedEmail,
              resource: sub.resource,
              changeType: sub.changeType || 'created,updated',
              clientState: sub.clientState,
              notificationUrl: sub.notificationUrl || notificationUrl,
              expirationDateTime: sub.expirationDateTime,
              ownerUserId: userContext.userObjectId,
              ownerUserEmail: normalizedEmail
            };
            this.activeCalendarSubscriptions.set(sub.id, subRecord);
            console.log(`[CALENDAR_USER_SUBSCRIPTION_EXISTS] Active Graph calendar subscription already exists for '${normalizedEmail}' (${resource}) -> SubID: '${sub.id}'`);
            return { success: true, subscription: subRecord };
          }
        }
      }

      // Create new user-centric calendar subscription
      const payload = {
        changeType: 'created,updated',
        notificationUrl,
        resource,
        expirationDateTime,
        clientState: `thinkit-user-${normalizedEmail}`
      };

      console.log(`[CALENDAR_USER_SUBSCRIPTION] Issuing Graph POST /subscriptions for resource '${resource}'...`);

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
        console.error(`[CALENDAR_USER_SUBSCRIPTION] ❌ Failed to subscribe calendar for user '${normalizedEmail}' HTTP ${subRes.status}: ${errMsg}`);
        return { success: false, error: `GRAPH_API_ERROR [${subRes.status}]: ${errMsg}` };
      }

      const subData: any = await subRes.json();
      const subRecord: CalendarSubscription = {
        id: subData.id,
        userId: userContext.userObjectId || normalizedEmail,
        userEmail: normalizedEmail,
        resource: subData.resource,
        changeType: subData.changeType,
        clientState: subData.clientState,
        notificationUrl: subData.notificationUrl,
        expirationDateTime: subData.expirationDateTime,
        ownerUserId: userContext.userObjectId,
        ownerUserEmail: normalizedEmail
      };

      this.activeCalendarSubscriptions.set(subData.id, subRecord);
      console.log(`[CALENDAR_USER_SUBSCRIPTION_CREATED] ✅ Calendar Subscription created for user '${normalizedEmail}'! SubID: '${subData.id}'`);
      return { success: true, subscription: subRecord };
    } catch (err: any) {
      console.error('[CALENDAR_USER_SUBSCRIPTION] ❌ Exception creating user calendar subscription:', err.message || err);
      return { success: false, error: err.message || 'Exception' };
    }
  }

  /**
   * DEPRECATED: Organization-wide tenant user discovery.
   * Log warning and instruct callers to use subscribeUserCalendar().
   */
  async subscribeOrgUserCalendars(targetUserEmail?: string): Promise<{ success: boolean; activeSubscriptionsCount: number; subscriptions: CalendarSubscription[]; errors: string[] }> {
    console.warn(`[CALENDAR_ORG_DISCOVERY_DISABLED] Organization-wide user discovery (GET /v1.0/users) is disabled in the user-centric architecture.`);
    if (targetUserEmail) {
      const res = await this.subscribeUserCalendar({ userEmail: targetUserEmail });
      return {
        success: res.success,
        activeSubscriptionsCount: this.activeCalendarSubscriptions.size,
        subscriptions: res.subscription ? [res.subscription] : [],
        errors: res.error ? [res.error] : []
      };
    }
    return {
      success: false,
      activeSubscriptionsCount: this.activeCalendarSubscriptions.size,
      subscriptions: Array.from(this.activeCalendarSubscriptions.values()),
      errors: ['DISABLED: Organization-wide user discovery is disabled. Use subscribeUserCalendar() with an authenticated user context.']
    };
  }

  /**
   * Inspects incoming Calendar Event change notification payloads, resolves event details from Graph,
   * extracts meeting metadata and owner information.
   */
  async processCalendarEventChangeNotification(notification: any): Promise<{ isTeamsMeeting: boolean; meetingDetails?: any }> {
    const resource = notification.resource;
    const subscriptionId = notification.subscriptionId;
    this.lastCalendarEventReceived = new Date().toISOString();
    console.log(`[CALENDAR_EVENT_NOTIFICATION] Received calendar change notification for resource '${resource}' (SubID: '${subscriptionId}')`);

    const knownSub = subscriptionId ? this.activeCalendarSubscriptions.get(subscriptionId) : undefined;
    const ownerUserId = knownSub?.ownerUserId;
    const ownerUserEmail = knownSub?.ownerUserEmail;

    const token = await realGraphClient.getAppAccessToken();
    if (!token) return { isTeamsMeeting: false };

    try {
      // 1. Fetch full event details from Microsoft Graph API
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
      const organizerEmail = eventData.organizer?.emailAddress?.address || ownerUserEmail || 'organizer@company.com';
      const subject = eventData.subject || 'Teams Scheduled Meeting';
      const meetingId = eventData.id || `mtg-${Date.now()}`;

      // 2. Reject non-Teams regular calendar entries
      if (!isOnlineMeeting) {
        console.log(`[CALENDAR_EVENT_NOTIFICATION] Event '${subject}' is not a Teams online meeting. Skipping.`);
        return { isTeamsMeeting: false };
      }

      console.log(`[TEAMS_MEETING_RESOLVED] ✅ Teams Meeting Detected! Subject: '${subject}', Organizer: '${organizerEmail}', JoinURL: '${joinUrl}'`);
      this.lastTeamsMeetingDetected = `${new Date().toISOString()} (${subject})`;

      // 3. Prevent duplicate consent requests for the same meeting ID
      if (this.processedMeetingIds.has(meetingId)) {
        console.log(`[TEAMS_MEETING_RESOLVED] Consent request already sent for meeting '${meetingId}'. Skipping duplicate.`);
        return {
          isTeamsMeeting: true,
          meetingDetails: { meetingId, subject, organizerEmail, joinUrl, ownerUserId, ownerUserEmail: ownerUserEmail || organizerEmail, duplicate: true }
        };
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
          ownerUserId,
          ownerUserEmail: ownerUserEmail || organizerEmail,
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

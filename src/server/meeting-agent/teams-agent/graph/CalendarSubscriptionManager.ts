/**
 * =========================================================================================
 * THINK IT AI MEETING ASSISTANT — MICROSOFT GRAPH CALENDAR SUBSCRIPTION MANAGER
 * =========================================================================================
 * 
 * ARCHITECTURAL PURPOSE:
 * ----------------------
 * Microsoft Graph API rejects global tenant-wide wildcard subscriptions on '/communications/onlineMeetings'
 * with HTTP 400 'Unsupported workload'.
 * 
 * To achieve automatic organization-level Teams meeting detection without requiring users to manually
 * call or add the bot, this class manages Microsoft Graph Change Notifications for user calendar events
 * on '/users/{userId}/events' using the Entra Application permission 'Calendars.Read'.
 * 
 * WORKFLOW & RECONCILIATION:
 * --------------------------
 * 1. Discover organization user mailboxes via Microsoft Graph API 'GET /v1.0/users'.
 * 2. Query existing active Graph subscriptions via 'GET /v1.0/subscriptions' to prevent duplicate subscriptions.
 * 3. Reconcile existing subscriptions or create a new Outlook event subscription ('POST /v1.0/subscriptions')
 *    for resource '/users/{userId}/events'.
 * 4. Receive change notification webhooks at 'POST /api/graph/notifications'.
 * 5. Fetch event details from Graph to verify 'isOnlineMeeting === true'.
 * 6. Extract 'onlineMeetingId', 'joinWebUrl', 'organizerEmail', 'subject', and 'scheduledStart'.
 * 7. Send the Adaptive Consent Card ("Think It wants to join this meeting") to the meeting organizer.
 * 8. Track idempotent meeting state transitions and prevent duplicate notifications.
 */

import { realGraphClient } from './GraphClient';

/**
 * Interface representing an active Microsoft Graph Calendar Subscription
 */
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
  
  // Structured Observability Telemetry Timestamps
  private lastCalendarEventReceived: string | null = null;
  private lastTeamsMeetingDetected: string | null = null;
  private lastConsentRequested: string | null = null;
  private lastConsentDecision: string | null = null;
  private lastJoinRequested: string | null = null;
  private lastSuccessfulBotJoin: string | null = null;

  /**
   * Discovers organization users, reconciles existing subscriptions, and creates missing Graph Calendar Subscriptions (/users/{userId}/events).
   * Expiration is set to 4000 minutes (~66 hours) to satisfy Graph's 4230-minute limit.
   */
  async subscribeOrgUserCalendars(): Promise<{ success: boolean; activeSubscriptionsCount: number; subscriptions: CalendarSubscription[]; errors: string[] }> {
    // 1. Acquire Microsoft Entra ID Application Access Token via client-credentials grant
    const token = await realGraphClient.getAppAccessToken();
    if (!token) {
      console.error('[CALENDAR_SUBSCRIPTION] ❌ Missing Graph access token.');
      return { success: false, activeSubscriptionsCount: 0, subscriptions: [], errors: ['AUTHENTICATION_FAILED: Missing Graph access token'] };
    }

    const notificationUrl = process.env.BOT_ENDPOINT || 'https://projectplugin-api.onrender.com/api/graph/notifications';
    // Maximum allowed expiration for Outlook /users/{id}/events is 4230 minutes (~70.5 hours)
    const expirationDateTime = new Date(Date.now() + 4000 * 60 * 1000).toISOString();
    const errors: string[] = [];
    const createdSubs: CalendarSubscription[] = [];

    try {
      // 2. Fetch existing Graph subscriptions to prevent duplicate subscription creation
      console.log(`[CALENDAR_SUBSCRIPTION] Reconciling existing Graph subscriptions via GET /subscriptions...`);
      const existingSubsMap = new Map<string, any>();
      try {
        const existingRes = await fetch(`${this.graphEndpoint}/subscriptions`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (existingRes.ok) {
          const existingData = await existingRes.json();
          for (const sub of (existingData.value || [])) {
            if (sub.resource) {
              existingSubsMap.set(sub.resource, sub);
            }
          }
          console.log(`[CALENDAR_SUBSCRIPTION] Found ${existingSubsMap.size} existing active Graph subscriptions.`);
        }
      } catch (err: any) {
        console.warn(`[CALENDAR_SUBSCRIPTION] ⚠️ Could not fetch existing subscriptions for reconciliation:`, err.message || err);
      }

      // 3. Fetch organization user mailboxes using Microsoft Graph API
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

      // 4. Reconcile or create a Graph subscription for each user's calendar events (/users/{userId}/events)
      for (const user of users) {
        const userId = user.id;
        const userEmail = user.mail || user.userPrincipalName;
        const resource = `/users/${userId}/events`;

        // Check if an unexpired subscription already exists for this exact resource
        const existingSub = existingSubsMap.get(resource);
        if (existingSub) {
          const subRecord: CalendarSubscription = {
            id: existingSub.id,
            userId,
            userEmail,
            resource,
            changeType: existingSub.changeType || 'created,updated',
            clientState: existingSub.clientState,
            notificationUrl: existingSub.notificationUrl || notificationUrl,
            expirationDateTime: existingSub.expirationDateTime
          };
          this.activeCalendarSubscriptions.set(existingSub.id, subRecord);
          createdSubs.push(subRecord);
          console.log(`[CALENDAR_SUBSCRIPTION] ℹ️ Existing active subscription found for '${userEmail}' (${resource}) -> SubID: '${existingSub.id}'. Reconciled.`);
          continue;
        }

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
   * Inspects incoming Calendar Event change notification payloads, resolves event details from
   * Microsoft Graph, verifies whether the event is an online Teams meeting, and extracts meeting metadata.
   */
  async processCalendarEventChangeNotification(notification: any): Promise<{ isTeamsMeeting: boolean; meetingDetails?: any }> {
    const resource = notification.resource;
    this.lastCalendarEventReceived = new Date().toISOString();
    console.log(`[CALENDAR_EVENT_NOTIFICATION] Received calendar change notification for resource '${resource}'`);

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
      const organizerEmail = eventData.organizer?.emailAddress?.address || 'organizer@company.com';
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

  // Safe Telemetry Logging Helpers
  recordConsentDecision(meetingId: string, decision: string) {
    this.lastConsentDecision = `${new Date().toISOString()} (Meeting: ${meetingId}, Decision: ${decision})`;
  }

  recordJoinRequest(meetingId: string) {
    this.lastJoinRequested = `${new Date().toISOString()} (Meeting: ${meetingId})`;
  }

  recordSuccessfulBotJoin(meetingId: string, callId: string) {
    this.lastSuccessfulBotJoin = `${new Date().toISOString()} (Meeting: ${meetingId}, CallID: ${callId})`;
  }

  /**
   * Returns safe telemetry status object for GET /health/teams diagnostic endpoint
   */
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

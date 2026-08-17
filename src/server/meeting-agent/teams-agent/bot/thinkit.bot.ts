/**
 * =========================================================================================
 * THINK IT AI MEETING ASSISTANT — TEAMS BOT ACTIVITY PROCESSOR
 * =========================================================================================
 * 
 * ARCHITECTURAL PURPOSE:
 * ----------------------
 * Processes incoming Microsoft Teams Bot Framework activities and Adaptive Card action submits.
 * 
 * WORKFLOW & DECISION ROUTING:
 * ----------------------------
 * 1. Organizer Consent Card Actions:
 *    - 'ALLOW_JOIN': Logs [CONSENT_GRANTED], triggers Graph call join ('POST /v1.0/communications/calls').
 *    - 'DECLINE_JOIN': Logs [CONSENT_DECLINED], does NOT join or record call.
 * 
 * 2. Meeting Ingress Events ('meeting.started' / 'onlineMeeting.started'):
 *    - Resolves meeting details, subject, organizer email, and real Teams join URL.
 *    - Delivers the "Think It wants to join this meeting" Adaptive Card to the organizer proactively.
 */

import { IBotAdapter, realTeamsBotAdapter } from './bot.adapter';
import { teamsEventPublisher } from '../events/teams.events';
import { meetingAgentOrchestrator } from '../../orchestrator/agent.orchestrator';
import { buildJoinRequestCard } from '../cards/join.request.card';
import { realGraphClient } from '../graph/GraphClient';

export class ThinkItBot {
  private adapter: IBotAdapter;

  constructor(adapter?: IBotAdapter) {
    this.adapter = adapter || realTeamsBotAdapter;
  }

  async handleUserMessage(conversationId: string, userEmail: string, messageText: string): Promise<string> {
    console.log(`[ThinkIt Bot] User message received from '${userEmail}': "${messageText}"`);

    teamsEventPublisher.publishTeamsEvent({
      eventType: 'USER_MESSAGE',
      userEmail,
      text: messageText
    });

    if (messageText.toLowerCase().includes("meetings") || messageText.toLowerCase().includes("schedule")) {
      return "📅 Think It AI Meeting Assistant is active and monitoring your scheduled Teams meetings.";
    }

    return `🤖 **Think It AI Assistant**: Ready to capture meeting intelligence upon organizer consent.`;
  }

  /**
   * Main entry point for processing incoming Bot Framework activities and Adaptive Card submits.
   */
  async processTeamsActivity(activity: any): Promise<any> {
    // 0. Persist ConversationReference if incoming activity contains Teams conversation details
    if (activity.from || activity.conversation) {
      await this.adapter.saveConversationReference(activity);
    }

    // Safe Ingress Diagnostic Event Telemetry — Excludes tokens and personal content
    console.log(`[REAL_TEAMS_EVENT_RECEIVED]`, JSON.stringify({
      eventType: activity.eventType || activity.type || 'unknown',
      activityType: activity.type || 'message',
      source: 'Microsoft Teams / Azure Bot Service',
      meetingContextPresent: !!(activity.meetingId || activity.id || activity.value?.meetingId),
      meetingIdPresent: !!(activity.meetingId || activity.id || activity.value?.meetingId),
      conversationIdPresent: !!activity.conversation?.id,
      organizerPresent: !!(activity.from?.email || activity.from?.name),
      timestamp: new Date().toISOString()
    }));

    // A. Handle Adaptive Card Action Submits (User Consent Allow / Decline)
    const cardData = activity.value || (activity.text ? tryParseJson(activity.text) : null);
    if (cardData && (cardData.action === 'ALLOW_JOIN' || cardData.action === 'ALLOW' || cardData.action === 'DECLINE_JOIN' || cardData.action === 'DECLINE')) {
      const meetingId = cardData.meetingId || 'm-default';
      const organizer = cardData.organizerEmail || activity.from?.email || 'organizer@company.com';
      const ownerUserId = cardData.ownerUserId || activity.ownerUserId;
      const ownerUserEmail = cardData.ownerUserEmail || activity.ownerUserEmail;
      const joinWebUrl = cardData.joinUrl || activity.joinUrl || meetingId;
      const correlationId = cardData.correlationId || activity.correlationId || `TI-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      if (cardData.action === 'ALLOW_JOIN' || cardData.action === 'ALLOW') {
        console.log(`[ALLOW_JOIN] correlationId=${correlationId} ownerUserEmail=${ownerUserEmail || organizer} meetingId=${meetingId}`);

        if (!joinWebUrl || typeof joinWebUrl !== 'string' || !joinWebUrl.startsWith('http') || joinWebUrl.includes('m-default')) {
          console.warn(`[MEETING_JOIN_URL_UNAVAILABLE] correlationId=${correlationId} ownerUserEmail=${ownerUserEmail || organizer} meetingId=${meetingId} reason=MISSING_OR_INVALID_URL`);
          return {
            type: 'message',
            text: '⚠️ **Think It Join Failed**: MEETING_JOIN_URL_UNAVAILABLE - A valid Microsoft Teams meeting join URL is required.'
          };
        }

        console.log(`[GRAPH_JOIN_REQUEST] correlationId=${correlationId} meetingId=${meetingId} organizer=${organizer}`);

        // Execute real Graph Communications Call Join API (POST /v1.0/communications/calls)
        const joinResult = await realGraphClient.joinCall({
          joinWebUrl: joinWebUrl,
          organizerId: organizer
        });

        if (joinResult.success) {
          console.log(`[GRAPH_JOIN_ACCEPTED] correlationId=${correlationId} callId=${joinResult.callId} httpStatus=${joinResult.httpStatus || 201}`);
          await meetingAgentOrchestrator.startMeetingAgent(meetingId, 'Teams Meeting', organizer, ownerUserId, ownerUserEmail);

          return {
            type: 'message',
            text: '✅ **Think It Approved**: Joining Teams meeting call and starting AI meeting intelligence capture.'
          };
        } else {
          console.error(`[GRAPH_JOIN_FAILED] correlationId=${correlationId} httpStatus=${joinResult.httpStatus || 400} error=${joinResult.error}`);
          return {
            type: 'message',
            text: `⚠️ **Think It Join Failed**: ${joinResult.error}`
          };
        }
      } else {
        console.log(`[CONSENT_DECLINED] correlationId=${correlationId} ownerUserEmail=${ownerUserEmail || organizer} meetingId=${meetingId}`);
        return {
          type: 'message',
          text: '❌ **Think It Declined**: Think It will not join or record this meeting.'
        };
      }
    }

    // B. Handle Meeting Detection Events
    if (activity.type === 'meeting.started' || activity.type === 'onlineMeeting.started' || activity.type === 'callStarted') {
      const meetingId = activity.meetingId || activity.id || `m-${Date.now()}`;
      const title = activity.title || activity.subject || 'Microsoft Teams Live Meeting';
      const organizer = activity.from?.email || activity.from?.name || 'organizer@company.com';
      const ownerUserId = activity.ownerUserId;
      const ownerUserEmail = activity.ownerUserEmail || organizer;
      const joinUrl = activity.joinUrl || activity.joinWebUrl || meetingId;
      const correlationId = activity.correlationId || `TI-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      console.log(`[MEETING_DETECTED] correlationId=${correlationId} meetingId=${meetingId} title="${title}" organizer=${organizer} ownerUserEmail=${ownerUserEmail}`);

      // Build Adaptive Consent Card with real joinUrl and owner identity
      const card = buildJoinRequestCard(meetingId, title, organizer, joinUrl, ownerUserId, ownerUserEmail, correlationId);
      
      // Proactively send card to Think It owner (User A) via Real Bot Adapter
      const proactiveResult = await this.adapter.sendCardProactive(ownerUserEmail, card);

      if (proactiveResult.success) {
        console.log(`[CONSENT_SENT] correlationId=${correlationId} ownerUserEmail=${ownerUserEmail} meetingId=${meetingId}`);
      } else {
        console.warn(`[THINKIT_PROACTIVE_MESSAGE_SKIPPED] correlationId=${correlationId} reason=${proactiveResult.reason || proactiveResult.error} ownerUserEmail=${ownerUserEmail}`);
      }

      return {
        status: proactiveResult.success ? 'CONSENT_REQUESTED' : 'CONSENT_SKIPPED',
        meetingId,
        title,
        organizer,
        ownerUserEmail,
        correlationId,
        adaptiveCardSent: proactiveResult.success,
        reason: proactiveResult.reason || proactiveResult.error
      };
    }

    // C. User Messages
    if (activity.type === 'message') {
      const reply = await this.handleUserMessage(
        activity.conversation?.id || 'conv-default',
        activity.from?.email || 'user@company.com',
        activity.text || ''
      );
      return { type: 'message', text: reply };
    }

    return await this.adapter.handleActivity(activity);
  }
}

function tryParseJson(text: string): any {
  try { return JSON.parse(text); } catch { return null; }
}

export const thinkItBot = new ThinkItBot();

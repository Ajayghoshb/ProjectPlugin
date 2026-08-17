# Microsoft Teams Live End-to-End Verification Runbook

## Overview
This runbook provides the exact 28-step operational procedure for validating the Think It AI Meeting Assistant in a live Microsoft Teams tenant with real Microsoft Entra ID authentication and Microsoft Graph Cloud Communications integration.

---

## Azure & Entra Prerequisites

1. **Entra App Registration**:
   - Application (client) ID: `8ec8a471-4328-4e8f-8c69-e64abdf2725e`
   - Application ID URI: `api://project-plugin.vercel.app/8ec8a471-4328-4e8f-8c69-e64abdf2725e`
2. **Authorized Clients**:
   - `1fec8e78-bce4-4aaf-ab62-54513837260f` (Teams Desktop)
   - `5e3ce6c0-2b1f-4285-8d4b-75ee78787346` (Teams Web)
   - Scope: `access_as_user`
3. **Graph Permissions**:
   - **Delegated**: `User.Read`, `Calendars.Read`
   - **Application (Admin Consented)**: `Calls.JoinGroupCall.All`, `Calls.AccessMedia.All`, `OnlineMeetingTranscript.Read.All`

---

## Live Verification Procedure

| Step | Action | Expected System & Log Output |
|---|---|---|
| 1 | Package Teams Manifest | `npm run package:teams` generates `thinkit-teams-app.zip` |
| 2 | Upload App to Teams | User A side-loads `thinkit-teams-app.zip` in Teams client |
| 3 | Open Personal Tab | User A opens Think It tab in Microsoft Teams |
| 4 | Activity Handler | Backend receives Bot Framework activity at `POST /api/messages` |
| 5 | Conversation Reference | `TeamsConversationReference` saved in database for User A |
| 6 | SSO Token Acquisition | Frontend calls `@microsoft/teams-js` `getAuthToken()` |
| 7 | OBO Token Exchange | Backend exchanges `idToken` at `POST /api/teams/auth/token` |
| 8 | Identity Binding | Log output: `[TEAMS_SSO_SUCCESS] tenant=<tid> user=<oid> email=<email>` |
| 9 | User Context Binding | `req.userContext` populated with `oid`, `tid`, and `userEmail` |
| 10 | Calendar Trigger | Frontend triggers `POST /api/teams/subscribe-calendars` |
| 11 | Graph Subscription | Subscribes resource `/users/{userObjectId}/events` |
| 12 | Subscription Log | Log output: `[CALENDAR_USER_SUBSCRIPTION_CREATED]` |
| 13 | Schedule Meeting | User A schedules Teams meeting with Users B and C |
| 14 | Webhook Delivery | Graph sends notification to `POST /api/graph/notifications` |
| 15 | Meeting Detection | Log output: `[TEAMS_MEETING_RESOLVED]` with `joinWebUrl` |
| 16 | Owner Assignment | Meeting record assigned `ownerUserId = User A oid` |
| 17 | Proactive Card Send | Adaptive Consent Card sent to User A (`ownerUserEmail`) |
| 18 | Card Delivery Log | Log output: `[CONSENT_REQUESTED]` to User A |
| 19 | Non-User Isolation | Users B and C do NOT receive consent prompt |
| 20 | User Approval | User A clicks **"Allow Think It to Join"** (`ALLOW_JOIN`) |
| 21 | Join URL Check | `GraphClient` validates `joinWebUrl` (HTTP Teams URL) |
| 22 | Graph Call Join | Backend posts `POST /v1.0/communications/calls` |
| 23 | Graph Join Acceptance | Log output: `[GRAPH_JOIN_ACCEPTED]` with `callId` |
| 24 | Calling Callback | Callback received at `POST /api/calling` |
| 25 | Call Established | Log output: `[CALL_ESTABLISHED]` (bot visible in roster) |
| 26 | Speech & Transcript | Participants speak; transcript retrieved from Graph |
| 27 | AI Report Generation | Executive Summary & MOM created under User A ownership |
| 28 | Private Data Access | User A can view report; User B / C access rejected (403) |

---

## Diagnostic Log Search Reference

- `[TEAMS_SSO_SUCCESS]` — Verified Entra ID SSO OBO exchange.
- `[CALENDAR_USER_SUBSCRIPTION_CREATED]` — Graph user-centric calendar subscription active.
- `[CALENDAR_USER_SUBSCRIPTION_REJECTED]` — Blocked unauthorized cross-user subscription attempt.
- `[MEETING_JOIN_URL_UNAVAILABLE]` — Missing or invalid Teams join URL.
- `[GRAPH_JOIN_REQUEST]` — Submitting call join payload to Graph Communications API.
- `[GRAPH_JOIN_ACCEPTED]` — Real Graph API accepted call join request.
- `[GRAPH_JOIN_FAILED]` — Real Graph API error response details.
- `[CALL_ESTABLISHED]` — Calling webhook confirmed call established.
- `[OWNER_AUTHORIZATION_DENIED]` — Denied cross-user meeting intelligence access (IDOR protection).

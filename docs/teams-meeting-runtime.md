# Microsoft Teams Meeting Runtime Architecture (`docs/teams-meeting-runtime.md`)

> **Application:** Think It - Meeting Memory AI & Enterprise Organizational Intelligence Platform  
> **Module:** `src/teams/meeting-runtime/`

---

## 1. Meeting Runtime Flow Architecture

```
Microsoft Teams Active Meeting
             │
             ▼
 [ TeamsMeetingContextService ] (Captures Meeting ID, Tenant ID, User ID, Organizer ID, Subject)
             │
             ▼
   [ MeetingEventProcessor ] (Processes MEETING_STARTED, PARTICIPANT_JOINED, TRANSCRIPT_READY)
             │
             ▼
   [ ParticipantTracker ] (Captures real-time participant roster timelines)
             │
             ▼
  [ TranscriptSyncService ] (Fetches Graph transcripts & dialogue lines)
             │
             ▼
   [ RecordingSyncService ] (Detects SharePoint recording MP4 references)
             │
             ▼
[ MeetingRuntimeSyncService ] ──► [ Ingests into AI Processing Queue ] ──► [ Ingests into Knowledge Platform ]
```

---

## 2. Meeting Lifecycle State Machine

```
[ CREATED ] ──► [ SCHEDULED ] ──► [ STARTED ] ──► [ JOINED ] ──► [ ENDED ] ──► [ TRANSCRIPT_AVAILABLE ] ──► [ RECORDING_AVAILABLE ]
```

---

## 3. Registered Meeting Runtime API Endpoints (`/api/teams/meeting/*`)

- `POST /api/teams/meeting/context`: Receives runtime meeting context from Teams SDK.
- `POST /api/teams/meeting/events`: Ingests meeting lifecycle events (`MEETING_STARTED`, `PARTICIPANT_JOINED`, `TRANSCRIPT_READY`).
- `GET /api/teams/meeting/:id/context`: Returns runtime metadata for a target meeting.
- `GET /api/teams/meeting/:id/participants`: Returns participant roster timeline.
- `POST /api/teams/meeting/:id/sync`: Triggers manual runtime synchronization.
- `GET /api/teams/meeting/health`: Returns meeting runtime health status.

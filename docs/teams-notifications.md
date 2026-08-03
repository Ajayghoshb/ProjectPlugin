# Microsoft Teams Collaboration & Notification Layer (`docs/teams-notifications.md`)

> **Application:** Think It - Meeting Memory AI & Enterprise Organizational Intelligence Platform  
> **Module:** `src/teams/notifications/`

---

## 1. Notification Event Pipeline

```
[ AI Processing Finished ]
            │
            ▼
[ NotificationEventProcessor ] (Transforms MEETING_COMPLETED into Adaptive Card payloads)
            │
            ▼
 [ MeetingSummaryCard Builder ] (Constructs v1.5 Adaptive Card JSON)
            │
            ▼
 [ TeamsNotificationService ] ──► [ TeamsBotService Proactive Messaging ] ──► [ Delivered to Microsoft Teams Users ]
```

---

## 2. Adaptive Card Schema Example (v1.5)

```json
{
  "type": "AdaptiveCard",
  "version": "1.5",
  "body": [
    { "type": "TextBlock", "text": "🎉 Meeting Intelligence Ready", "weight": "Bolder", "color": "Accent" },
    { "type": "TextBlock", "text": "Project Alpha Release Discussion", "weight": "Bolder", "size": "Large" },
    { "type": "FactSet", "facts": [{ "title": "Action Items:", "value": "2 Tasks" }] }
  ],
  "actions": [
    { "type": "Action.OpenUrl", "title": "Open Collection Workspace", "url": "https://localhost:3000/#/collection?inTeams=true" }
  ]
}
```

---

## 3. Registered Notification API Endpoints (`/api/teams/notifications/*`)

- `POST /api/teams/notifications/send`: Sends an Adaptive Card proactive message to a user or meeting chat.
- `POST /api/teams/notifications/process-event`: Triggers notification processing for an AI completion event.
- `GET /api/teams/notifications/preferences/:userId`: Returns user notification preferences.
- `PUT /api/teams/notifications/preferences/:userId`: Updates user notification preferences.
- `GET /api/teams/notifications/health`: Returns notification service health status.

export function buildJoinRequestCard(meetingId: string, title: string, organizerEmail: string): any {
  return {
    "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
    "type": "AdaptiveCard",
    "version": "1.4",
    "body": [
      {
        "type": "TextBlock",
        "text": "🤖 Think It AI Meeting Agent Join Request",
        "weight": "Bolder",
        "size": "Medium",
        "color": "Accent"
      },
      {
        "type": "TextBlock",
        "text": `Think It would like to join **${title}** to record, synthesize executive MOMs, and track action items.`,
        "wrap": true
      },
      {
        "type": "FactSet",
        "facts": [
          { "title": "Organizer:", "value": organizerEmail },
          { "title": "Meeting ID:", "value": meetingId },
          { "title": "AI Engine:", "value": "Meta Llama 3.3 70B & NVIDIA Riva" }
        ]
      }
    ],
    "actions": [
      {
        "type": "Action.Submit",
        "title": "✅ ALLOW",
        "style": "positive",
        "data": { "action": "ALLOW", "meetingId": meetingId, "organizerEmail": organizerEmail }
      },
      {
        "type": "Action.Submit",
        "title": "❌ DECLINE",
        "style": "destructive",
        "data": { "action": "DECLINE", "meetingId": meetingId, "organizerEmail": organizerEmail }
      }
    ]
  };
}

export function buildNotificationCard(title: string, summary: string, actionItemsCount: number): any {
  return {
    "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
    "type": "AdaptiveCard",
    "version": "1.4",
    "body": [
      {
        "type": "TextBlock",
        "text": `✨ Executive Summary Ready: ${title}`,
        "weight": "Bolder",
        "size": "Medium"
      },
      {
        "type": "TextBlock",
        "text": summary,
        "wrap": true
      },
      {
        "type": "TextBlock",
        "text": `📌 **${actionItemsCount} Action Items** generated and synced to Jira.`,
        "size": "Small",
        "color": "Good"
      }
    ]
  };
}

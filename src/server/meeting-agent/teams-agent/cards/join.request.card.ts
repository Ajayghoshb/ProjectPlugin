export function buildJoinRequestCard(
  meetingId: string,
  title: string,
  organizerEmail: string,
  joinUrl?: string,
  ownerUserId?: string,
  ownerUserEmail?: string,
  correlationId?: string
): any {
  return {
    "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
    "type": "AdaptiveCard",
    "version": "1.4",
    "body": [
      {
        "type": "TextBlock",
        "text": "🤖 Think It wants to join this meeting",
        "weight": "Bolder",
        "size": "Large",
        "color": "Accent"
      },
      {
        "type": "TextBlock",
        "text": `Think It can capture the meeting conversation for **${title}** and generate:`,
        "wrap": true
      },
      {
        "type": "TextBlock",
        "text": "• Transcript\n• Executive Summary\n• Minutes of Meeting (MOM)\n• Key Decisions\n• Action Items\n• Important Points & Risks",
        "wrap": true,
        "spacing": "Medium"
      },
      {
        "type": "FactSet",
        "facts": [
          { "title": "Organizer:", "value": organizerEmail },
          { "title": "Meeting ID:", "value": meetingId }
        ]
      }
    ],
    "actions": [
      {
        "type": "Action.Submit",
        "title": "Allow Think It to Join",
        "style": "positive",
        "data": {
          "action": "ALLOW_JOIN",
          "meetingId": meetingId,
          "organizerEmail": organizerEmail,
          "joinUrl": joinUrl || meetingId,
          "ownerUserId": ownerUserId,
          "ownerUserEmail": ownerUserEmail,
          "correlationId": correlationId
        }
      },
      {
        "type": "Action.Submit",
        "title": "Decline",
        "style": "destructive",
        "data": {
          "action": "DECLINE_JOIN",
          "meetingId": meetingId,
          "organizerEmail": organizerEmail,
          "ownerUserId": ownerUserId,
          "ownerUserEmail": ownerUserEmail,
          "correlationId": correlationId
        }
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
        "text": `📌 **${actionItemsCount} Action Items** generated and saved.`,
        "size": "Small",
        "color": "Good"
      }
    ]
  };
}

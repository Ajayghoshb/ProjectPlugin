export function buildJoinApprovedCard(meetingTitle: string, approverEmail: string): any {
  return {
    "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
    "type": "AdaptiveCard",
    "version": "1.4",
    "body": [
      {
        "type": "TextBlock",
        "text": "✅ Think It AI Meeting Agent Approved",
        "weight": "Bolder",
        "size": "Medium",
        "color": "Good"
      },
      {
        "type": "TextBlock",
        "text": `Approved by **${approverEmail}**. Think It has joined **${meetingTitle}** and is actively recording meeting intelligence.`,
        "wrap": true
      }
    ]
  };
}

export function buildJoinDeclinedCard(meetingTitle: string, approverEmail: string): any {
  return {
    "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
    "type": "AdaptiveCard",
    "version": "1.4",
    "body": [
      {
        "type": "TextBlock",
        "text": "❌ Think It AI Meeting Agent Declined",
        "weight": "Bolder",
        "size": "Medium",
        "color": "Attention"
      },
      {
        "type": "TextBlock",
        "text": `Declined by **${approverEmail}**. Think It will not join **${meetingTitle}**.`,
        "wrap": true
      }
    ]
  };
}

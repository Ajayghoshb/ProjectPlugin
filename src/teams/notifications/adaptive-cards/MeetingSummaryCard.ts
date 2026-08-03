import { AdaptiveCardSchema } from '../models/notification.models';

export class MeetingSummaryCard {
  public static buildCard(meetingTitle: string, date: string, executiveSummary: string, actionCount: number, decisionCount: number): AdaptiveCardSchema {
    return {
      type: 'AdaptiveCard',
      version: '1.5',
      body: [
        {
          type: 'TextBlock',
          text: '🎉 Meeting Intelligence Ready',
          weight: 'Bolder',
          size: 'Medium',
          color: 'Accent'
        },
        {
          type: 'TextBlock',
          text: meetingTitle,
          weight: 'Bolder',
          size: 'Large',
          wrap: true
        },
        {
          type: 'TextBlock',
          text: `Date: ${date}`,
          isSubtle: true,
          size: 'Small'
        },
        {
          type: 'TextBlock',
          text: executiveSummary,
          wrap: true
        },
        {
          type: 'FactSet',
          facts: [
            { title: 'Action Items:', value: `${actionCount} Tasks` },
            { title: 'Decisions Agreed:', value: `${decisionCount} Key Decisions` }
          ]
        }
      ],
      actions: [
        {
          type: 'Action.OpenUrl',
          title: 'Open Collection Workspace',
          url: 'https://localhost:3000/#/collection?inTeams=true'
        }
      ]
    };
  }
}

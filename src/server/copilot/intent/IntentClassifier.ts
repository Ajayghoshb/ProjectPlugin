import { CopilotIntentType } from '../models/copilot.models';

export class IntentClassifier {
  public static classify(query: string): CopilotIntentType {
    const q = query.toLowerCase();

    if (q.includes('decision') || q.includes('decided') || q.includes('approved')) {
      return 'SEARCH_DECISION';
    }
    if (q.includes('action') || q.includes('task') || q.includes('assigned') || q.includes('todo')) {
      return 'SEARCH_ACTION_ITEM';
    }
    if (q.includes('risk') || q.includes('issue') || q.includes('concern')) {
      return 'SEARCH_RISK';
    }
    if (q.includes('project') || q.includes('release')) {
      return 'SEARCH_PROJECT';
    }
    if (q.includes('summarize') || q.includes('summary') || q.includes('overview')) {
      return 'SUMMARY_REQUEST';
    }

    return 'SEARCH_MEETING';
  }
}

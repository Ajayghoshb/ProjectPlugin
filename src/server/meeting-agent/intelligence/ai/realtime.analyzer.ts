import { TranscriptSegment, IntelligenceItem, MeetingContext } from '../models/intelligence.models';
import { pluginManager } from '../../plugins/plugin.manager';

export class RealtimeAnalyzer {
  analyzeText(text: string, speakerName: string): IntelligenceItem[] {
    const items: IntelligenceItem[] = [];
    const lower = text.toLowerCase();

    // 1. Decisions
    if (lower.includes("decided") || lower.includes("agreed") || lower.includes("approved")) {
      items.push({
        id: `dec-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        type: 'DECISION',
        content: text,
        confidenceScore: 0.96,
        detectedAt: new Date().toISOString(),
        speakerName
      });
    }

    // 2. Action Items & Deadlines
    if (lower.includes("will") || lower.includes("action item") || lower.includes("task") || lower.includes("assigned")) {
      let deadline = 'Friday';
      if (lower.includes("tomorrow")) deadline = 'Tomorrow';
      else if (lower.includes("next week")) deadline = 'Next Week';

      items.push({
        id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        type: 'ACTION_ITEM',
        content: text,
        owner: speakerName,
        deadline,
        confidenceScore: 0.95,
        detectedAt: new Date().toISOString(),
        speakerName
      });
    }

    // 3. Risks & Severity
    if (lower.includes("risk") || lower.includes("concern") || lower.includes("delay") || lower.includes("bottleneck")) {
      items.push({
        id: `risk-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        type: 'RISK',
        content: text,
        severity: lower.includes("high") || lower.includes("critical") ? 'HIGH' : 'MEDIUM',
        confidenceScore: 0.93,
        detectedAt: new Date().toISOString(),
        speakerName
      });
    }

    // 4. Requirements
    if (lower.includes("require") || lower.includes("must have") || lower.includes("specification")) {
      items.push({
        id: `req-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        type: 'REQUIREMENT',
        content: text,
        confidenceScore: 0.91,
        detectedAt: new Date().toISOString(),
        speakerName
      });
    }

    // 5. Bugs
    if (lower.includes("bug") || lower.includes("error") || lower.includes("failure") || lower.includes("issue")) {
      items.push({
        id: `bug-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        type: 'BUG',
        content: text,
        module: 'Core System',
        confidenceScore: 0.90,
        detectedAt: new Date().toISOString(),
        speakerName
      });
    }

    return items;
  }
}

export class MeetingContextEngine {
  private contexts = new Map<string, MeetingContext>();
  private analyzer = new RealtimeAnalyzer();

  getContext(meetingId: string): MeetingContext {
    let ctx = this.contexts.get(meetingId);
    if (!ctx) {
      ctx = {
        meetingId,
        projectKey: 'BRH',
        participants: [],
        currentTopics: ['Architecture', 'Azure AD', 'Teams Manifest'],
        decisions: [],
        openActions: [],
        risks: [],
        requirements: [],
        bugs: []
      };
      this.contexts.set(meetingId, ctx);
    }
    return ctx;
  }

  async processSegment(segment: TranscriptSegment): Promise<{ items: IntelligenceItem[]; context: MeetingContext }> {
    const ctx = this.getContext(segment.meetingId);
    if (!ctx.participants.includes(segment.speaker)) {
      ctx.participants.push(segment.speaker);
    }

    const items = this.analyzer.analyzeText(segment.text, segment.speaker);

    for (const item of items) {
      if (item.type === 'DECISION') ctx.decisions.push(item);
      else if (item.type === 'ACTION_ITEM') {
        ctx.openActions.push(item);
        // Auto Sync with Jira Plugin
        await pluginManager.executePluginAction('Jira Issue Creator Plugin', 'CREATE_ISSUE', {
          title: item.content,
          projectKey: ctx.projectKey
        });
      }
      else if (item.type === 'RISK') ctx.risks.push(item);
      else if (item.type === 'REQUIREMENT') ctx.requirements.push(item);
      else if (item.type === 'BUG') ctx.bugs.push(item);
    }

    return { items, context: ctx };
  }
}

export const realtimeAnalyzer = new RealtimeAnalyzer();
export const meetingContextEngine = new MeetingContextEngine();
